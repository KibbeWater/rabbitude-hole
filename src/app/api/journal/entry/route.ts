import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '~/server/db';
import { journalEntries } from '~/server/db/schema';
import { type JournalTextEntry, textShape } from '~/types/journal';

async function submitJournalEntry(req: NextRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await req.json();
    const journalTypes = z.enum(['text', 'meeting', 'vision', 'note']);

    const bodySchema = z.object({
        type: journalTypes,
        title: z.string(),
        data: z.string(),
    });

    const deviceId: string | undefined = req.headers.get('device-id') ?? undefined;
    const accountKey: string | undefined = req.headers.get('account-key') ?? undefined;

    const body = bodySchema.safeParse(data);
    console.log(body);
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
            entryType: entryData.type,
            userId: device.userId,
            deviceId: device.id,

            title: body.data.title,
            text: entryData.response,
            metadata: { type: entryData.type, voice_mode: entryData.voice_mode, response: entryData.response },
        })
        .run();
    if (entry.rowsAffected === 0) return Response.json({ error: 'Failed to create entry' }, { status: 500 });
    else return Response.json({ success: true, id: Number(entry.lastInsertRowid) });
}

export { submitJournalEntry as POST };
