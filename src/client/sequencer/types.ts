// --- Drum types ---
export const DRUM_IDS = ['kick', 'snare', 'hihat', 'clap', 'tom', 'rim'] as const
export type DrumId = (typeof DRUM_IDS)[number]

export const DRUM_LABELS: Record<DrumId, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hihat: 'Hi-Hat',
  clap: 'Clap',
  tom: 'Tom',
  rim: 'Rim',
}

export type DrumGrid = Record<DrumId, boolean[]>

// --- Synth types ---
export interface SynthNote {
  pitch: string     // e.g. "C4", "E4"
  velocity: number  // 0-1, Y-axis value (loud ↔ soft)
  duration: number  // steps to sustain (1 = 16th, 2 = 8th, etc.)
}

/** A single synth step can hold multiple notes (chords) */
export type SynthStep = SynthNote[]

export interface SynthTrack {
  id: string
  presetId: string
  steps: SynthStep[]
}

// --- Sequencer state ---
export const DEFAULT_STEP_COUNT = 16
export const DEFAULT_BPM = 120
export const MIN_BPM = 40
export const MAX_BPM = 240
export const DEFAULT_SWING = 0
export const MAX_SWING = 100

export interface SequencerState {
  drumGrid: DrumGrid
  synthTracks: SynthTrack[]
  bpm: number
  swing: number
  isPlaying: boolean
  currentStep: number
  stepCount: number
  scaleIndex: number
  rootNote: string
  /** Which synth step is open for XY pad editing, null if closed */
  activeXyPad: { trackId: string; step: number } | null
}

export type SequencerAction =
  // Drum actions
  | { type: 'TOGGLE_STEP'; drum: DrumId; step: number }
  // Synth actions
  | { type: 'ADD_SYNTH_NOTE'; trackId: string; step: number; note: SynthNote }
  | { type: 'REMOVE_SYNTH_NOTE'; trackId: string; step: number; noteIndex: number }
  | { type: 'CLEAR_SYNTH_STEP'; trackId: string; step: number }
  | { type: 'SET_SYNTH_PRESET'; trackId: string; presetId: string }
  | { type: 'SET_SYNTH_NOTE_DURATION'; trackId: string; step: number; noteIndex: number; duration: number }
  | { type: 'UPDATE_SYNTH_NOTE'; trackId: string; step: number; noteIndex: number; pitch: string; velocity: number }
  // XY pad
  | { type: 'OPEN_XY_PAD'; trackId: string; step: number }
  | { type: 'CLOSE_XY_PAD' }
  // Track management
  | { type: 'ADD_SYNTH_TRACK'; trackId: string; presetId: string }
  | { type: 'REMOVE_SYNTH_TRACK'; trackId: string }
  // Global
  | { type: 'SET_BPM'; bpm: number }
  | { type: 'SET_SWING'; swing: number }
  | { type: 'SET_SCALE'; scaleIndex: number }
  | { type: 'SET_ROOT_NOTE'; rootNote: string }
  | { type: 'PLAY' }
  | { type: 'STOP' }
  | { type: 'ADVANCE_STEP' }
  | { type: 'CLEAR_ALL' }

// --- Backward compat alias ---
export type Grid = DrumGrid

export function createEmptyDrumGrid(stepCount: number): DrumGrid {
  const grid = {} as DrumGrid
  for (const drum of DRUM_IDS) {
    grid[drum] = new Array(stepCount).fill(false)
  }
  return grid
}

/** @deprecated Use createEmptyDrumGrid instead */
export const createEmptyGrid = createEmptyDrumGrid

export function createEmptySynthTrack(id: string, presetId: string, stepCount: number): SynthTrack {
  return {
    id,
    presetId,
    steps: Array.from({ length: stepCount }, () => []),
  }
}
