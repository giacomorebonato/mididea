import { memo } from 'react'
import type { DrumId } from './types'

const DRUM_COLORS: Record<DrumId, string> = {
  kick: 'bg-amber-500',
  snare: 'bg-cyan-500',
  hihat: 'bg-emerald-500',
  clap: 'bg-rose-500',
  tom: 'bg-violet-500',
  rim: 'bg-orange-400',
}

interface StepCellProps {
  drum: DrumId
  step: number
  isActive: boolean
  isCurrentStep: boolean
  onToggle: (drum: DrumId, step: number) => void
}

export const StepCell = memo(function StepCell({
  drum,
  step,
  isActive,
  isCurrentStep,
  onToggle,
}: StepCellProps) {
  const isBeatStart = step % 4 === 0

  return (
    <button
      type="button"
      onClick={() => onToggle(drum, step)}
      className={`
        h-11 sm:h-10 w-full rounded-sm border transition-colors active:scale-95
        ${isActive ? `${DRUM_COLORS[drum]} border-white/30` : isCurrentStep ? 'bg-white/10 border-border' : 'bg-muted border-border hover:bg-muted-foreground/20'}
        ${isCurrentStep ? 'ring-2 ring-white shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
        ${isBeatStart ? 'ml-0.5' : ''}
      `}
    />
  )
})
