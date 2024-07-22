import { clerkClient } from '@clerk/nextjs/server';
import { and, count, desc, eq, gt, min, sql } from 'drizzle-orm';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { devices, journalEntries } from '~/server/db/schema';

export const journalRouter = createTRPCRouter({
    getEntries: protectedProcedure
        .input(
            z.object({
                cursor: z.number().nullish(),
                limit: z.number().min(1).max(100).default(10),
            }),
        )
        .query(async ({ ctx, input: { limit, cursor } }) => {
            const items = await ctx.db
                .select({
                    id: journalEntries.id,
                    entryType: journalEntries.entryType,
                    title: journalEntries.title,
                    text: journalEntries.text,
                    metadata: journalEntries.metadata,
                    createdAt: journalEntries.createdAt,
                    userId: devices.userId,
                })
                .from(journalEntries)
                .leftJoin(devices, eq(journalEntries.deviceId, devices.id))
                .where(
                    cursor
                        ? and(gt(journalEntries.id, cursor), eq(devices.userId, ctx.auth.userId))
                        : eq(devices.userId, ctx.auth.userId),
                )
                .orderBy(desc(journalEntries.createdAt));
            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
        }),
    getEntry: protectedProcedure.input(z.number()).query(async ({ ctx, input }) => {
        const [entry, user] = await Promise.all([
            await ctx.db
                .select({
                    id: journalEntries.id,
                    entryType: journalEntries.entryType,
                    title: journalEntries.title,
                    text: journalEntries.text,
                    metadata: journalEntries.metadata,
                    createdAt: journalEntries.createdAt,
                    userId: devices.userId,
                })
                .from(journalEntries)
                .leftJoin(devices, eq(journalEntries.deviceId, devices.id))
                .limit(1)
                .where(and(eq(devices.userId, ctx.auth.userId), eq(journalEntries.id, input))),
            await clerkClient().users.getUser(ctx.auth.userId),
        ]);

        return entry[0] ? { ...entry[0], deviceName: user.username } : undefined;
    }),
    getMonthly: protectedProcedure.query(async ({ ctx }) => {
        const entries = await ctx.db
            .select({
                year: sql`date_part('year', ${journalEntries.createdAt})`.as('year'),
                month: sql`date_part('month', ${journalEntries.createdAt})`.as('month'),
                day: sql`date_part('day', ${journalEntries.createdAt})`.as('day'),
                date: min(journalEntries.createdAt),
                count: count(),
            })
            .from(journalEntries)
            .leftJoin(devices, eq(journalEntries.deviceId, devices.id))
            .where(eq(devices.userId, ctx.auth.userId))
            .orderBy(desc(sql`year`), desc(sql`month`), desc(sql`day`))
            .groupBy(sql`year`, sql`month`, sql`day`);

        return entries.map((entry) => ({
            date: entry.date!,
            count: entry.count,
        }));
    }),
});
