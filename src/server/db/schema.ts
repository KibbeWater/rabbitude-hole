import { relations } from 'drizzle-orm';
import { pgTableCreator, text, integer, index, jsonb, serial, varchar, pgEnum, timestamp } from 'drizzle-orm/pg-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `rabbitude-hole_${name}`);

export const devices = createTable(
    'device',
    {
        id: serial('id').primaryKey(),
        userId: varchar('user_id', { length: 32 }).unique().notNull(),
        imei: varchar('imei', { length: 256 }).unique().notNull(),
        accountKey: varchar('account_key', { length: 64 }).unique().notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (example) => ({
        imeiIndex: index('imei_idx').on(example.imei),
        userIndex: index('user_idx').on(example.userId),
        accountKeyIndex: index('account_key_idx').on(example.accountKey),
    }),
);

export const deviceRelations = relations(devices, ({ many }) => ({
    entries: many(journalEntries),
}));

export const entryEnum = pgEnum('journal_entry_type', ['text', 'meeting', 'vision', 'note']);

export const journalEntries = createTable(
    'journal_entry',
    {
        id: serial('id').primaryKey(),
        deviceId: integer('device_id').notNull(),
        userId: varchar('user_id', { length: 32 }).notNull(),
        entryType: entryEnum('entry_type').notNull(),
        title: text('title'),
        text: text('text'),
        metadata: jsonb('metadata').$type<{ type: string; [key: string]: unknown }>(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (example) => ({
        deviceIndex: index('device_idx').on(example.deviceId),
        journalUserIndex: index('journal_user_idx').on(example.userId),
    }),
);

export const journalRelations = relations(journalEntries, ({ many, one }) => ({
    resources: many(journalResources),
    device: one(devices, {
        fields: [journalEntries.deviceId],
        references: [devices.id],
    }),
}));

export const journalResourceEnum = pgEnum('journal_resource_type', ['image', 'magicImage', 'audio', 'video']);

export const journalResources = createTable(
    'journal_resource',
    {
        id: serial('id').primaryKey(),
        journalEntryId: integer('journal_entry_id').notNull(),
        type: journalResourceEnum('type').notNull(),
        url: text('url').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    },
    (example) => ({
        journalEntryIndex: index('journal_entry_idx').on(example.journalEntryId),
        uniqueResourceType: index('journal_resource_type_idx').on(example.journalEntryId, example.type),
    }),
);

export const journalResourceRelations = relations(journalResources, ({ one }) => ({
    entry: one(journalEntries, {
        fields: [journalResources.journalEntryId],
        references: [journalEntries.id],
    }),
}));
