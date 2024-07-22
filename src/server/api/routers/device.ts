import { clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { devices } from '~/server/db/schema';
import { generateLinkingCode } from '~/server/utils';

export const deviceRouter = createTRPCRouter({
    getDevice: protectedProcedure.query(async ({ ctx }) => {
        const [d, user] = await Promise.all([
            ctx.db.query.devices.findFirst({
                where: (users, { eq }) => eq(users.userId, ctx.auth.userId),
            }),
            clerkClient().users.getUser(ctx.auth.userId),
        ]);
        if (!d) return null;
        return { ...d, name: user.username };
    }),

    unlinkDevice: protectedProcedure.mutation(async ({ ctx }) => {
        await ctx.db.delete(devices).where(eq(devices.userId, ctx.auth.userId));
    }),

    getLinkingCode: protectedProcedure.query(({ ctx }) => {
        const { hash, expiration } = generateLinkingCode(ctx.auth.userId);

        return {
            hash,
            expiration,
        };
    }),
});
