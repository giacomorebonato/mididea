import { authClient } from '@/client/auth'
import { trpc } from '@/client/trpc'
import { Button } from '@/components/ui/button'

export function InvitationBanner() {
  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const utils = trpc.useUtils()

  const { data: invitations = [] } =
    trpc.collaboration.pendingInvitations.useQuery(undefined, {
      enabled: !!userId,
    })

  const accept = trpc.collaboration.acceptInvitation.useMutation({
    onSuccess: (data) => {
      utils.collaboration.pendingInvitations.invalidate()
      if (data?.compositionId) {
        window.location.href = `/composition/${data.compositionId}`
      }
    },
  })

  const decline = trpc.collaboration.declineInvitation.useMutation({
    onSuccess: () => {
      utils.collaboration.pendingInvitations.invalidate()
    },
  })

  if (!userId || invitations.length === 0) return null

  return (
    <div className="space-y-2">
      {invitations.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">
                {inv.inviter.name ?? 'Someone'}
              </span>{' '}
              invited you to collaborate on{' '}
              <span className="font-medium">{inv.composition.title}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => accept.mutate({ token: inv.token })}
              disabled={accept.isPending}
            >
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => decline.mutate({ token: inv.token })}
              disabled={decline.isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
