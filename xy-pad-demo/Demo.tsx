import React, { useState } from 'react';
import { XyPad } from './XyPad';

interface Note {
  pitch: number;
  velocity: number;
  duration: number;
}

export const Demo: React.FC = () => {
  const [steps, setSteps] = useState<Array<Note | null>>(
    Array.from({ length: 8 }).map(() => null)
  );

  const handleNoteUpdate = (stepIndex: number, updatedNote: any) => {
    setSteps(prev => {
      const updated = [...prev];
      updated[stepIndex] = updatedNote;
      return updated;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>XyPad Velocity/Duration Demo</h1>
        <p style={styles.subtitle}>
          Mobile-First • Dark Mode • Single Chip Encoding
        </p>
      </div>

      <div style={styles.grid}>
        {steps.map((note, index) => (
          <div key={index} style={styles.step}>
            <div style={styles.stepNumber}>{index + 1}</div>
            
            <div style={styles.xyPadWrapper}>
              <XyPad
                stepIndex={index}
                pitch={index * 12} // Scale degrees
                onNoteUpdate={(note) => handleNoteUpdate(index, note)}
              />
            </div>

            {note && (
              <div style={styles.noteSummary}>
                V:{note.velocity} • D:{note.duration}ms
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>XyPad Controls:</h3>
        <ul style={styles.instructionsList}>
          <li><strong>Tap</strong> - Create note (duration = hold time)</li>
          <li><strong>Hold longer</strong> - Longer initial duration</li>
          <li><strong>Slide up/down</strong> - Adjust velocity (inner circle brightness)</li>
          <li><strong>Slide left/right</strong> - Adjust duration (outer ring thickness)</li>
          <li><strong>Tap chip again</strong> - Remove note</li>
        </ul>
      </div>

      <div style={styles.status}>
        <h3 style={styles.statusTitle}>Implementation Status:</h3>
        <ul style={styles.statusList}>
          <li>✅ Single chip encoding (inner = velocity, outer = duration)</li>
          <li>✅ Tap timing duration (how long you hold)</li>
          <li>✅ Slide-up/down velocity gesture</li>
          <li>✅ Slide-left/right duration gesture</li>
          <li>✅ Dark mode only (studio aesthetic)</li>
          <li>✅ Mobile first (44px touch targets)</li>
          <li>⏳ Tone.js audio integration (next phase)</li>
        </ul>
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

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '30px',
  } as const,

  step: {
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '300px',
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
    minHeight: '200px',
  } as const,

  noteSummary: {
    fontSize: '10px',
    color: '#666',
    textAlign: 'center',
    marginTop: '10px',
  } as const,

  instructions: {
    background: '#151515',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
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
  } as const,

  status: {
    background: '#0d3319',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
  } as const,

  statusTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  } as const,

  statusList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
  } as const,
};
