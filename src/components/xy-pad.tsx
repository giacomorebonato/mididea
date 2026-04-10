import type React from 'react'
import { useRef, useState } from 'react'

interface Note {
  pitch: number
  velocity: number // 0-127
  duration: number // milliseconds
}

interface XyPadProps {
  onNoteUpdate?: (note: Note) => void
  stepIndex?: number
}

export const XyPad: React.FC<XyPadProps> = ({
  onNoteUpdate,
  stepIndex: _stepIndex,
}) => {
  const [note, setNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Tap timing for duration
  const tapStartTimeRef = useRef<number | null>(null)

  // Velocity color mapping (low to high)
  const getVelocityColor = (velocity: number): string => {
    const intensity = velocity / 127
    return `hsl(30, ${50 + intensity * 50}%, ${40 + intensity * 60}%)`
  }

  // Duration ring thickness
  const getDurationStroke = (durationMs: number): number => {
    if (durationMs < 250) return 2
    if (durationMs < 500) return 4
    return 6
  }

  // Handle note placement/tap
  const handleTapStart = (_event: React.TouchEvent | React.MouseEvent) => {
    tapStartTimeRef.current = Date.now()
    setIsEditing(true)

    // If no note, create one with defaults
    if (!note) {
      const newNote: Note = {
        pitch: 0, // Will be set by XY position
        velocity: 64, // Medium velocity
        duration: 250, // Short default
      }
      setNote(newNote)
    }
  }

  // Handle note release - determines duration from tap timing
  const handleTapEnd = () => {
    setIsDragging(false)
    setIsEditing(false)

    if (note && tapStartTimeRef.current) {
      const tapDuration = Date.now() - tapStartTimeRef.current
      const updatedNote = {
        ...note,
        duration: tapDuration, // Duration = how long you held
      }
      setNote(updatedNote)
      onNoteUpdate?.(updatedNote)
    }
    tapStartTimeRef.current = null
  }

  // Handle slide gestures for velocity/duration adjustment
  const handleDrag = (event: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !note) return

    const clientX =
      'touches' in event ? event.touches[0]!.clientX : event.clientX
    const clientY =
      'touches' in event ? event.touches[0]!.clientY : event.clientY

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y

    const SENSITIVITY = 2 // Pixels per velocity/duration unit

    // Slide up/down = velocity adjustment
    const newVelocity = Math.max(
      0,
      Math.min(127, note.velocity - deltaY * SENSITIVITY),
    )

    // Slide left/right = duration adjustment
    const newDuration = Math.max(
      50,
      Math.min(2000, note.duration + deltaX * SENSITIVITY),
    )

    const updatedNote = {
      ...note,
      velocity: newVelocity,
      duration: newDuration,
    }

    setNote(updatedNote)
    onNoteUpdate?.(updatedNote)

    setDragStart({ x: clientX, y: clientY })
  }

  const _handleDragStart = (event: React.TouchEvent | React.MouseEvent) => {
    const clientX =
      'touches' in event ? event.touches[0]!.clientX : event.clientX
    const clientY =
      'touches' in event ? event.touches[0]!.clientY : event.clientY

    setDragStart({ x: clientX, y: clientY })
    setIsDragging(true)
  }

  return (
    <div
      className="xy-pad"
      onTouchStart={handleTapStart}
      onTouchMove={handleDrag}
      onTouchEnd={handleTapEnd}
      onMouseDown={handleTapStart}
      onMouseMove={handleDrag}
      onMouseUp={handleTapEnd}
      style={{
        width: '100%',
        height: '100%',
        background: '#1a1a1a',
        borderRadius: '8px',
        cursor: 'pointer',
        touchAction: 'none',
      }}
    >
      {note && (
        <div
          className="note-chip"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner circle = velocity (brightness) */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: getVelocityColor(note.velocity),
              boxShadow: `0 0 ${note.velocity / 20}px ${getVelocityColor(note.velocity)}`,
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          />

          {/* Outer ring = duration (thickness) */}
          <div
            style={{
              position: 'absolute',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: `${getDurationStroke(note.duration)}px solid ${getVelocityColor(note.velocity)}`,
              opacity: isEditing ? 1 : 0.6,
              transition: 'border-width 0.15s, opacity 0.15s',
            }}
          />
        </div>
      )}

      {!note && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          Tap to create note
        </div>
      )}
    </div>
  )
}
