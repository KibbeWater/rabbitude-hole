import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { generateLinkingCode } from '~/server/utils';

export const deviceRouter = createTRPCRouter({
    getDevice: protectedProcedure.query(({ ctx }) => {
        return ctx.db.query.devices.findFirst({
            where: (users, { eq }) => eq(users.userId, ctx.auth.userId),
        });
    }),

    getLinkingCode: protectedProcedure.query(({ ctx }) => {
        const { hash, expiration } = generateLinkingCode(ctx.auth.userId);

        return {
            hash,
            expiration,
        };
    }),
});
