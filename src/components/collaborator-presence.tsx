import { useEffect, useState } from 'react'
import { trpc } from '@/client/trpc'

interface CollaboratorPresenceProps {
  compositionId: string
  enabled: boolean
}

interface PresenceUser {
  userId: string
  userName: string
}

export function CollaboratorPresence({
  compositionId,
  enabled,
}: CollaboratorPresenceProps) {
  const [users, setUsers] = useState<PresenceUser[]>([])

  const { data: initialPresence } = trpc.collaboration.getPresence.useQuery(
    { compositionId },
    { enabled },
  )

  useEffect(() => {
    if (initialPresence) {
      setUsers(initialPresence)
    }
  }, [initialPresence])

  trpc.collaboration.onPresenceChange.useSubscription(
    { compositionId },
    {
      enabled,
      onData: (event) => {
        setUsers((prev) => {
          if (event.type === 'join') {
            if (prev.some((u) => u.userId === event.userId)) return prev
            return [...prev, { userId: event.userId, userName: event.userName }]
          }
          return prev.filter((u) => u.userId !== event.userId)
        })
      },
    },
  )

  if (!enabled || users.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      {users.map((u) => (
        <div
          key={u.userId}
          className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-0.5"
          title={u.userName}
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {u.userName}
          </span>
        </div>
      ))}
    </div>
  )
}
