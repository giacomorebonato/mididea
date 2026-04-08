import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  COMPOSITION_LIST_LIMIT_DEFAULT,
  COMPOSITION_LIST_LIMIT_MAX,
  COMPOSITION_LIST_LIMIT_MIN,
  MAX_COMPOSITIONS_PER_USER,
} from '../config'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const compositionRouter = router({
  /** List all compositions (public) */
  list: publicProcedure
    .input(
      z
        .object({
          cursor: z.string().optional(),
          limit: z
            .number()
            .min(COMPOSITION_LIST_LIMIT_MIN)
            .max(COMPOSITION_LIST_LIMIT_MAX)
            .default(COMPOSITION_LIST_LIMIT_DEFAULT),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? COMPOSITION_LIST_LIMIT_DEFAULT
      const items = await ctx.prisma.composition.findMany({
        take: limit + 1,
        ...(input?.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      })

      let nextCursor: string | undefined
      if (items.length > limit) {
        const next = items.pop()!
        nextCursor = next.id
      }

      return { items, nextCursor }
    }),

  /** Get a single composition by ID */
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.composition.findUnique({
        where: { id: input.id },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      })
    }),

  /** Get compositions by the current user */
  mine: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.composition.findMany({
      where: { authorId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    })
  }),

  /** Save a new composition (max 5 per user) */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        data: z.string(), // JSON-serialized SequencerState
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const count = await ctx.prisma.composition.count({
        where: { authorId: ctx.session.user.id },
      })

      if (count >= MAX_COMPOSITIONS_PER_USER) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You can save up to ${MAX_COMPOSITIONS_PER_USER} compositions. Delete one to save a new one.`,
        })
      }

      return ctx.prisma.composition.create({
        data: {
          title: input.title,
          data: input.data,
          authorId: ctx.session.user.id,
        },
      })
    }),

  /** Update an existing composition */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        data: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.id },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.composition.update({
        where: { id: input.id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.data !== undefined ? { data: input.data } : {}),
        },
      })
    }),

  /** Delete a composition */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.id },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.composition.delete({ where: { id: input.id } })
    }),

  /** Toggle like on a composition */
  toggleLike: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.like.findUnique({
        where: {
          userId_compositionId: {
            userId: ctx.session.user.id,
            compositionId: input.compositionId,
          },
        },
      })

      if (existing) {
        await ctx.prisma.$transaction([
          ctx.prisma.like.delete({ where: { id: existing.id } }),
          ctx.prisma.composition.update({
            where: { id: input.compositionId },
            data: { likeCount: { decrement: 1 } },
          }),
        ])
        return { liked: false }
      }

      await ctx.prisma.$transaction([
        ctx.prisma.like.create({
          data: {
            userId: ctx.session.user.id,
            compositionId: input.compositionId,
          },
        }),
        ctx.prisma.composition.update({
          where: { id: input.compositionId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      return { liked: true }
    }),

  /** Check which compositions the current user has liked */
  myLikes: protectedProcedure
    .input(z.object({ compositionIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const likes = await ctx.prisma.like.findMany({
        where: {
          userId: ctx.session.user.id,
          compositionId: { in: input.compositionIds },
        },
        select: { compositionId: true },
      })
      return likes.map((l) => l.compositionId)
    }),
})
