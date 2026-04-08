import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROOT_NOTES, SCALES } from './scales'
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
  const _scale = SCALES[scaleIndex]

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Button
          onClick={() => dispatch({ type: isPlaying ? 'STOP' : 'PLAY' })}
          variant={isPlaying ? 'destructive' : 'default'}
          size="sm"
          className="min-w-[3.5rem] h-7 text-xs px-2"
        >
          {isPlaying ? 'Stop' : 'Play'}
        </Button>

        <div className="flex items-center gap-1">
          <Label htmlFor="bpm" className="text-[10px] whitespace-nowrap">
            BPM
          </Label>
          <Input
            id="bpm"
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e) =>
              dispatch({
                type: 'SET_BPM',
                bpm: Number.parseInt(e.target.value, 10) || MIN_BPM,
              })
            }
            className="w-12 h-7 text-xs px-1"
          />
        </div>

        <div className="flex items-center gap-1">
          <Label htmlFor="swing" className="text-[10px] whitespace-nowrap">
            Sw
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
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {/* Row 1: Transport + BPM + Swing */}
      <Button
        onClick={() => dispatch({ type: isPlaying ? 'STOP' : 'PLAY' })}
        variant={isPlaying ? 'destructive' : 'default'}
        size="lg"
        className="min-w-[4.5rem]"
      >
        {isPlaying ? 'Stop' : 'Play'}
      </Button>

      {/* BPM */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="bpm" className="text-xs sm:text-sm whitespace-nowrap">
          BPM
        </Label>
        <Input
          id="bpm"
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(e) =>
            dispatch({
              type: 'SET_BPM',
              bpm: Number.parseInt(e.target.value, 10) || MIN_BPM,
            })
          }
          className="w-16 sm:w-20 h-9"
        />
      </div>

      {/* Swing */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="swing" className="text-xs sm:text-sm whitespace-nowrap">
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
          className="w-16 sm:w-20 accent-white"
        />
        <span className="text-xs text-muted-foreground w-8">{swing}%</span>
      </div>

      {/* Scale selector */}
      <div className="flex items-center gap-1.5">
        <Label htmlFor="root" className="text-xs sm:text-sm whitespace-nowrap">
          Key
        </Label>
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
          className="h-10 rounded-md border border-border bg-background px-2 text-sm max-w-[10rem]"
        >
          {SCALES.map((s, i) => (
            <option key={s.name} value={i}>
              {s.mood} ({s.name})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: 'CLEAR_ALL' })}
        >
          Clear
        </Button>
        <Button variant="secondary" size="sm" onClick={onExport}>
          Export MIDI
        </Button>
        {children}
      </div>
    </div>
  )
}
