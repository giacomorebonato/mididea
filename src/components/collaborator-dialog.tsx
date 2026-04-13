import { useState } from 'react'
import { trpc } from '@/client/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  accepted: 'text-green-600',
  declined: 'text-red-600',
  expired: 'text-muted-foreground',
}

interface CollaboratorDialogProps {
  compositionId: string
}

export function CollaboratorDialog({ compositionId }: CollaboratorDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const utils = trpc.useUtils()

  const { data: collaborators = [], isLoading } =
    trpc.collaboration.list.useQuery({ compositionId }, { enabled: open })

  const { data: sentInvitations = [] } =
    trpc.collaboration.sentInvitations.useQuery(
      { compositionId },
      { enabled: open },
    )

  const invite = trpc.collaboration.invite.useMutation({
    onSuccess: () => {
      setEmail('')
      setError('')
      utils.collaboration.list.invalidate({ compositionId })
      utils.collaboration.sentInvitations.invalidate({ compositionId })
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const remove = trpc.collaboration.remove.useMutation({
    onSuccess: () => {
      utils.collaboration.list.invalidate({ compositionId })
    },
  })

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Collaborators
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold">Manage Collaborators</h2>

            <div className="space-y-2">
              <Label htmlFor="collab-email">Invite by email</Label>
              <div className="flex gap-2">
                <Input
                  id="collab-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && email.trim()) {
                      invite.mutate({ compositionId, email: email.trim() })
                    }
                  }}
                />
                <Button
                  size="sm"
                  disabled={!email.trim() || invite.isPending}
                  onClick={() =>
                    invite.mutate({ compositionId, email: email.trim() })
                  }
                >
                  {invite.isPending ? '...' : 'Invite'}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="space-y-1">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : collaborators.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collaborators yet.
                </p>
              ) : (
                collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.user.name ?? c.user.email}
                      </p>
                      {c.user.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {c.user.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive shrink-0"
                      disabled={remove.isPending}
                      onClick={() =>
                        remove.mutate({ compositionId, userId: c.user.id })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>

            {sentInvitations.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Pending Invitations</p>
                {sentInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
                  >
                    <p className="text-sm truncate">{inv.inviteeEmail}</p>
                    <span
                      className={`text-xs font-medium ${STATUS_COLORS[inv.status] ?? ''}`}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
