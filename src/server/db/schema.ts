import { relations, sql } from 'drizzle-orm';
import { blob, index, int, sqliteTableCreator, text } from 'drizzle-orm/sqlite-core';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `rabbitude-hole_${name}`);

export const devices = createTable(
    'device',
    {
        id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
        userId: text('user_id', { length: 32 }).unique().notNull(),
        imei: text('imei', { length: 256 }).unique().notNull(),
        accountKey: text('account_key', { length: 64 }).unique().notNull(),
        createdAt: int('created_at', { mode: 'timestamp' })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
    },
    (example) => ({
        imeiIndex: index('imei_idx').on(example.imei),
        userIndex: index('user_idx').on(example.userId),
        accountKeyIndex: index('account_key_idx').on(example.accountKey),
    }),
);

export const journalEntries = createTable(
    'journal_entry',
    {
        id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
        entryType: text('type', { length: 32 }).notNull(),
        title: text('title', { length: 256 }),
        text: text('text', { length: 4096 }),
        metadata: blob('metadata', { mode: 'json' }).$type<{ type: string; [key: string]: unknown }>(),
        userId: text('user_id', { length: 32 }).notNull(),
        deviceId: int('device_id', { mode: 'number' }).notNull(),
        createdAt: int('created_at', { mode: 'timestamp' })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: int('updatedAt', { mode: 'timestamp' }),
    },
    (example) => ({
        userIndex: index('journal_user_idx').on(example.userId),
        deviceIndex: index('device_idx').on(example.deviceId),
        deviceUserIndex: index('device_user_idx').on(example.deviceId, example.userId),
    }),
);

export const journalRelations = relations(journalEntries, ({ many }) => ({
    resources: many(journalResources),
}));

export const journalResources = createTable(
    'journal_resource',
    {
        id: int('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
        journalEntryId: int('journal_entry_id', { mode: 'number' }).notNull(),
        type: int('type', { mode: 'number' }).notNull(),
        url: text('url', { length: 256 }).notNull(),
        createdAt: int('created_at', { mode: 'timestamp' })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: int('updatedAt', { mode: 'timestamp' }),
    },
    (example) => ({
        journalEntryIndex: index('journal_entry_idx').on(example.journalEntryId),
    }),
);

export const journalResourceRelations = relations(journalResources, ({ one }) => ({
    entry: one(journalEntries, {
        fields: [journalResources.journalEntryId],
        references: [journalEntries.id],
    }),
}));
