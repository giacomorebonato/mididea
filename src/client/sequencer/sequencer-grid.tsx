import { useCallback } from 'react'
import type { DrumId, SequencerAction, SequencerState } from './types'
import { DRUM_IDS, DRUM_LABELS } from './types'
import { StepCell } from './step-cell'
import { SynthStepCell } from './synth-step-cell'
import { SYNTH_PRESETS } from './synth-presets'
import { useOrientation } from './orientation-context'

interface SequencerGridProps {
  state: SequencerState
  dispatch: React.Dispatch<SequencerAction>
}

export function SequencerGrid({ state, dispatch }: SequencerGridProps) {
  const { drumGrid, synthTracks, currentStep, stepCount } = state
  const { isMobileLandscape } = useOrientation()

  const handleToggle = useCallback(
    (drum: DrumId, step: number) => {
      dispatch({ type: 'TOGGLE_STEP', drum, step })
    },
    [dispatch],
  )

  const labelWidth = isMobileLandscape ? '2.25rem' : '3.5rem'
  const stepCol = isMobileLandscape ? '1fr' : 'minmax(2.25rem, 1fr)'

  return (
    <div
      className={
        isMobileLandscape
          ? 'w-full overflow-hidden'
          : '-mx-3 sm:mx-0 overflow-x-auto overscroll-x-contain'
      }
    >
      <div
        className={`grid ${isMobileLandscape ? 'gap-0.5' : 'gap-0.5 sm:gap-1'} min-w-fit`}
        style={{
          gridTemplateColumns: `${labelWidth} repeat(${stepCount}, ${stepCol})`,
        }}
      >
        {/* Step number header */}
        <div />
        {Array.from({ length: stepCount }, (_, i) => (
          <div
            key={i}
            className={`text-center text-[10px] sm:text-xs transition-colors ${
              currentStep === i
                ? 'text-white font-bold'
                : i % 4 === 0
                  ? 'text-muted-foreground font-bold'
                  : 'text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
        ))}

        {/* Playhead highlight row */}
        <div />
        {Array.from({ length: stepCount }, (_, i) => (
          <div
            key={`ph-${i}`}
            className={`h-1 rounded-full transition-colors ${
              currentStep === i ? 'bg-white' : 'bg-transparent'
            }`}
          />
        ))}

        {/* Drum rows */}
        {DRUM_IDS.map((drum) => (
          <div key={drum} className="contents">
            <div className="flex items-center text-xs sm:text-sm font-medium pr-1 sm:pr-2 text-foreground truncate">
              {isMobileLandscape
                ? DRUM_LABELS[drum].slice(0, 3)
                : DRUM_LABELS[drum]}
            </div>
            {Array.from({ length: stepCount }, (_, step) => (
              <StepCell
                key={step}
                drum={drum}
                step={step}
                isActive={drumGrid[drum][step] ?? false}
                isCurrentStep={currentStep === step}
                onToggle={handleToggle}
              />
            ))}
          </div>
        ))}

        {/* Divider */}
        <div className="col-span-full h-px bg-border my-1" />

        {/* Synth track rows */}
        {synthTracks.map((track) => {
          const preset = SYNTH_PRESETS.find((p) => p.id === track.presetId)

          return (
            <div key={track.id} className="contents">
              <div className="flex flex-col justify-center text-xs sm:text-sm font-medium pr-1 sm:pr-2 text-foreground truncate">
                <span className="truncate">
                  {isMobileLandscape
                    ? (preset?.name?.slice(0, 3) ?? 'Syn')
                    : (preset?.name ?? 'Synth')}
                </span>
                <button
                  type="button"
                  className={`text-xs text-muted-foreground hover:text-foreground text-left py-0.5 ${isMobileLandscape ? 'hidden' : ''}`}
                  onClick={() => {
                    const currentIdx = SYNTH_PRESETS.findIndex(
                      (p) => p.id === track.presetId,
                    )
                    const nextIdx = (currentIdx + 1) % SYNTH_PRESETS.length
                    const nextPreset = SYNTH_PRESETS[nextIdx]
                    if (!nextPreset) return
                    dispatch({
                      type: 'SET_SYNTH_PRESET',
                      trackId: track.id,
                      presetId: nextPreset.id,
                    })
                  }}
                >
                  ↻ change
                </button>
              </div>
              {Array.from({ length: stepCount }, (_, step) => (
                <SynthStepCell
                  key={step}
                  trackId={track.id}
                  step={step}
                  notes={track.steps[step] ?? []}
                  isCurrentStep={currentStep === step}
                  dispatch={dispatch}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
