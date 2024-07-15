import { z } from 'zod';

export const journalTypeSchema = z.enum(['text', 'meeting', 'vision', 'note']);
export type JournalType = z.infer<typeof journalTypeSchema>;

export const textShape = z.object({
    type: z.preprocess(() => 'text', z.string()),
    voice_mode: z.boolean().default(false),
    response: z.string(),
});
export type JournalTextEntry = z.infer<typeof textShape>;
