import { clerkClient } from '@clerk/nextjs/server';
import { waitUntil } from '@vercel/functions';
import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';
import { WebSocket } from 'ws';
import { z } from 'zod';
import { env } from '~/env';

import { db } from '~/server/db';
import { devices } from '~/server/db/schema';
import { generateBackendAuthToken, generateLinkingCode } from '~/server/utils';

// Max Hobby plan function runtime duration, as per documented @ https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 60; // 60 seconds

async function linkDevice(req: NextRequest) {
    const start = Date.now();

    // use zod to validate the query
    const schema = z.object({
        code: z.string(),
        userId: z.string(),
        deviceId: z.string(),
        _rabbitudeWsUrl: z.string(),
    });

    // Probably a better way to do this, but this worked at least so w/e
    const q: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => {
        q[key] = value;
    });

    const query = schema.safeParse(q);

    if (!query.success) {
        return Response.json({ error: query.error.format() }, { status: 400 });
    }

    // _rabbitudeWsUrl is passed by the rabbitude-launcher but is not used atm
    const { code, userId, deviceId, _rabbitudeWsUrl } = query.data;

    const validLinkingCode = generateLinkingCode(userId);
    console.log('Valid linking code', validLinkingCode);
    if (code !== validLinkingCode.hash) {
        return Response.json({ error: 'Invalid linking code' }, { status: 400 });
    }

    // Generate accountKey (random sha256 hash)
    const accountKey = randomBytes(32).toString('hex');

    const [res, user] = await Promise.all([
        db
            .insert(devices)
            .values({
                userId,
                imei: deviceId,
                accountKey,
            })
            .onConflictDoNothing()
            .returning({ insertedId: devices.id }),
        clerkClient().users.getUser(userId),
    ]);
    console.log(res);
    if (res.length === 0) return Response.json({ error: 'Device already linked' }, { status: 400 });

    // We will return a response with the authentication information to resolve the request quickly
    // However, we still need to inform the server about our existence, we will use remaining time to connect and notify the backend of the dashboard URL
    waitUntil(
        new Promise<void>((resolve) => {
            // Runtime remaining
            let remaining = maxDuration * 1000 - (Date.now() - start);
            remaining -= 1000; // Give us a second headroom to finish up in worst case scenario

            const ws = new WebSocket(_rabbitudeWsUrl);
            let resolved = false;

            ws.on('open', () => {
                ws.send(
                    JSON.stringify({
                        global: {
                            web_authenticate: {
                                key: generateBackendAuthToken(deviceId),
                                api_url: env.VERCEL_URL + '/api/journal',
                            },
                        },
                    }),
                );
            });

            ws.on('error', (err) => {
                console.error('Failed to notify backend of dashboard URL', { userId, deviceId, error: err });
                ws.close();
                resolve();
            });

            ws.on('close', () => {
                console.error('Failed to notify backend of dashboard URL', { userId, deviceId, error: 'Closed' });
                resolve();
            });

            ws.on('message', (data, isBinary) => {
                if (isBinary) {
                    console.error('Failed to notify backend of dashboard URL', {
                        userId,
                        deviceId,
                        error: 'Binary data',
                    });
                    ws.close();
                    resolve();
                    return;
                }

                // {global: {web_authenticate: {success: boolean}}
                const schema = z.object({
                    global: z.object({
                        web_authenticate: z.object({
                            success: z.boolean(),
                        }),
                    }),
                });

                // Get the string data and parse it as JSON
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const jsonData = data.toString();

                const parsed = schema.safeParse(JSON.parse(jsonData));

                if (!parsed.success) {
                    console.error('Failed to notify backend of dashboard URL', {
                        userId,
                        deviceId,
                        error: 'Invalid JSON',
                    });
                    ws.close();
                    resolve();
                    return;
                }

                if (!parsed.data.global.web_authenticate.success) {
                    console.error('Failed to notify backend of dashboard URL', { userId, deviceId, error: 'Failed' });
                    ws.close();
                    resolve();
                    return;
                }

                resolved = true;
                console.log('Successfully notified backend of dashboard URL', { userId, deviceId });
                ws.close();
                resolve();
            });

            setTimeout(() => {
                if (resolved) return;
                console.error('Failed to notify backend of dashboard URL', { userId, deviceId, error: 'Timeout' });
                ws.close();
                resolve();
            }, remaining);
        }),
    );

    return Response.json({
        // We assign the same userIds to comply with rabbits original rabbithole api
        actualUserId: userId,
        userId,
        accountKey,
        userName: user.username ?? 'unk',
    });
}

export { linkDevice as GET };
