import { memo } from 'react'
import type { SynthNote, SequencerAction } from './types'
import { noteToColor } from './scales'

interface SynthStepCellProps {
  trackId: string
  step: number
  notes: SynthNote[]
  isCurrentStep: boolean
  dispatch: React.Dispatch<SequencerAction>
}

export const SynthStepCell = memo(function SynthStepCell({
  trackId,
  step,
  notes,
  isCurrentStep,
  dispatch,
}: SynthStepCellProps) {
  const isBeatStart = step % 4 === 0
  const hasNotes = notes.length > 0

  // Intensity glow based on number of notes
  const glowOpacity = hasNotes ? Math.min(0.3 + notes.length * 0.15, 0.9) : 0

  return (
    <div
      className={`
        relative h-12 sm:h-14 w-full rounded-sm border transition-colors overflow-hidden cursor-pointer active:scale-95
        ${hasNotes ? 'border-white/20' : 'bg-muted/50 border-border hover:bg-muted-foreground/20'}
        ${isCurrentStep ? 'ring-2 ring-white shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
        ${isBeatStart ? 'ml-0.5' : ''}
      `}
      style={
        hasNotes
          ? { backgroundColor: `rgba(255,255,255,${glowOpacity * 0.1})` }
          : undefined
      }
      onClick={() => {
        dispatch({ type: 'OPEN_XY_PAD', trackId, step })
      }}
    >
      {/* Stacked note chips */}
      {hasNotes && (
        <div className="absolute inset-0.5 flex flex-col-reverse justify-start gap-px p-px">
          {notes.map((note, i) => (
            <div
              key={`${note.pitch}-${i}`}
              className="w-full rounded-sm flex-shrink-0"
              style={{
                backgroundColor: noteToColor(note.pitch),
                height: `${Math.max(20, 100 / Math.max(notes.length, 4))}%`,
                opacity: 0.6 + note.velocity * 0.4,
              }}
            />
          ))}
        </div>
      )}

      {/* "+" indicator for empty steps */}
      {!hasNotes && (
        <span className="absolute inset-0 flex items-center justify-center text-white/15 text-lg">
          +
        </span>
      )}
    </div>
  )
})
