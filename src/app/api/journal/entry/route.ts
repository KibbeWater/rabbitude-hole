import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '~/server/db';
import { journalEntries } from '~/server/db/schema';

const textShape = z.object({
    type: z.literal('text'),
    title: z.string(),
    text: z.string(),
});

const meetingShape = z.object({
    title: z.string(),
    audio: z.string(),
    transcript: z.string(),
});

async function submitJournalEntry(req: NextRequest) {
    const journalTypes = z.enum(['text', 'meeting', 'vision', 'note']);

    const bodySchema = z.object({
        type: journalTypes,
        data: z.string(),
    });

    const headerSchema = z.object({
        ['Device-Id']: z.string(),
        ['Account-Key']: z.string(),
    });

    const body = bodySchema.safeParse(req.body);
    if (!body.success) return Response.json({ error: body.error.format() }, { status: 400 });

    const headers = headerSchema.safeParse(req.headers);
    if (!headers.success) return Response.json({ error: headers.error.format() }, { status: 400 });

    const device = await db.query.devices.findFirst({
        where: (device, { and, eq }) =>
            and(eq(device.imei, headers.data['Device-Id']), eq(device.accountKey, headers.data['Account-Key'])),
    });
    if (!device) return Response.json({ error: 'Invalid device' }, { status: 400 });

    let entryType: string;
    let entryText: string;
    let entryData;
    switch (body.data.type) {
        case 'text':
            entryType = 'text';
            // entry data is a json object base64 decoded of shape { title: string, text: string }
            const textShape = z.object({
                type: z.literal('text'),
                title: z.string(),
                text: z.string(),
            });
            entryData = textShape.safeParse(body.data.data);
            break;
        case 'meeting':
            entryType = 'meeting';
            // entry data is a json object base64 decoded of shape { title: string, audio: string, transcript: string }

            break;
        case 'vision':
            entryType = 'vision';
            break;
        case 'note':
            entryType = 'note';
            break;
        default:
            return Response.json({ error: 'Invalid entry type' }, { status: 400 });
    }

    const entry = await db
        .insert(journalEntries)
        .values({
            entryType: entryType,
            userId: device.userId,
            deviceId: device.id,
        })
        .run();
    if (entry.rowsAffected === 0) return Response.json({ error: 'Failed to create entry' }, { status: 500 });
    else return Response.json({ id: entry.lastInsertRowid });
}

export { submitJournalEntry as POST };
