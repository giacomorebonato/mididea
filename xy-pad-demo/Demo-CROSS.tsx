import React, { useState } from 'react';
import { XyPad } from './XyPad-CROSS'; // Use CROSS-EXPANSION version
import './XyPad-CROSS.css';

interface Note {
  pitch: number;
  velocity: number;
  duration: number;
}

export const Demo: React.FC = () => {
  const [steps, setSteps] = useState<Array<Note | null>>(
    Array.from({ length: 8 }).map(() => null)
  );

  const [audioReady, setAudioReady] = useState(false);

  const handleNoteUpdate = (stepIndex: number, updatedNote: any) => {
    setSteps(prev => {
      const updated = [...prev];
      const step = updated[stepIndex];

      if (step) {
        if (updatedNote === null) {
          // Remove note
          step.notes = [];
        } else {
          // Update or add note
          const existingNoteIndex = step.notes.findIndex(n => n.pitch === updatedNote.pitch);

          if (existingNoteIndex >= 0) {
            step.notes[existingNoteIndex] = updatedNote;
          } else {
            step.notes.push(updatedNote);
          }
        }
      }

      return updated;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Cross-Expansion XyPad</h1>
        <p style={styles.subtitle}>
          Vertical Duration • Horizontal Velocity • Toggle to Select
        </p>
        {audioReady && (
          <div style={styles.audioBadge}>🎹 Audio Ready</div>
        )}
      </div>

      <div style={styles.grid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            style={styles.step}
          >
            <div style={styles.stepNumber}>{index + 1}</div>

            <div style={styles.xyPadWrapper}>
              <XyPad
                stepIndex={index}
                pitch={index * 12} // Scale degrees: C, D, E, F, G, A, B
                onNoteUpdate={(note) => {
                  setAudioReady(true);
                  handleNoteUpdate(index, note);
                }}
              />
            </div>

            {steps[index]?.notes.map((note, noteIndex) => (
              <div
                key={noteIndex}
                style={styles.noteSummary}
              >
                V:{note.velocity} • D:{note.duration}ms
                <div style={styles.dimensionBreakdown}>
                  Width: {Math.round(note.velocity / 2)}px • Height: {Math.round(note.duration / 10)}px
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>Cross-Expansion Controls:</h3>
        <ul style={styles.instructionsList}>
          <li><strong>Tap</strong> - Create note (small cross shape)</li>
          <li><strong>Drag UP</strong> - Expand vertically (longer duration)</li>
          <li><strong>Drag DOWN</strong> - Shrink vertically (shorter duration)</li>
          <li><strong>Drag RIGHT</strong> - Expand horizontally (louder velocity)</li>
          <li><strong>Drag LEFT</strong> - Shrink horizontally (softer velocity)</li>
          <li><strong>Click Again</strong> - Remove note (toggle off)</li>
        </ul>

        <div style={styles.visualLegend}>
          <h4 style={styles.legendTitle}>Visual Legend:</h4>
          <ul style={styles.legendList}>
            <li><strong>Center Circle:</strong> Pitch indicator</li>
            <li><strong>Vertical Arms:</strong> Duration (longer = taller)</li>
            <li><strong>Horizontal Arms:</strong> Velocity (wider = louder)</li>
            <li><strong>Overall Color:</strong> Velocity intensity (bright = loud)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    padding: '20px',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  } as const,

  header: {
    marginBottom: '30px',
    textAlign: 'center' as const,
  } as const,

  title: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: 'bold' as const,
  } as const,

  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    opacity: 0.8,
    color: '#cccccc',
  } as const,

  audioBadge: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    background: '#0d6319',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  } as const,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '30px',
  } as const,

  step: {
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  } as const,

  stepNumber: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
  } as const,

  xyPadWrapper: {
    flex: 1,
    background: '#0d0d0d',
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: '150px',
  } as const,

  noteSummary: {
    fontSize: '10px',
    color: '#666',
    textAlign: 'center',
    marginTop: '12px',
    padding: '8px',
    background: '#0f0f0f',
    borderRadius: '4px',
  } as const,

  dimensionBreakdown: {
    marginTop: '4px',
    fontSize: '8px',
    color: '#888',
    fontStyle: 'italic',
  } as const,

  instructions: {
    background: '#151515',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '700px',
    margin: '0 auto 30px auto',
  } as const,

  instructionsTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  } as const,

  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
    marginBottom: '20px',
  } as const,

  visualLegend: {
    background: '#0d6319',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '700px',
    margin: '0 auto',
  } as const,

  legendTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
  } as const,

  legendList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.6',
  } as const,
};
