import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ROOT_NOTES, SCALES } from './audio/scales'
import type { SequencerAction, SequencerState } from './types'
import { MAX_BPM, MAX_SWING, MIN_BPM } from './types'

interface SequencerControlsProps {
  state: SequencerState
  dispatch: React.Dispatch<SequencerAction>
  onExport: () => void
  children?: React.ReactNode
  compact?: boolean
}

export function SequencerControls({
  state,
  dispatch,
  onExport,
  children,
  compact,
}: SequencerControlsProps) {
  const { isPlaying, bpm, swing, scaleIndex, rootNote } = state

  if (compact) {
    return (
      <div className="flex w-full items-center gap-1.5 text-xs">
        <Button
          onClick={() => dispatch({ type: isPlaying ? 'STOP' : 'PLAY' })}
          variant={isPlaying ? 'destructive' : 'default'}
          size="sm"
          className="min-w-[3.5rem] h-7 text-xs px-2"
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>

        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Label
            htmlFor="bpm-compact"
            className="text-[10px] whitespace-nowrap shrink-0"
          >
            BPM
          </Label>
          <input
            id="bpm-compact"
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) =>
              dispatch({
                type: 'SET_BPM',
                bpm: Number.parseInt(e.target.value, 10),
              })
            }
            className="flex-1 min-w-0 accent-white"
          />
          <span className="text-[10px] text-muted-foreground w-6 text-right tabular-nums shrink-0">
            {bpm}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Label
            htmlFor="swing-compact"
            className="text-[10px] whitespace-nowrap"
          >
            Sw
          </Label>
          <input
            id="swing-compact"
            type="range"
            min={0}
            max={MAX_SWING}
            value={swing}
            onChange={(e) =>
              dispatch({
                type: 'SET_SWING',
                swing: Number.parseInt(e.target.value, 10),
              })
            }
            className="w-12 accent-white"
          />
        </div>

        <select
          value={rootNote}
          onChange={(e) =>
            dispatch({ type: 'SET_ROOT_NOTE', rootNote: e.target.value })
          }
          className="h-7 rounded-md border border-border bg-background px-1 text-xs min-w-[2.5rem]"
        >
          {ROOT_NOTES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
        <select
          value={scaleIndex}
          onChange={(e) =>
            dispatch({
              type: 'SET_SCALE',
              scaleIndex: Number.parseInt(e.target.value, 10),
            })
          }
          className="h-7 rounded-md border border-border bg-background px-1 text-xs"
        >
          {SCALES.map((s, i) => (
            <option key={s.name} value={i}>
              {s.name}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
        >
          Clear
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs px-2"
          onClick={onExport}
        >
          MIDI
        </Button>
        {children}
      </div>
    )
  }

  return (
    <div className="flex w-full items-center gap-3 sm:gap-5">
      {/* Play/Stop */}
      <Button
        onClick={() => dispatch({ type: isPlaying ? 'STOP' : 'PLAY' })}
        variant={isPlaying ? 'destructive' : 'default'}
        size="lg"
        className="min-w-[4.5rem] shrink-0"
      >
        {isPlaying ? 'Stop' : 'Play'}
      </Button>

      {/* BPM slider */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Label
          htmlFor="bpm"
          className="text-xs sm:text-sm whitespace-nowrap shrink-0"
        >
          BPM
        </Label>
        <input
          id="bpm"
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(e) =>
            dispatch({
              type: 'SET_BPM',
              bpm: Number.parseInt(e.target.value, 10),
            })
          }
          className="flex-1 min-w-0 accent-white"
        />
        <span className="text-sm font-medium tabular-nums w-8 text-right shrink-0">
          {bpm}
        </span>
      </div>

      {/* Swing slider */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Label
          htmlFor="swing"
          className="text-xs sm:text-sm whitespace-nowrap shrink-0"
        >
          Swing
        </Label>
        <input
          id="swing"
          type="range"
          min={0}
          max={MAX_SWING}
          value={swing}
          onChange={(e) =>
            dispatch({
              type: 'SET_SWING',
              swing: Number.parseInt(e.target.value, 10),
            })
          }
          className="flex-1 min-w-0 accent-white"
        />
        <span className="text-xs text-muted-foreground w-8 text-right tabular-nums shrink-0">
          {swing}%
        </span>
      </div>

      {/* Key + Scale */}
      <div className="flex items-center gap-1.5 shrink-0">
        <select
          id="root"
          value={rootNote}
          onChange={(e) =>
            dispatch({ type: 'SET_ROOT_NOTE', rootNote: e.target.value })
          }
          className="h-10 rounded-md border border-border bg-background px-2 text-sm min-w-[3rem]"
        >
          {ROOT_NOTES.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
        <select
          id="scale"
          value={scaleIndex}
          onChange={(e) =>
            dispatch({
              type: 'SET_SCALE',
              scaleIndex: Number.parseInt(e.target.value, 10),
            })
          }
          className="h-10 rounded-md border border-border bg-background px-2 text-sm"
        >
          {SCALES.map((s, i) => (
            <option key={s.name} value={i}>
              {s.mood} ({s.name})
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
        >
          Clear
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport}>
          MIDI
        </Button>
        {children}
      </div>
    </div>
  )
}
