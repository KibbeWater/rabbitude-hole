import { waitUntil } from '@vercel/functions';
import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';
import { WebSocket } from 'ws';
import { z } from 'zod';
import { env } from '~/env';

import { db } from '~/server/db';
import { devices } from '~/server/db/schema';
import { generateLinkingCode } from '~/server/utils';

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

    if (code !== validLinkingCode.hash) {
        return Response.json({ error: 'Invalid linking code' }, { status: 400 });
    }

    // Generate accountKey (random sha256 hash)
    const accountKey = randomBytes(32).toString('hex');

    const res = await db
        .insert(devices)
        .values({
            userId,
            imei: deviceId,
            accountKey,
        })
        .onConflictDoNothing();

    if (res.rowsAffected === 0) return Response.json({ error: 'Device already linked' }, { status: 400 });

    // We will return a response with the authentication information to resolve the request quickly
    // However, we still need to inform the server about our existence, we will use remaining time to connect and notify the backend of the dashboard URL
    waitUntil(
        new Promise<void>((resolve) => {
            // Runtime remaining
            let remaining = maxDuration - (Date.now() - start);
            remaining -= 1000; // Give us a second headroom to finish up in worst case scenario

            const ws = new WebSocket(_rabbitudeWsUrl);

            ws.on('open', () => {
                // return {global: {web_authenticate: {key: string, api_url: string}}}

                ws.send(
                    JSON.stringify({
                        global: {
                            web_authenticate: {
                                key: accountKey,
                                api_url: env.VERCEL_URL,
                            },
                        },
                    }),
                );
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

                console.log('Successfully notified backend of dashboard URL', { userId, deviceId });
                ws.close();
                resolve();
            });

            setTimeout(() => {
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
    });
}

export { linkDevice as GET };
