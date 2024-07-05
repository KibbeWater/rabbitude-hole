import { randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { db } from '~/server/db';
import { devices } from '~/server/db/schema';
import { generateLinkingCode } from '~/server/utils';

async function linkDevice(req: NextRequest) {
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
    const { code, userId, deviceId /* , _rabbitudeWsUrl */ } = query.data;

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

    return Response.json({
        // We assign the same userIds to comply with rabbits original rabbithole api
        actualUserId: userId,
        userId,
    });
}

export { linkDevice as GET };
