import { useState } from 'react'
import { authClient } from '@/client/auth'
import type { SequencerState } from '@/client/sequencer/types'
import { trpc } from '@/client/trpc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthInline } from './auth-inline'

const TRANSIENT_KEYS = ['isPlaying', 'currentStep', 'activeXyPad'] as const

function stripTransient(state: SequencerState): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...state }
  for (const key of TRANSIENT_KEYS) {
    delete copy[key]
  }
  return copy
}

interface SaveCompositionDialogProps {
  state: SequencerState
}

export function SaveCompositionDialog({ state }: SaveCompositionDialogProps) {
  const [open, setOpen] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const session = authClient.useSession()
  const userId = session.data?.user?.id
  const utils = trpc.useUtils()

  const { data: myCompositions } = trpc.composition.mine.useQuery(undefined, {
    enabled: !!userId,
  })

  const save = trpc.composition.create.useMutation({
    onSuccess: () => {
      setOpen(false)
      setTitle('')
      setError('')
      utils.composition.mine.invalidate()
      utils.composition.list.invalidate()
    },
    onError: (err) => {
      setError(err.message)
    },
  })

  const count = myCompositions?.length ?? 0

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          if (!userId) {
            setNeedsAuth(true)
          } else {
            setOpen(true)
          }
        }}
      >
        Save{userId ? ` (${count}/5)` : ''}
      </Button>

      {needsAuth && !userId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setNeedsAuth(false)}
        >
          <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Sign in to save</h2>
            <AuthInline
              onSuccess={() => {
                setNeedsAuth(false)
                setOpen(true)
              }}
            />
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-card border rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-semibold">Save Composition</h2>

            {count >= 5 ? (
              <p className="text-sm text-destructive">
                You've reached the limit of 5 compositions. Delete one from the
                Creations page first.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="comp-title">Title</Label>
                  <Input
                    id="comp-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My awesome beat"
                    maxLength={100}
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!title.trim() || save.isPending}
                    onClick={() =>
                      save.mutate({
                        title: title.trim(),
                        data: JSON.stringify(stripTransient(state)),
                      })
                    }
                  >
                    {save.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
