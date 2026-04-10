import { useCallback, useEffect, useRef } from 'react'
import { trpc } from '../trpc'
import type { SequencerAction } from './types'
import { TRANSIENT_ACTION_TYPES } from './types'

const CLIENT_ID = crypto.randomUUID()

interface UseCollaborationOptions {
  compositionId: string
  enabled: boolean
  dispatch: React.Dispatch<SequencerAction>
}

export function useCollaboration({
  compositionId,
  enabled,
  dispatch,
}: UseCollaborationOptions) {
  const pushChange = trpc.collaboration.pushChange.useMutation()
  const joinSession = trpc.collaboration.joinSession.useMutation()
  const leaveSession = trpc.collaboration.leaveSession.useMutation()
  const joinedRef = useRef(false)
  const joinRef = useRef(joinSession.mutate)
  const leaveRef = useRef(leaveSession.mutate)
  joinRef.current = joinSession.mutate
  leaveRef.current = leaveSession.mutate

  // Subscribe to remote changes
  trpc.collaboration.onCompositionChange.useSubscription(
    { compositionId },
    {
      enabled,
      onData: (change) => {
        // Ignore own changes
        if (change.clientId === CLIENT_ID) return
        dispatch({
          type: 'REMOTE_ACTION',
          action: change.action as SequencerAction,
        })
      },
    },
  )

  // Join/leave presence
  useEffect(() => {
    if (!enabled) return
    if (!joinedRef.current) {
      joinRef.current({ compositionId })
      joinedRef.current = true
    }
    return () => {
      if (joinedRef.current) {
        leaveRef.current({ compositionId })
        joinedRef.current = false
      }
    }
  }, [compositionId, enabled])

  // Broadcast local actions
  const broadcastAction = useCallback(
    (action: SequencerAction) => {
      if (!enabled) return
      if (TRANSIENT_ACTION_TYPES.has(action.type)) return
      pushChange.mutate({
        compositionId,
        clientId: CLIENT_ID,
        action,
      })
    },
    [compositionId, enabled, pushChange],
  )

  return { broadcastAction, clientId: CLIENT_ID }
}
