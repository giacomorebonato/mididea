import { describe, expect, test } from 'bun:test'
import type { SequencerState } from '../types'
import {
  DEFAULT_BPM,
  DEFAULT_STEP_COUNT,
  DEFAULT_SWING,
  MAX_BPM,
  MAX_SWING,
  MIN_BPM,
} from '../types'
import {
  initialState,
  STORAGE_KEY,
  sequencerReducer,
  TRANSIENT_KEYS,
} from '../use-sequencer'

describe('constants', () => {
  test('STORAGE_KEY is the expected value', () => {
    expect(STORAGE_KEY).toBe('mididea-sequencer-state')
  })

  test('TRANSIENT_KEYS lists isPlaying, currentStep, activeXyPad', () => {
    expect(TRANSIENT_KEYS).toEqual(['isPlaying', 'currentStep', 'activeXyPad'])
  })
})

describe('initialState', () => {
  test('has correct default bpm', () => {
    expect(initialState.bpm).toBe(DEFAULT_BPM)
  })

  test('has correct default swing', () => {
    expect(initialState.swing).toBe(DEFAULT_SWING)
  })

  test('is not playing', () => {
    expect(initialState.isPlaying).toBe(false)
  })

  test('currentStep starts at -1', () => {
    expect(initialState.currentStep).toBe(-1)
  })

  test('stepCount is DEFAULT_STEP_COUNT', () => {
    expect(initialState.stepCount).toBe(DEFAULT_STEP_COUNT)
  })

  test('scaleIndex is 0', () => {
    expect(initialState.scaleIndex).toBe(0)
  })

  test('rootNote is C', () => {
    expect(initialState.rootNote).toBe('C')
  })

  test('activeXyPad is null', () => {
    expect(initialState.activeXyPad).toBeNull()
  })

  test('drumGrid has all drums with all-false arrays', () => {
    const grid = initialState.drumGrid
    for (const drum of [
      'kick',
      'snare',
      'hihat',
      'clap',
      'tom',
      'rim',
    ] as const) {
      expect(grid[drum]).toHaveLength(DEFAULT_STEP_COUNT)
      expect(grid[drum].every((v) => v === false)).toBe(true)
    }
  })

  test('synthTracks starts with one default track', () => {
    expect(initialState.synthTracks).toHaveLength(1)
    expect(initialState.synthTracks[0]?.id).toBe('synth-1')
    expect(initialState.synthTracks[0]?.presetId).toBe('glass')
    expect(initialState.synthTracks[0]?.steps).toHaveLength(DEFAULT_STEP_COUNT)
  })
})

describe('TOGGLE_STEP', () => {
  test('toggles a drum step on', () => {
    const next = sequencerReducer(initialState, {
      type: 'TOGGLE_STEP',
      drum: 'kick',
      step: 0,
    })
    expect(next.drumGrid.kick[0]).toBe(true)
    expect(next.drumGrid.kick[1]).toBe(false)
    expect(next.drumGrid.snare[0]).toBe(false)
  })

  test('toggles a drum step off', () => {
    let state = sequencerReducer(initialState, {
      type: 'TOGGLE_STEP',
      drum: 'snare',
      step: 3,
    })
    expect(state.drumGrid.snare[3]).toBe(true)
    state = sequencerReducer(state, {
      type: 'TOGGLE_STEP',
      drum: 'snare',
      step: 3,
    })
    expect(state.drumGrid.snare[3]).toBe(false)
  })

  test('does not mutate the original state', () => {
    const original = {
      ...initialState,
      drumGrid: {
        ...initialState.drumGrid,
        kick: [...initialState.drumGrid.kick],
      },
    }
    sequencerReducer(original, { type: 'TOGGLE_STEP', drum: 'kick', step: 0 })
    expect(original.drumGrid.kick[0]).toBe(false)
  })
})

describe('ADD_SYNTH_NOTE', () => {
  test('adds a note to a specific step', () => {
    const note = { pitch: 'C4', velocity: 0.8, duration: 1 }
    const next = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note,
    })
    expect(next.synthTracks[0]?.steps[0]).toEqual([note])
  })

  test('adds multiple notes to the same step (chord)', () => {
    const n1 = { pitch: 'C4', velocity: 0.8, duration: 1 }
    const n2 = { pitch: 'E4', velocity: 0.6, duration: 1 }
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note: n1,
    })
    state = sequencerReducer(state, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note: n2,
    })
    expect(state.synthTracks[0]?.steps[0]).toEqual([n1, n2])
  })

  test('does not affect other tracks', () => {
    const note = { pitch: 'D4', velocity: 0.5, duration: 2 }
    const next = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'nonexistent',
      step: 0,
      note,
    })
    expect(next.synthTracks[0]?.steps[0]).toEqual([])
  })
})

describe('REMOVE_SYNTH_NOTE', () => {
  test('removes a note by index', () => {
    const n1 = { pitch: 'C4', velocity: 0.8, duration: 1 }
    const n2 = { pitch: 'E4', velocity: 0.6, duration: 1 }
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 2,
      note: n1,
    })
    state = sequencerReducer(state, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 2,
      note: n2,
    })
    state = sequencerReducer(state, {
      type: 'REMOVE_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 2,
      noteIndex: 0,
    })
    expect(state.synthTracks[0]?.steps[2]).toEqual([n2])
  })
})

describe('CLEAR_SYNTH_STEP', () => {
  test('clears all notes from a step', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 4,
      note: { pitch: 'G4', velocity: 0.9, duration: 1 },
    })
    state = sequencerReducer(state, {
      type: 'CLEAR_SYNTH_STEP',
      trackId: 'synth-1',
      step: 4,
    })
    expect(state.synthTracks[0]?.steps[4]).toEqual([])
  })
})

describe('SET_SYNTH_PRESET', () => {
  test('changes the preset of a track', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_SYNTH_PRESET',
      trackId: 'synth-1',
      presetId: 'bass',
    })
    expect(next.synthTracks[0]?.presetId).toBe('bass')
  })

  test('does not affect other tracks', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_TRACK',
      trackId: 'synth-2',
      presetId: 'lead',
    })
    state = sequencerReducer(state, {
      type: 'SET_SYNTH_PRESET',
      trackId: 'synth-1',
      presetId: 'bass',
    })
    expect(state.synthTracks[1]?.presetId).toBe('lead')
  })
})

describe('SET_SYNTH_NOTE_DURATION', () => {
  test('updates duration of a specific note', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note: { pitch: 'C4', velocity: 0.8, duration: 1 },
    })
    state = sequencerReducer(state, {
      type: 'SET_SYNTH_NOTE_DURATION',
      trackId: 'synth-1',
      step: 0,
      noteIndex: 0,
      duration: 4,
    })
    expect(state.synthTracks[0]?.steps[0]?.[0]?.duration).toBe(4)
  })
})

describe('UPDATE_SYNTH_NOTE', () => {
  test('updates pitch and velocity', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note: { pitch: 'C4', velocity: 0.8, duration: 1 },
    })
    state = sequencerReducer(state, {
      type: 'UPDATE_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      noteIndex: 0,
      pitch: 'D4',
      velocity: 0.5,
    })
    const note = state.synthTracks[0]?.steps[0]?.[0]
    expect(note!.pitch).toBe('D4')
    expect(note!.velocity).toBe(0.5)
    expect(note!.duration).toBe(1)
  })
})

describe('OPEN_XY_PAD', () => {
  test('sets activeXyPad', () => {
    const next = sequencerReducer(initialState, {
      type: 'OPEN_XY_PAD',
      trackId: 'synth-1',
      step: 3,
    })
    expect(next.activeXyPad).toEqual({ trackId: 'synth-1', step: 3 })
  })
})

describe('CLOSE_XY_PAD', () => {
  test('clears activeXyPad', () => {
    let state = sequencerReducer(initialState, {
      type: 'OPEN_XY_PAD',
      trackId: 'synth-1',
      step: 0,
    })
    state = sequencerReducer(state, { type: 'CLOSE_XY_PAD' })
    expect(state.activeXyPad).toBeNull()
  })
})

describe('ADD_SYNTH_TRACK', () => {
  test('appends a new empty track', () => {
    const next = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_TRACK',
      trackId: 'synth-2',
      presetId: 'lead',
    })
    expect(next.synthTracks).toHaveLength(2)
    expect(next.synthTracks[1]?.id).toBe('synth-2')
    expect(next.synthTracks[1]?.presetId).toBe('lead')
    expect(next.synthTracks[1]?.steps).toHaveLength(DEFAULT_STEP_COUNT)
  })
})

describe('REMOVE_SYNTH_TRACK', () => {
  test('removes the track by id', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_TRACK',
      trackId: 'synth-2',
      presetId: 'lead',
    })
    state = sequencerReducer(state, {
      type: 'REMOVE_SYNTH_TRACK',
      trackId: 'synth-2',
    })
    expect(state.synthTracks).toHaveLength(1)
    expect(state.synthTracks[0]?.id).toBe('synth-1')
  })

  test('clears activeXyPad if it was open on removed track', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_TRACK',
      trackId: 'synth-2',
      presetId: 'lead',
    })
    state = sequencerReducer(state, {
      type: 'OPEN_XY_PAD',
      trackId: 'synth-2',
      step: 0,
    })
    state = sequencerReducer(state, {
      type: 'REMOVE_SYNTH_TRACK',
      trackId: 'synth-2',
    })
    expect(state.activeXyPad).toBeNull()
  })

  test('keeps activeXyPad if it was on a different track', () => {
    let state = sequencerReducer(initialState, {
      type: 'ADD_SYNTH_TRACK',
      trackId: 'synth-2',
      presetId: 'lead',
    })
    state = sequencerReducer(state, {
      type: 'OPEN_XY_PAD',
      trackId: 'synth-1',
      step: 5,
    })
    state = sequencerReducer(state, {
      type: 'REMOVE_SYNTH_TRACK',
      trackId: 'synth-2',
    })
    expect(state.activeXyPad).toEqual({ trackId: 'synth-1', step: 5 })
  })
})

describe('SET_BPM', () => {
  test('sets bpm within range', () => {
    const next = sequencerReducer(initialState, { type: 'SET_BPM', bpm: 140 })
    expect(next.bpm).toBe(140)
  })

  test('clamps to MIN_BPM', () => {
    const next = sequencerReducer(initialState, { type: 'SET_BPM', bpm: 10 })
    expect(next.bpm).toBe(MIN_BPM)
  })

  test('clamps to MAX_BPM', () => {
    const next = sequencerReducer(initialState, { type: 'SET_BPM', bpm: 500 })
    expect(next.bpm).toBe(MAX_BPM)
  })
})

describe('SET_SWING', () => {
  test('sets swing within range', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_SWING',
      swing: 50,
    })
    expect(next.swing).toBe(50)
  })

  test('clamps to 0 minimum', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_SWING',
      swing: -10,
    })
    expect(next.swing).toBe(0)
  })

  test('clamps to MAX_SWING', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_SWING',
      swing: 200,
    })
    expect(next.swing).toBe(MAX_SWING)
  })
})

describe('SET_SCALE', () => {
  test('sets the scale index', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_SCALE',
      scaleIndex: 3,
    })
    expect(next.scaleIndex).toBe(3)
  })
})

describe('SET_ROOT_NOTE', () => {
  test('sets the root note', () => {
    const next = sequencerReducer(initialState, {
      type: 'SET_ROOT_NOTE',
      rootNote: 'F#',
    })
    expect(next.rootNote).toBe('F#')
  })
})

describe('PLAY', () => {
  test('sets isPlaying to true and resets currentStep', () => {
    let state: SequencerState = {
      ...initialState,
      currentStep: 5,
      isPlaying: false,
    }
    state = sequencerReducer(state, { type: 'PLAY' })
    expect(state.isPlaying).toBe(true)
    expect(state.currentStep).toBe(-1)
  })
})

describe('STOP', () => {
  test('sets isPlaying to false and resets currentStep', () => {
    let state: SequencerState = {
      ...initialState,
      isPlaying: true,
      currentStep: 7,
    }
    state = sequencerReducer(state, { type: 'STOP' })
    expect(state.isPlaying).toBe(false)
    expect(state.currentStep).toBe(-1)
  })
})

describe('ADVANCE_STEP', () => {
  test('advances from -1 to 0 (first step)', () => {
    const next = sequencerReducer(initialState, { type: 'ADVANCE_STEP' })
    expect(next.currentStep).toBe(0)
  })

  test('wraps around at stepCount', () => {
    let state: SequencerState = { ...initialState, currentStep: 15 }
    state = sequencerReducer(state, { type: 'ADVANCE_STEP' })
    expect(state.currentStep).toBe(0)
  })

  test('advances normally in the middle', () => {
    let state: SequencerState = { ...initialState, currentStep: 5 }
    state = sequencerReducer(state, { type: 'ADVANCE_STEP' })
    expect(state.currentStep).toBe(6)
  })
})

describe('CLEAR_ALL', () => {
  test('resets drumGrid, synth tracks, playback state', () => {
    let state = sequencerReducer(initialState, {
      type: 'TOGGLE_STEP',
      drum: 'kick',
      step: 0,
    })
    state = sequencerReducer(state, {
      type: 'ADD_SYNTH_NOTE',
      trackId: 'synth-1',
      step: 0,
      note: { pitch: 'C4', velocity: 0.8, duration: 1 },
    })
    state = sequencerReducer(state, { type: 'PLAY' })
    state = sequencerReducer(state, { type: 'ADVANCE_STEP' })

    const cleared = sequencerReducer(state, { type: 'CLEAR_ALL' })

    expect(cleared.drumGrid.kick[0]).toBe(false)
    expect(cleared.synthTracks[0]?.steps[0]).toEqual([])
    expect(cleared.isPlaying).toBe(false)
    expect(cleared.currentStep).toBe(-1)
    expect(cleared.synthTracks[0]?.id).toBe('synth-1')
    expect(cleared.synthTracks[0]?.presetId).toBe('glass')
  })

  test('preserves bpm, swing, scale, rootNote', () => {
    let state = sequencerReducer(initialState, { type: 'SET_BPM', bpm: 180 })
    state = sequencerReducer(state, { type: 'SET_SWING', swing: 60 })
    state = sequencerReducer(state, { type: 'SET_SCALE', scaleIndex: 5 })
    state = sequencerReducer(state, { type: 'SET_ROOT_NOTE', rootNote: 'A' })

    const cleared = sequencerReducer(state, { type: 'CLEAR_ALL' })

    expect(cleared.bpm).toBe(180)
    expect(cleared.swing).toBe(60)
    expect(cleared.scaleIndex).toBe(5)
    expect(cleared.rootNote).toBe('A')
  })
})
