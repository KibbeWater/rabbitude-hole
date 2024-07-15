import { clerkClient } from '@clerk/nextjs/server';
import { and, desc, eq, gt } from 'drizzle-orm';
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
            /* const items = await ctx.db.query.journalEntries.findMany({
                where: (entry, { eq, and, gt }) =>
                    !cursor
                        ? and(eq(devices.userId, ctx.auth.userId), eq(entry.deviceId, devices.id))
                        : and(
                              gt(entry.id, cursor),
                              and(eq(devices.userId, ctx.auth.userId), eq(entry.deviceId, devices.id)),
                          ),
                with: {
                    device: {
                        columns: {
                            id: true,
                            userId: true,
                        },
                    },
                },
                limit: limit + 1, // Last item will be used to determine next cursor
                offset: cursor ?? undefined,
                orderBy: desc(journalEntries.createdAt),
            }); */
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
});
