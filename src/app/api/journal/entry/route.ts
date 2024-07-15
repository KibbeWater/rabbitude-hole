import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { db } from '~/server/db';
import { journalEntries } from '~/server/db/schema';
import { type JournalTextEntry, journalTypeSchema, textShape } from '~/types/journal';

async function submitJournalEntry(req: NextRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await req.json();

    const bodySchema = z.object({
        type: journalTypeSchema,
        title: z.string(),
        data: z.string(),
    });

    const deviceId: string | undefined = req.headers.get('device-id') ?? undefined;
    const accountKey: string | undefined = req.headers.get('account-key') ?? undefined;

    const body = bodySchema.safeParse(data);
    if (!body.success) return Response.json({ error: body.error.format() }, { status: 400 });

    if (!deviceId || !accountKey) return Response.json({ error: 'Missing headers' }, { status: 400 });

    const device = await db.query.devices.findFirst({
        where: (device, { and, eq }) => and(eq(device.imei, deviceId), eq(device.accountKey, accountKey)),
    });
    if (!device) return Response.json({ error: 'Invalid device' }, { status: 400 });

    let entryData: JournalTextEntry | undefined;
    switch (body.data.type) {
        case 'text':
            const parsed = textShape.safeParse(JSON.parse(body.data.data.replaceAll('\\"', '"')));
            if (!parsed.success) return Response.json({ error: parsed.error.format() }, { status: 400 });
            entryData = parsed.data;
            break;
        case 'meeting':
            throw new Error('Not yet implemented');
        case 'vision':
            throw new Error('Not yet implemented');
        case 'note':
            throw new Error('Not yet implemented');
        default:
            return Response.json({ error: 'Invalid entry type' }, { status: 400 });
    }

    if (!entryData) return Response.json({ error: 'Invalid entry data' }, { status: 400 });

    const entry = await db
        .insert(journalEntries)
        .values({
            deviceId: device.id,
            entryType: body.data.type,
            title: body.data.title,
            text: entryData.response,
            metadata: entryData,
        })
        .returning({ insertedId: journalEntries.id });
    return Response.json({ success: true, id: entry[entry.length - 1]?.insertedId ?? -1 });
}

export { submitJournalEntry as POST };
