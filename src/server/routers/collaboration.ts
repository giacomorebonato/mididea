import { randomBytes } from 'node:crypto'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  type CompositionChange,
  collaborationEvents,
  getPresence,
  iterableFromEvent,
  joinPresence,
  leavePresence,
  type PresenceEvent,
} from '../collaboration-events'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const collaborationRouter = router({
  invite: protectedProcedure
    .input(
      z.object({
        compositionId: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No user found with that email.',
        })
      }

      if (user.id === ctx.session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot invite yourself.',
        })
      }

      const existing = await ctx.prisma.collaborator.findUnique({
        where: {
          compositionId_userId: {
            compositionId: input.compositionId,
            userId: user.id,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This user is already a collaborator.',
        })
      }

      const pending = await ctx.prisma.invitation.findFirst({
        where: {
          compositionId: input.compositionId,
          inviteeEmail: input.email,
          status: 'pending',
        },
      })

      if (pending) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A pending invitation already exists for this user.',
        })
      }

      const token = randomBytes(32).toString('hex')

      return ctx.prisma.invitation.create({
        data: {
          compositionId: input.compositionId,
          inviterId: ctx.session.user.id,
          inviteeEmail: input.email,
          token,
          status: 'pending',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
      })

      if (!invitation || invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or already processed.',
        })
      }

      if (invitation.expiresAt < new Date()) {
        await ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'expired' },
        })
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired.',
        })
      }

      if (invitation.inviteeEmail !== ctx.session.user.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for you.',
        })
      }

      await ctx.prisma.$transaction([
        ctx.prisma.collaborator.create({
          data: {
            compositionId: invitation.compositionId,
            userId: ctx.session.user.id,
          },
        }),
        ctx.prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: 'accepted' },
        }),
      ])

      return { ok: true, compositionId: invitation.compositionId }
    }),

  declineInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: { token: input.token },
      })

      if (!invitation || invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found or already processed.',
        })
      }

      if (invitation.inviteeEmail !== ctx.session.user.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This invitation is not for you.',
        })
      }

      await ctx.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'declined' },
      })

      return { ok: true }
    }),

  pendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.invitation.findMany({
      where: {
        inviteeEmail: ctx.session.user.email,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        composition: {
          select: { id: true, title: true },
        },
        inviter: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  sentInvitations: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.invitation.findMany({
        where: { compositionId: input.compositionId },
        include: {
          inviter: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  /** Remove a collaborator from a composition */
  remove: protectedProcedure
    .input(
      z.object({
        compositionId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition || composition.authorId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      return ctx.prisma.collaborator.delete({
        where: {
          compositionId_userId: {
            compositionId: input.compositionId,
            userId: input.userId,
          },
        },
      })
    }),

  /** List collaborators for a composition */
  list: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const composition = await ctx.prisma.composition.findUnique({
        where: { id: input.compositionId },
      })

      if (!composition) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Only owner or collaborators can see the list
      const isOwner = composition.authorId === ctx.session.user.id
      if (!isOwner) {
        const isCollaborator = await ctx.prisma.collaborator.findUnique({
          where: {
            compositionId_userId: {
              compositionId: input.compositionId,
              userId: ctx.session.user.id,
            },
          },
        })
        if (!isCollaborator) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      return ctx.prisma.collaborator.findMany({
        where: { compositionId: input.compositionId },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      })
    }),

  /** List compositions shared with the current user */
  sharedWithMe: protectedProcedure.query(async ({ ctx }) => {
    const collaborations = await ctx.prisma.collaborator.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        composition: {
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return collaborations.map((c) => c.composition)
  }),

  /** Push a sequencer action to all other collaborators */
  pushChange: protectedProcedure
    .input(
      z.object({
        compositionId: z.string(),
        clientId: z.string(),
        action: z.unknown(),
      }),
    )
    .mutation(({ input }) => {
      collaborationEvents.emit(`change:${input.compositionId}`, {
        clientId: input.clientId,
        action: input.action,
      } satisfies CompositionChange)
      return { ok: true }
    }),

  /** Subscribe to composition changes from other collaborators */
  onCompositionChange: publicProcedure
    .input(z.object({ compositionId: z.string() }))
    .subscription(async function* ({ input, signal }) {
      const abortSignal = signal ?? AbortSignal.timeout(3_600_000)
      yield* iterableFromEvent<CompositionChange>(
        collaborationEvents,
        `change:${input.compositionId}`,
        abortSignal,
      )
    }),

  /** Subscribe to presence changes (join/leave) for a composition */
  onPresenceChange: publicProcedure
    .input(z.object({ compositionId: z.string() }))
    .subscription(async function* ({ input, signal }) {
      const abortSignal = signal ?? AbortSignal.timeout(3_600_000)
      yield* iterableFromEvent<PresenceEvent>(
        collaborationEvents,
        `presence:${input.compositionId}`,
        abortSignal,
      )
    }),

  /** Join a composition session (signals presence) */
  joinSession: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .mutation(({ ctx, input }) => {
      const userName = ctx.session.user.name ?? 'Anonymous'
      joinPresence(input.compositionId, ctx.session.user.id, userName)
      return { ok: true }
    }),

  /** Leave a composition session */
  leaveSession: protectedProcedure
    .input(z.object({ compositionId: z.string() }))
    .mutation(({ ctx, input }) => {
      const userName = ctx.session.user.name ?? 'Anonymous'
      leavePresence(input.compositionId, ctx.session.user.id, userName)
      return { ok: true }
    }),

  /** Get current presence for a composition */
  getPresence: publicProcedure
    .input(z.object({ compositionId: z.string() }))
    .query(({ input }) => {
      return getPresence(input.compositionId)
    }),
})
