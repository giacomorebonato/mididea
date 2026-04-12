import { useCallback, useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import {
  getScaleNotes,
  noteToColor,
  SCALES,
  xToScaleNote,
} from './audio/scales'
import { getPresetById } from './audio/synth-presets'
import type { SequencerAction, SynthNote } from './types'

interface XyPadProps {
  trackId: string
  step: number
  scaleIndex: number
  rootNote: string
  presetId: string
  existingNotes: SynthNote[]
  dispatch: React.Dispatch<SequencerAction>
}

interface DragState {
  noteIndex: number
  pitch: string
  startClientX: number
  startClientY: number
  initialDuration: number
  initialVelocity: number
  currentDuration: number
  currentVelocity: number
  hasDragged: boolean
}

const DRAG_THRESHOLD = 5

function getBarGeometry(
  noteIdx: number,
  totalNotes: number,
  velocity: number,
  duration: number,
  containerWidth: number,
  containerHeight: number,
) {
  const colLeft = (noteIdx / totalNotes) * containerWidth
  const colWidth = containerWidth / totalNotes
  const barWidthPct = 30 + velocity * 60
  const barLeftOffset = colLeft + (colWidth * (100 - barWidthPct)) / 200
  const barWidth = (colWidth * barWidthPct) / 100
  const barHeightPct = Math.min(80, 8 + (duration / 16) * 72)
  const barHeight = (containerHeight * barHeightPct) / 100
  const barTop = containerHeight - barHeight
  return { barLeftOffset, barWidth, barTop }
}

export function XyPad({
  trackId,
  step,
  scaleIndex,
  rootNote,
  presetId,
  existingNotes,
  dispatch,
}: XyPadProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapRef = useRef<{ time: number; noteIndex: number } | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [hoveredNote, setHoveredNote] = useState<number | null>(null)

  const scale = SCALES[scaleIndex] ?? SCALES[0]!
  const scaleNotes = getScaleNotes(scale, rootNote, 3, 5)

  useEffect(() => {
    const preset = getPresetById(presetId)
    const synth = preset.create()
    synth.toDestination()
    synth.volume.value = -10
    synthRef.current = synth
    return () => {
      synth.releaseAll()
      synth.dispose()
      synthRef.current = null
    }
  }, [presetId])

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }
    }
  }, [])

  const previewNote = useCallback(
    (pitch: string, velocity: number, durationMs: number) => {
      if (!synthRef.current) return
      synthRef.current.releaseAll()
      synthRef.current.triggerAttack(pitch, undefined, velocity)
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current)
      previewTimerRef.current = setTimeout(() => {
        synthRef.current?.releaseAll()
        previewTimerRef.current = null
      }, durationMs)
    },
    [],
  )

  const pointerToPitch = useCallback(
    (e: React.PointerEvent): string | null => {
      if (!canvasRef.current) return null
      const rect = canvasRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      return xToScaleNote(x, scaleNotes)
    },
    [scaleNotes],
  )

  const hitTestNote = useCallback(
    (e: React.PointerEvent): number | null => {
      if (!canvasRef.current) return null
      const rect = canvasRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      for (let i = 0; i < existingNotes.length; i++) {
        const note = existingNotes[i]!
        const noteIdx = scaleNotes.indexOf(note.pitch)
        if (noteIdx === -1) continue

        const velocity = note.velocity ?? 0.5
        const duration = note.duration ?? 1
        const geo = getBarGeometry(
          noteIdx,
          scaleNotes.length,
          velocity,
          duration,
          rect.width,
          rect.height,
        )

        if (
          clickX >= geo.barLeftOffset &&
          clickX <= geo.barLeftOffset + geo.barWidth &&
          clickY >= geo.barTop &&
          clickY <= rect.height
        ) {
          return i
        }
      }
      return null
    },
    [scaleNotes, existingNotes],
  )

  const handlePointerDown = useCallback(
    async (e: React.PointerEvent) => {
      e.preventDefault()
      if (!canvasRef.current) return
      await Tone.start()

      const rect = canvasRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const normY = Math.max(0, Math.min(1, 1 - clickY / rect.height)) // top=1, bottom=0

      // Duration from Y position: top = long (16), bottom = short (1)
      const initialDuration = Math.max(
        1,
        Math.min(16, Math.round(normY * 15 + 1)),
      )

      const hitIdx = hitTestNote(e)

      if (hitIdx !== null) {
        // Clicked directly on an existing bar — start drag
        const note = existingNotes[hitIdx]
        if (!note) return
        setDragState({
          noteIndex: hitIdx,
          pitch: note.pitch,
          startClientX: e.clientX,
          startClientY: e.clientY,
          initialDuration: note.duration ?? 1,
          initialVelocity: note.velocity ?? 0.5,
          currentDuration: note.duration ?? 1,
          currentVelocity: note.velocity ?? 0.5,
          hasDragged: false,
        })
        canvasRef.current.setPointerCapture(e.pointerId)
      } else {
        // Clicked empty space — determine pitch column from X
        const pitch = pointerToPitch(e)
        if (!pitch) return
        const noteIdx = scaleNotes.indexOf(pitch)
        if (noteIdx === -1) return

        // Velocity from X position within the column: left = quiet, right = loud
        const colLeft = (noteIdx / scaleNotes.length) * rect.width
        const colWidth = rect.width / scaleNotes.length
        const xInColumn = Math.max(
          0,
          Math.min(1, (clickX - colLeft) / colWidth),
        )
        const initialVelocity = Math.max(0.1, Math.min(1, xInColumn))

        const existingIdx = existingNotes.findIndex((n) => n.pitch === pitch)

        if (existingIdx !== -1) {
          // Note exists in this column — start drag from it (column-wide interaction)
          const note = existingNotes[existingIdx]!
          setDragState({
            noteIndex: existingIdx,
            pitch: note.pitch,
            startClientX: e.clientX,
            startClientY: e.clientY,
            initialDuration: note.duration ?? 1,
            initialVelocity: note.velocity ?? 0.5,
            currentDuration: note.duration ?? 1,
            currentVelocity: note.velocity ?? 0.5,
            hasDragged: false,
          })
          canvasRef.current.setPointerCapture(e.pointerId)
        } else {
          // No note in column — create one with position-derived velocity & duration, then drag
          dispatch({
            type: 'ADD_SYNTH_NOTE',
            trackId,
            step,
            note: {
              pitch,
              velocity: initialVelocity,
              duration: initialDuration,
            },
          })
          previewNote(pitch, initialVelocity, 200)
          setDragState({
            noteIndex: existingNotes.length, // new note will be appended at this index
            pitch,
            startClientX: e.clientX,
            startClientY: e.clientY,
            initialDuration,
            initialVelocity,
            currentDuration: initialDuration,
            currentVelocity: initialVelocity,
            hasDragged: false,
          })
          canvasRef.current.setPointerCapture(e.pointerId)
        }
      }
    },
    [
      hitTestNote,
      pointerToPitch,
      dispatch,
      trackId,
      step,
      existingNotes,
      previewNote,
      scaleNotes,
    ],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return
      if (!canvasRef.current) return
      e.preventDefault()

      const deltaX = e.clientX - dragState.startClientX
      const deltaY = e.clientY - dragState.startClientY
      const movedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (!dragState.hasDragged && movedDistance < DRAG_THRESHOLD) return

      const durationChange = -deltaY / 50
      const newDuration = Math.max(
        1,
        Math.min(16, Math.round(dragState.initialDuration + durationChange)),
      )

      const velocityChange = deltaX / 200
      const newVelocity = Math.max(
        0.1,
        Math.min(1, dragState.initialVelocity + velocityChange),
      )

      if (
        newDuration !== dragState.currentDuration ||
        newVelocity !== dragState.currentVelocity
      ) {
        previewNote(dragState.pitch, newVelocity, 150)
      }

      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentDuration: newDuration,
              currentVelocity: newVelocity,
              hasDragged: true,
            }
          : null,
      )
    },
    [dragState, previewNote],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return

      canvasRef.current?.releasePointerCapture(e.pointerId)
      synthRef.current?.releaseAll()
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current)
        previewTimerRef.current = null
      }

      if (dragState.hasDragged) {
        dispatch({
          type: 'UPDATE_SYNTH_NOTE',
          trackId,
          step,
          noteIndex: dragState.noteIndex,
          pitch: dragState.pitch,
          velocity: dragState.currentVelocity,
        })
        dispatch({
          type: 'SET_SYNTH_NOTE_DURATION',
          trackId,
          step,
          noteIndex: dragState.noteIndex,
          duration: dragState.currentDuration,
        })
      } else {
        const now = Date.now()
        const last = lastTapRef.current

        if (
          last &&
          last.noteIndex === dragState.noteIndex &&
          now - last.time < 300
        ) {
          dispatch({
            type: 'REMOVE_SYNTH_NOTE',
            trackId,
            step,
            noteIndex: dragState.noteIndex,
          })
          lastTapRef.current = null
        } else {
          lastTapRef.current = { time: now, noteIndex: dragState.noteIndex }
        }
      }

      setDragState(null)
    },
    [dragState, dispatch, trackId, step],
  )

  const handlePointerLeave = useCallback(() => {
    setHoveredNote(null)
  }, [])

  const handleClose = useCallback(() => {
    synthRef.current?.releaseAll()
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current)
      previewTimerRef.current = null
    }
    dispatch({ type: 'CLOSE_XY_PAD' })
  }, [dispatch])

  const renderNotes = existingNotes.map((note, i) => {
    if (dragState?.hasDragged && dragState.noteIndex === i) {
      return {
        ...note,
        velocity: dragState.currentVelocity,
        duration: dragState.currentDuration,
      }
    }
    return note
  })

  const invisibleNotes = existingNotes.filter(
    (n) => scaleNotes.indexOf(n.pitch) === -1,
  )

  const noteZones = scaleNotes.map((note, i) => {
    const left = (i / scaleNotes.length) * 100
    const width = 100 / scaleNotes.length
    return { note, left, width }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-label={`XY Pad editor for step ${step + 1}`}
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-3">
        <div className="text-white text-xs sm:text-sm">
          Step {step + 1} — {scale.mood} ({scale.name})
          {existingNotes.length > 0 && (
            <span className="ml-2 text-white/60">
              {existingNotes.length} note{existingNotes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="px-5 py-2.5 bg-white/10 text-white rounded-lg text-sm font-medium active:bg-white/20 min-h-[44px]"
          aria-label="Close XY Pad"
        >
          Done
        </button>
      </div>

      {/* Instructions */}
      <div
        className="px-3 sm:px-4 pb-2 text-white/50 text-xs text-center"
        role="note"
      >
        Tap to add · Double-tap bar to remove · Drag bar ↑↓ duration · Drag bar
        ←→ velocity
      </div>

      {/* Invisible notes warning */}
      {invisibleNotes.length > 0 && (
        <div className="px-3 sm:px-4 pb-2 text-amber-400/80 text-xs text-center">
          {invisibleNotes.length} note{invisibleNotes.length !== 1 ? 's' : ''}{' '}
          hidden (pitch outside {scale.name})
        </div>
      )}

      {/* XY Pad */}
      <div className="flex-1 px-2 pb-2 sm:px-4 sm:pb-4">
        <div
          ref={canvasRef}
          className="relative w-full h-full rounded-xl overflow-hidden cursor-crosshair select-none touch-none"
          style={{
            background: 'linear-gradient(to top, #1a1a2e, #16213e, #0f3460)',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => {
            if (!dragState) {
              setHoveredNote(hitTestNote(e))
            }
            handlePointerMove(e)
          }}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          role="application"
          aria-label={`Note pad with ${scaleNotes.length} pitch columns`}
        >
          {/* Note zone labels */}
          {noteZones.map(({ note, left, width }) => (
            <div
              key={note}
              className="absolute top-0 bottom-0 border-r border-white/10 flex items-end justify-center pb-3"
              style={{ left: `${left}%`, width: `${width}%` }}
            >
              <span className="text-white/30 text-xs">{note}</span>
            </div>
          ))}

          {/* Axis labels */}
          <div className="absolute left-2 top-2 text-white/30 text-xs">
            Long ↑
          </div>
          <div className="absolute left-2 bottom-2 text-white/30 text-xs">
            Short ↓
          </div>
          <div className="absolute right-2 bottom-2 text-white/30 text-xs">
            Quiet ← Loud →
          </div>

          {/* Note bars */}
          {renderNotes.map((note, i) => {
            const noteIdx = scaleNotes.indexOf(note.pitch)
            if (noteIdx === -1) return null

            const velocity = note.velocity ?? 0.5
            const duration = note.duration ?? 1
            const isDragging = dragState?.noteIndex === i
            const isHovered = hoveredNote === i && !dragState
            const color = noteToColor(note.pitch)
            const barBg = isDragging
              ? color.replace('hsl(', 'hsla(').replace(')', ', 0.8)')
              : isHovered
                ? color.replace('hsl(', 'hsla(').replace(')', ', 0.7)')
                : color.replace('hsl(', 'hsla(').replace(')', ', 0.6)')

            const colLeft = (noteIdx / scaleNotes.length) * 100
            const colWidth = 100 / scaleNotes.length

            const barWidthPct = 30 + velocity * 60
            const barLeftPct = (100 - barWidthPct) / 2
            const barHeightPct = Math.min(80, 8 + (duration / 16) * 72)

            return (
              <div
                key={`${note.pitch}-${i}`}
                className="absolute pointer-events-none flex flex-col items-center"
                style={{
                  left: `${colLeft}%`,
                  width: `${colWidth}%`,
                  bottom: 0,
                  height: `${barHeightPct}%`,
                  zIndex: isDragging ? 20 : 10,
                }}
              >
                {/* The bar itself */}
                <div
                  className="w-full rounded-t-md flex flex-col items-center justify-start pt-1.5 relative"
                  style={{
                    marginLeft: `${barLeftPct}%`,
                    width: `${barWidthPct}%`,
                    height: '100%',
                    backgroundColor: barBg,
                    border: `2px solid ${isDragging ? '#fff' : isHovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'}`,
                    borderTopWidth: '3px',
                    borderTopColor: isDragging
                      ? '#fff'
                      : 'rgba(255,255,255,0.8)',
                    boxShadow: isDragging
                      ? '0 0 12px rgba(255,255,255,0.3)'
                      : isHovered
                        ? '0 0 6px rgba(255,255,255,0.15)'
                        : 'none',
                    transition: isDragging ? 'none' : 'all 0.15s ease',
                  }}
                >
                  {/* Note name */}
                  <span className="text-white text-[10px] font-bold leading-none drop-shadow-sm">
                    {note.pitch}
                  </span>

                  {/* Duration · velocity inside bar */}
                  <span className="text-white/70 text-[8px] leading-none mt-0.5">
                    {duration}·{Math.round(velocity * 100)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
