import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      include: { posts: { where: { published: true } } },
    })
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: { id: input.id },
        include: { posts: true },
      })
    }),

  create: publicProcedure
    .input(z.object({ email: z.email(), name: z.string().optional() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({ data: input })
    }),
})
