export interface Scale {
  name: string
  mood: string
  intervals: number[] // semitone intervals from root
}

export const SCALES: Scale[] = [
  {
    name: 'Major Pentatonic',
    mood: 'Happy',
    intervals: [0, 2, 4, 7, 9],
  },
  {
    name: 'Minor Pentatonic',
    mood: 'Melancholic',
    intervals: [0, 3, 5, 7, 10],
  },
  {
    name: 'Dorian',
    mood: 'Funky',
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    name: 'Phrygian',
    mood: 'Mysterious',
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    name: 'Mixolydian',
    mood: 'Groovy',
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    name: 'Blues',
    mood: 'Soulful',
    intervals: [0, 3, 5, 6, 7, 10],
  },
  {
    name: 'Harmonic Minor',
    mood: 'Dark',
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    name: 'Whole Tone',
    mood: 'Spacey',
    intervals: [0, 2, 4, 6, 8, 10],
  },
]

const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export const ROOT_NOTES = NOTE_NAMES

/** Convert a MIDI note number to a note name like "C4" */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[midi % 12]
  return `${name}${octave}`
}

/** Convert a note name like "C4" to a MIDI number */
export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d+)$/)
  if (!match) return 60
  const name = match[1]!
  const octaveStr = match[2]!
  const noteIndex = NOTE_NAMES.indexOf(name)
  const octave = Number.parseInt(octaveStr, 10)
  return (octave + 1) * 12 + noteIndex
}

/**
 * Generate all notes in a scale across a range of octaves.
 * Returns note names like ["C3", "D3", "E3", ...]
 */
export function getScaleNotes(
  scale: Scale,
  rootNote: string,
  octaveStart: number,
  octaveEnd: number,
): string[] {
  const rootIndex = NOTE_NAMES.indexOf(rootNote)
  if (rootIndex === -1) return []

  const notes: string[] = []
  for (let octave = octaveStart; octave <= octaveEnd; octave++) {
    for (const interval of scale.intervals) {
      const midiNote = (octave + 1) * 12 + rootIndex + interval
      if (
        midiNote >= (octaveStart + 1) * 12 &&
        midiNote <= (octaveEnd + 2) * 12
      ) {
        notes.push(midiToNote(midiNote))
      }
    }
  }
  return notes
}

/**
 * Map a normalized X position (0-1) to the nearest scale note.
 */
export function xToScaleNote(x: number, scaleNotes: string[]): string {
  const index = Math.round(x * (scaleNotes.length - 1))
  return scaleNotes[Math.max(0, Math.min(index, scaleNotes.length - 1))]!
}

/**
 * Get a color for a note based on its MIDI pitch.
 * Low = warm (red/orange), High = cool (blue/purple)
 */
export function noteToColor(note: string): string {
  const midi = noteToMidi(note)
  // Map MIDI 36-84 (C2-C6) range to hue 0-270 (red to purple)
  const normalized = Math.max(0, Math.min(1, (midi - 36) / 48))
  const hue = normalized * 270
  return `hsl(${hue}, 80%, 55%)`
}
