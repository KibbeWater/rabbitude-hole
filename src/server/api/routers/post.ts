import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';

export const postRouter = createTRPCRouter({
    getLatest: publicProcedure.query(({ ctx }) => {
        return ctx.db.query.posts.findFirst({
            orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        });
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return 'you can now see this secret message!';
    }),
});
