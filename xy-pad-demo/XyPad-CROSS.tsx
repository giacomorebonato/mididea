import React, { useState, useRef, useCallback, useEffect } from 'react';
import { XyPadAudioEngine } from './XyPadAudioEngine';
import './XyPad.css';

interface Note {
  pitch: number;
  velocity: number; // 0-127 (line width)
  duration: number; // milliseconds (line height)
}

interface XyPadProps {
  onNoteUpdate?: (note: Note) => void;
  stepIndex?: number;
  pitch?: number; // Optional: if provided, sets pitch value
  selected?: boolean; // Optional: toggle selection state
}

export const XyPad: React.FC<XyPadProps> = ({ onNoteUpdate, stepIndex, pitch, selected }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Audio engine
  const audioEngine = useRef<XyPadAudioEngine | null>(null);

  // Initialize audio engine on first user interaction
  const initAudio = useCallback(async () => {
    if (audioEngine.current) return;
    audioEngine.current = new XyPadAudioEngine();
    await audioEngine.current.init();
  }, []);

  // Velocity color mapping (line color based on velocity)
  const getVelocityColor = (velocity: number): string => {
    const intensity = velocity / 127;
    return `hsl(30, ${50 + intensity * 50}%, ${40 + intensity * 60}%)`;
  };

  // Get note dimensions based on velocity (width) and duration (height)
  const getNoteDimensions = (note: Note) => {
    const baseSize = 48;
    const velocityWidth = Math.max(20, note.velocity / 2); // 1-127 → 20-63px width
    const durationHeight = Math.max(40, note.duration / 10); // 50-2000ms → 40-200px height
    const durationRatio = durationHeight / baseSize;

    return {
      width: velocityWidth,
      height: durationHeight,
      baseSize,
      durationRatio,
    };
  };

  // Handle note creation/toggle
  const handleToggle = useCallback(async (event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();

    // Initialize audio on first interaction
    if (!audioEngine.current) {
      await initAudio();
    }

    if (note) {
      // Toggle off (remove note)
      setNote(null);
      onNoteUpdate?.(null);
      if (audioEngine.current) {
        audioEngine.current.stopAll();
      }
    } else {
      // Create new note
      const newNote: Note = {
        pitch: pitch || 0,
        velocity: 64, // Medium velocity (medium width)
        duration: 500, // Medium duration (medium height)
      };
      setNote(newNote);

      // Preview immediately
      if (audioEngine.current) {
        audioEngine.current.previewNote(pitch || 0, 64);
      }
    }
  }, [pitch, note, audioEngine, initAudio]);

  // Handle drag gestures for duration (vertical) and velocity (horizontal)
  const handleDrag = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !note || !audioEngine.current) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - dragStart.x; // Horizontal = velocity
    const deltaY = clientY - dragStart.y; // Vertical = duration

    const VELOCITY_SENSITIVITY = 2; // Pixels per velocity unit
    const DURATION_SENSITIVITY = 5; // Pixels per duration unit (ms)

    // Horizontal drag = velocity adjustment (line width)
    const newVelocity = Math.max(0, Math.min(127, note.velocity + deltaX * VELOCITY_SENSITIVITY));

    // Vertical drag = duration adjustment (line height)
    const newDuration = Math.max(50, Math.min(2000, note.duration + deltaY * DURATION_SENSITIVITY));

    const updatedNote = {
      ...note,
      velocity: newVelocity,
      duration: newDuration,
    };

    setNote(updatedNote);
    onNoteUpdate?.(updatedNote);

    // Real-time preview during drag
    audioEngine.current.playNote(
      updatedNote.pitch,
      updatedNote.velocity,
      updatedNote.duration
    );

    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, note, dragStart, onNoteUpdate, audioEngine]);

  const handleDragStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  }, []);

  // Get note dimensions for cross-shape rendering
  const dims = note ? getNoteDimensions(note) : null;

  return (
    <div
      className={`xy-pad ${selected ? 'xy-pad--selected' : ''}`}
      onTouchStart={handleToggle}
      onTouchMove={handleDrag}
      onTouchEnd={() => setIsDragging(false)}
      onMouseDown={handleToggle}
      onMouseMove={handleDrag}
      onMouseUp={() => setIsDragging(false)}
    >
      {note && dims && (
        <div
          className="note-cross"
          style={{
            width: dims.width,
            height: dims.height,
            background: getVelocityColor(note.velocity),
          }}
        >
          {/* Center circle = pitch indicator */}
          <div
            className="note-center"
            style={{
              width: Math.max(20, dims.baseSize * 0.6), // 60% of base size
              height: Math.max(20, dims.baseSize * 0.6),
              background: `hsl(30, ${80 + note.velocity / 5}%, ${70 + note.velocity / 5}%)`, // Slightly brighter
            }}
          />

          {/* Vertical arms = duration */}
          <div
            className="note-arm note-arm--vertical"
            style={{
              width: dims.baseSize * 0.4,
              height: (dims.height - dims.baseSize) / 2,
            }}
          />

          {/* Horizontal arms = velocity */}
          <div
            className="note-arm note-arm--horizontal"
            style={{
              width: (dims.width - dims.baseSize) / 2,
              height: dims.baseSize * 0.4,
            }}
          />
        </div>
      )}

      {!note && (
        <div className="tap-prompt">
          Tap to create note
          {stepIndex !== undefined && (
            <div className="step-hint">Step {stepIndex + 1}</div>
          )}
        </div>
      )}
    </div>
  );
};
