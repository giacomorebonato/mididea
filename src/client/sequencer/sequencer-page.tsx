import { useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useSequencer } from './use-sequencer'
import { AudioEngine } from './audio-engine'
import { SequencerGrid } from './sequencer-grid'
import { SequencerControls } from './sequencer-controls'
import { XyPad } from './xy-pad'
import { exportMidi } from './midi-export'
import { SaveCompositionDialog } from '../components/save-composition-dialog'

export function SequencerPage() {
  const [state, dispatch] = useSequencer()
  const engineRef = useRef<AudioEngine | null>(null)

  // Initialize audio engine
  useEffect(() => {
    const engine = new AudioEngine()
    engine.setOnStep(() => {
      dispatch({ type: 'ADVANCE_STEP' })
    })
    engineRef.current = engine
    return () => engine.dispose()
  }, [dispatch])

  // Sync drum grid to engine
  useEffect(() => {
    engineRef.current?.setGrid(state.drumGrid)
  }, [state.drumGrid])

  // Sync synth tracks to engine
  useEffect(() => {
    engineRef.current?.setSynthTracks(state.synthTracks)
  }, [state.synthTracks])

  // Sync BPM to engine
  useEffect(() => {
    engineRef.current?.setTempo(state.bpm)
  }, [state.bpm])

  // Sync swing to engine
  useEffect(() => {
    engineRef.current?.setSwing(state.swing)
  }, [state.swing])

  // Handle play/stop
  useEffect(() => {
    if (state.isPlaying) {
      engineRef.current?.play()
    } else {
      engineRef.current?.stop()
    }
  }, [state.isPlaying])

  // Spacebar shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        dispatch({ type: state.isPlaying ? 'STOP' : 'PLAY' })
      }
      if (e.code === 'Escape' && state.activeXyPad) {
        dispatch({ type: 'CLOSE_XY_PAD' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.isPlaying, state.activeXyPad, dispatch])

  const handleExport = useCallback(() => {
    exportMidi(state.drumGrid, state.synthTracks, state.bpm, state.stepCount)
  }, [state.drumGrid, state.synthTracks, state.bpm, state.stepCount])

  // Find XY pad context
  const xyPadTrack = state.activeXyPad
    ? state.synthTracks.find((t) => t.id === state.activeXyPad!.trackId)
    : null

  return (
    <div className="space-y-3 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 py-2 sm:px-6 sm:py-4">
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Space = play/stop · Tap synth steps to add notes
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          <SequencerControls state={state} dispatch={dispatch} onExport={handleExport}>
            <SaveCompositionDialog state={state} />
          </SequencerControls>
          <SequencerGrid state={state} dispatch={dispatch} />
        </CardContent>
      </Card>

      {/* XY Pad overlay */}
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
