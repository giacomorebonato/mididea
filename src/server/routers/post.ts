import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const postRouter = router({
  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    })
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        authorId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.create({ data: input })
    }),

  publish: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.post.update({
        where: { id: input.id },
        data: { published: true },
      })
    }),
})
