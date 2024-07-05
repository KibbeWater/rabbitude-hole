import { sql } from 'drizzle-orm';
import { index, int, sqliteTableCreator, text } from 'drizzle-orm/sqlite-core';

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
        updatedAt: int('updatedAt', { mode: 'timestamp' }),
    },
    (example) => ({
        imeiIndex: index('imei_idx').on(example.imei),
        userIndex: index('user_idx').on(example.userId),
        accountKeyIndex: index('account_key_idx').on(example.accountKey),
    }),
);
