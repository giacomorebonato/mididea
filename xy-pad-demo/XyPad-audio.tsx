import React, { useState, useRef, useCallback, useEffect } from 'react';
import { XyPadAudioEngine } from './XyPadAudioEngine';

interface Note {
  pitch: number;
  velocity: number; // 0-127
  duration: number; // milliseconds
}

interface XyPadProps {
  onNoteUpdate?: (note: Note) => void;
  stepIndex?: number;
  pitch?: number; // Optional: if provided, sets pitch value
}

export const XyPad: React.FC<XyPadProps> = ({ onNoteUpdate, stepIndex, pitch }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Audio engine
  const audioEngine = useRef<XyPadAudioEngine | null>(null);

  // Tap timing for duration
  const tapStartTimeRef = useRef<number | null>(null);

  // Initialize audio engine on first user interaction
  const initAudio = useCallback(async () => {
    if (audioEngine.current) return;
    audioEngine.current = new XyPadAudioEngine();
    await audioEngine.current.init();
  }, []);

  // Velocity color mapping (low to high)
  const getVelocityColor = (velocity: number): string => {
    const intensity = velocity / 127;
    return `hsl(30, ${50 + intensity * 50}%, ${40 + intensity * 60}%)`;
  };

  // Duration ring thickness
  const getDurationStroke = (durationMs: number): number => {
    if (durationMs < 250) return 2;
    if (durationMs < 500) return 4;
    return 6;
  };

  // Handle note placement/tap
  const handleTapStart = useCallback(async (event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();

    // Initialize audio on first interaction
    if (!audioEngine.current) {
      await initAudio();
    }

    tapStartTimeRef.current = Date.now();
    setIsEditing(true);

    // If no note, create one with defaults
    if (!note) {
      const newNote: Note = {
        pitch: pitch || 0,
        velocity: 64, // Medium velocity
        duration: 250, // Short default
      };
      setNote(newNote);

      // Preview immediately
      if (audioEngine.current) {
        audioEngine.current.previewNote(pitch || 0, 64);
      }
    }
  }, [pitch, note, audioEngine, initAudio]);

  // Handle note release - determines duration from tap timing
  const handleTapEnd = useCallback(() => {
    setIsDragging(false);
    setIsEditing(false);

    if (note && tapStartTimeRef.current && audioEngine.current) {
      const tapDuration = Date.now() - tapStartTimeRef.current;
      const updatedNote = {
        ...note,
        duration: tapDuration,
      };
      setNote(updatedNote);
      onNoteUpdate?.(updatedNote);

      // Play new note with correct duration
      audioEngine.current.playNote(
        updatedNote.pitch,
        updatedNote.velocity,
        updatedNote.duration
      );
    }
    tapStartTimeRef.current = null;
  }, [note, audioEngine, onNoteUpdate]);

  // Handle slide gestures for velocity/duration adjustment
  const handleDrag = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !note || !audioEngine.current) return;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    const SENSITIVITY = 2; // Pixels per velocity/duration unit

    // Slide up/down = velocity adjustment
    const newVelocity = Math.max(0, Math.min(127, note.velocity - deltaY * SENSITIVITY));

    // Slide left/right = duration adjustment
    const newDuration = Math.max(50, Math.min(2000, note.duration + deltaX * SENSITIVITY));

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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioEngine.current) {
        audioEngine.current.dispose();
      }
    };
  }, [audioEngine]);

  return (
    <div
      className="xy-pad"
      onTouchStart={handleTapStart}
      onTouchMove={handleDrag}
      onTouchEnd={handleTapEnd}
      onMouseDown={handleTapStart}
      onMouseMove={handleDrag}
      onMouseUp={handleTapEnd}
    >
      {note && (
        <div className="note-chip">
          {/* Inner circle = velocity (brightness) */}
          <div
            className="note-circle"
            style={{
              background: getVelocityColor(note.velocity),
              boxShadow: `0 0 ${note.velocity / 20}px ${getVelocityColor(note.velocity)}`,
            }}
          />

          {/* Outer ring = duration (thickness) */}
          <div
            className="duration-ring"
            style={{
              borderColor: getVelocityColor(note.velocity),
              borderWidth: `${getDurationStroke(note.duration)}px`,
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
