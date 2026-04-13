import { Link, useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { CollaboratorDialog } from '@/components/collaborator-dialog'
import { CollaboratorPresence } from '@/components/collaborator-presence'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { authClient } from '../auth'
import { AudioEngine } from '../sequencer/audio/audio-engine'
import { LandscapePrompt } from '../sequencer/landscape-prompt'
import { exportMidi } from '../sequencer/midi-export'
import { useOrientation } from '../sequencer/orientation-context'
import { SequencerControls } from '../sequencer/sequencer-controls'
import { SequencerGrid } from '../sequencer/sequencer-grid'
import type { SequencerAction } from '../sequencer/types'
import { TRANSIENT_ACTION_TYPES } from '../sequencer/types'
import { useCollaboration } from '../sequencer/use-collaboration'
import { useSequencer } from '../sequencer/use-sequencer'
import { XyPad } from '../sequencer/xy-pad'
import { trpc } from '../trpc'

export function CompositionPage() {
  const { compositionId } = useParams({ strict: false }) as {
    compositionId: string
  }
  const {
    data: composition,
    isLoading,
    error,
  } = trpc.composition.byId.useQuery(
    { id: compositionId },
    { enabled: !!compositionId },
  )

  const session = authClient.useSession()
  const userId = session.data?.user?.id

  const [state, rawDispatch] = useSequencer()
  const engineRef = useRef<AudioEngine | null>(null)
  const loadedRef = useRef<string | null>(null)
  const { isMobileLandscape, isMobilePortrait } = useOrientation()

  const isOwner = !!userId && composition?.authorId === userId
  const isCollaborator =
    !!userId && !!composition?.collaborators?.some((c) => c.user.id === userId)
  const canEdit = isOwner || isCollaborator

  // Real-time collaboration
  const { broadcastAction } = useCollaboration({
    compositionId,
    enabled: canEdit,
    dispatch: rawDispatch,
  })

  // Wrapped dispatch that broadcasts non-transient actions
  const dispatch = useMemo(() => {
    if (!canEdit) return rawDispatch
    return (action: SequencerAction) => {
      rawDispatch(action)
      if (!TRANSIENT_ACTION_TYPES.has(action.type)) {
        broadcastAction(action)
      }
    }
  }, [rawDispatch, canEdit, broadcastAction])

  // Load composition data into sequencer once fetched
  useEffect(() => {
    if (composition && loadedRef.current !== composition.id) {
      try {
        const parsed = JSON.parse(composition.data)
        rawDispatch({ type: 'LOAD_STATE', state: parsed })
        loadedRef.current = composition.id
      } catch {
        // invalid data
      }
    }
  }, [composition, rawDispatch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inviteToken = params.get('invite')
    const declineToken = params.get('decline')
    if (!inviteToken && !declineToken) return

    const handleToken = async () => {
      if (inviteToken) {
        try {
          await fetch('/api/trpc/collaboration.acceptInvitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { token: inviteToken } }),
          })
        } catch {}
        window.history.replaceState({}, '', window.location.pathname)
        window.location.reload()
      } else if (declineToken) {
        try {
          await fetch('/api/trpc/collaboration.declineInvitation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ json: { token: declineToken } }),
          })
        } catch {}
        window.location.href = '/creations'
      }
    }
    handleToken()
  }, [])

  // Audio engine setup
  useEffect(() => {
    const engine = new AudioEngine()
    engine.setOnStep(() => {
      rawDispatch({ type: 'ADVANCE_STEP' })
    })
    engineRef.current = engine
    return () => engine.dispose()
  }, [rawDispatch])

  useEffect(() => {
    engineRef.current?.setGrid(state.drumGrid)
  }, [state.drumGrid])

  useEffect(() => {
    engineRef.current?.setSynthTracks(state.synthTracks)
  }, [state.synthTracks])

  useEffect(() => {
    engineRef.current?.setTempo(state.bpm)
  }, [state.bpm])

  useEffect(() => {
    engineRef.current?.setSwing(state.swing)
  }, [state.swing])

  useEffect(() => {
    if (state.isPlaying) {
      engineRef.current?.play()
    } else {
      engineRef.current?.stop()
    }
  }, [state.isPlaying])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        rawDispatch({ type: state.isPlaying ? 'STOP' : 'PLAY' })
      }
      if (e.code === 'Escape' && state.activeXyPad) {
        rawDispatch({ type: 'CLOSE_XY_PAD' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.isPlaying, state.activeXyPad, rawDispatch])

  const handleExport = useCallback(() => {
    exportMidi(state.drumGrid, state.synthTracks, state.bpm, state.stepCount)
  }, [state.drumGrid, state.synthTracks, state.bpm, state.stepCount])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Loading composition...</p>
      </div>
    )
  }

  if (error || !composition) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Composition not found.</p>
        <Link to="/creations">
          <Button variant="outline">Back to Creations</Button>
        </Link>
      </div>
    )
  }

  const xyPadTrack = state.activeXyPad
    ? state.synthTracks.find((t) => t.id === state.activeXyPad!.trackId)
    : null

  if (isMobilePortrait) {
    return (
      <>
        <LandscapePrompt />
        {state.activeXyPad && xyPadTrack && (
          <XyPad
            trackId={state.activeXyPad.trackId}
            step={state.activeXyPad.step}
            scaleIndex={state.scaleIndex}
            rootNote={state.rootNote}
            presetId={xyPadTrack.presetId}
            existingNotes={xyPadTrack.steps[state.activeXyPad.step] ?? []}
            dispatch={dispatch}
          />
        )}
      </>
    )
  }

  if (isMobileLandscape) {
    return (
      <div className="flex flex-col h-full gap-1">
        <SequencerControls
          state={state}
          dispatch={dispatch}
          onExport={handleExport}
          compact
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <SequencerGrid state={state} dispatch={dispatch} />
        </div>
        {state.activeXyPad && xyPadTrack && (
          <XyPad
            trackId={state.activeXyPad.trackId}
            step={state.activeXyPad.step}
            scaleIndex={state.scaleIndex}
            rootNote={state.rootNote}
            presetId={xyPadTrack.presetId}
            existingNotes={xyPadTrack.steps[state.activeXyPad.step] ?? []}
            dispatch={dispatch}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{composition.title}</h1>
              <p className="text-xs text-muted-foreground">
                by {composition.author.name ?? 'Anonymous'}
                {isCollaborator && ' · You are a collaborator'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CollaboratorPresence
                compositionId={composition.id}
                enabled={canEdit}
              />
              {isOwner && <CollaboratorDialog compositionId={composition.id} />}
              <Link to="/creations">
                <Button variant="ghost" size="sm">
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          <SequencerControls
            state={state}
            dispatch={dispatch}
            onExport={handleExport}
          />
          <SequencerGrid state={state} dispatch={dispatch} />
        </CardContent>
      </Card>

      {state.activeXyPad && xyPadTrack && (
        <XyPad
          trackId={state.activeXyPad.trackId}
          step={state.activeXyPad.step}
          scaleIndex={state.scaleIndex}
          rootNote={state.rootNote}
          presetId={xyPadTrack.presetId}
          existingNotes={xyPadTrack.steps[state.activeXyPad.step] ?? []}
          dispatch={dispatch}
        />
      )}
    </div>
  )
}
