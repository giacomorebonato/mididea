import React from 'react';
import { XyPad } from './components/XyPad';

interface Step {
  id: string;
  notes: Array<{
    pitch: number;
    velocity: number;
    duration: number;
  }>;
}

export const StepSequencer: React.FC = () => {
  const [steps, setSteps] = useState<Step[]>([]);

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
        <h1 style={styles.title}>Step Sequencer</h1>
        <p style={styles.subtitle}>
          XyPad Integration • Velocity + Duration • Single Chip Encoding
        </p>
      </div>

      <div style={styles.grid}>
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            style={styles.step}
          >
            <div style={styles.stepNumber}>{index + 1}</div>
            
            {/* XyPad integrated into each step */}
            <div style={styles.xyPadWrapper}>
              <XyPad
                stepIndex={index}
                onNoteUpdate={(note) => handleNoteUpdate(index, note)}
              />
            </div>

            {/* Show existing notes summary */}
            {steps[index]?.notes.map((note, noteIndex) => (
              <div
                key={noteIndex}
                style={styles.noteSummary}
              >
                V:{note.velocity} • D:{note.duration}ms
              </div>
            ))}
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
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '30px',
  } as const,

  step: {
    background: '#1a1a1a',
    borderRadius: '8px',
    padding: '12px',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as const,

  stepNumber: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
  } as const,

  xyPadWrapper: {
    flex: 1,
    background: '#0d0d0d',
    borderRadius: '8px',
    overflow: 'hidden',
  } as const,

  noteSummary: {
    fontSize: '10px',
    color: '#666',
    textAlign: 'center',
    padding: '4px',
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
};
