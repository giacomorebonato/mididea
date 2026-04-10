import { EventEmitter } from 'node:events'

/** Singleton event bus for broadcasting composition changes between connected clients */
export const collaborationEvents = new EventEmitter()
collaborationEvents.setMaxListeners(200)

export interface CompositionChange {
  clientId: string
  action: unknown // SequencerAction — kept as unknown on server side
}

export interface PresenceEvent {
  userId: string
  userName: string
  type: 'join' | 'leave'
}

/** Create an async iterable from an EventEmitter event, yielding values until the signal aborts */
export async function* iterableFromEvent<T>(
  emitter: EventEmitter,
  event: string,
  signal: AbortSignal,
): AsyncIterable<T> {
  const queue: T[] = []
  let waitResolve: (() => void) | null = null

  const listener = (data: T) => {
    queue.push(data)
    if (waitResolve) {
      waitResolve()
      waitResolve = null
    }
  }

  emitter.on(event, listener)

  try {
    while (!signal.aborted) {
      if (queue.length > 0) {
        yield queue.shift()!
      } else {
        await new Promise<void>((resolve) => {
          waitResolve = resolve
          // Also resolve on abort so we can exit the loop
          signal.addEventListener('abort', () => resolve(), { once: true })
        })
      }
    }
  } finally {
    emitter.off(event, listener)
  }
}

// In-memory presence tracking: compositionId -> Set of { userId, userName }
const presenceMap = new Map<string, Map<string, string>>()

export function joinPresence(
  compositionId: string,
  userId: string,
  userName: string,
) {
  if (!presenceMap.has(compositionId)) {
    presenceMap.set(compositionId, new Map())
  }
  presenceMap.get(compositionId)!.set(userId, userName)
  collaborationEvents.emit(`presence:${compositionId}`, {
    userId,
    userName,
    type: 'join',
  } satisfies PresenceEvent)
}

export function leavePresence(
  compositionId: string,
  userId: string,
  userName: string,
) {
  const users = presenceMap.get(compositionId)
  if (users) {
    users.delete(userId)
    if (users.size === 0) presenceMap.delete(compositionId)
  }
  collaborationEvents.emit(`presence:${compositionId}`, {
    userId,
    userName,
    type: 'leave',
  } satisfies PresenceEvent)
}

export function getPresence(
  compositionId: string,
): Array<{ userId: string; userName: string }> {
  const users = presenceMap.get(compositionId)
  if (!users) return []
  return Array.from(users.entries()).map(([userId, userName]) => ({
    userId,
    userName,
  }))
}
