import { useEffect, useReducer, useRef } from 'react'
import {
  createEmptyDrumGrid,
  createEmptySynthTrack,
  DEFAULT_BPM,
  DEFAULT_STEP_COUNT,
  DEFAULT_SWING,
  MAX_BPM,
  MAX_SWING,
  MIN_BPM,
  type SequencerAction,
  type SequencerState,
} from './types'

const STORAGE_KEY = 'mididea-sequencer-state'

const TRANSIENT_KEYS: (keyof SequencerState)[] = [
  'isPlaying',
  'currentStep',
  'activeXyPad',
]

const initialState: SequencerState = {
  drumGrid: createEmptyDrumGrid(DEFAULT_STEP_COUNT),
  synthTracks: [createEmptySynthTrack('synth-1', 'glass', DEFAULT_STEP_COUNT)],
  bpm: DEFAULT_BPM,
  swing: DEFAULT_SWING,
  isPlaying: false,
  currentStep: -1,
  stepCount: DEFAULT_STEP_COUNT,
  scaleIndex: 0,
  rootNote: 'C',
  activeXyPad: null,
}

export function sequencerReducer(
  state: SequencerState,
  action: SequencerAction,
): SequencerState {
  switch (action.type) {
    case 'TOGGLE_STEP': {
      const row = [...state.drumGrid[action.drum]]
      row[action.step] = !row[action.step]
      return { ...state, drumGrid: { ...state.drumGrid, [action.drum]: row } }
    }
    case 'ADD_SYNTH_NOTE': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId
            ? {
                ...t,
                steps: t.steps.map((s, i) =>
                  i === action.step ? [...s, action.note] : s,
                ),
              }
            : t,
        ),
      }
    }
    case 'REMOVE_SYNTH_NOTE': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId
            ? {
                ...t,
                steps: t.steps.map((s, i) =>
                  i === action.step
                    ? s.filter((_, ni) => ni !== action.noteIndex)
                    : s,
                ),
              }
            : t,
        ),
      }
    }
    case 'CLEAR_SYNTH_STEP': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId
            ? {
                ...t,
                steps: t.steps.map((s, i) => (i === action.step ? [] : s)),
              }
            : t,
        ),
      }
    }
    case 'SET_SYNTH_PRESET': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId ? { ...t, presetId: action.presetId } : t,
        ),
      }
    }
    case 'SET_SYNTH_NOTE_DURATION': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId
            ? {
                ...t,
                steps: t.steps.map((s, i) =>
                  i === action.step
                    ? s.map((n, ni) =>
                        ni === action.noteIndex
                          ? { ...n, duration: action.duration }
                          : n,
                      )
                    : s,
                ),
              }
            : t,
        ),
      }
    }
    case 'UPDATE_SYNTH_NOTE': {
      return {
        ...state,
        synthTracks: state.synthTracks.map((t) =>
          t.id === action.trackId
            ? {
                ...t,
                steps: t.steps.map((s, i) =>
                  i === action.step
                    ? s.map((n, ni) =>
                        ni === action.noteIndex
                          ? {
                              ...n,
                              pitch: action.pitch,
                              velocity: action.velocity,
                            }
                          : n,
                      )
                    : s,
                ),
              }
            : t,
        ),
      }
    }
    case 'OPEN_XY_PAD':
      return {
        ...state,
        activeXyPad: { trackId: action.trackId, step: action.step },
      }
    case 'CLOSE_XY_PAD':
      return { ...state, activeXyPad: null }
    case 'ADD_SYNTH_TRACK': {
      const newTrack = createEmptySynthTrack(
        action.trackId,
        action.presetId,
        state.stepCount,
      )
      return { ...state, synthTracks: [...state.synthTracks, newTrack] }
    }
    case 'REMOVE_SYNTH_TRACK':
      return {
        ...state,
        synthTracks: state.synthTracks.filter((t) => t.id !== action.trackId),
        activeXyPad:
          state.activeXyPad?.trackId === action.trackId
            ? null
            : state.activeXyPad,
      }
    case 'SET_BPM':
      return { ...state, bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, action.bpm)) }
    case 'SET_SWING':
      return { ...state, swing: Math.max(0, Math.min(MAX_SWING, action.swing)) }
    case 'SET_SCALE':
      return { ...state, scaleIndex: action.scaleIndex }
    case 'SET_ROOT_NOTE':
      return { ...state, rootNote: action.rootNote }
    case 'PLAY':
      return { ...state, isPlaying: true, currentStep: -1 }
    case 'STOP':
      return { ...state, isPlaying: false, currentStep: -1 }
    case 'ADVANCE_STEP':
      return {
        ...state,
        currentStep: (state.currentStep + 1) % state.stepCount,
      }
    case 'CLEAR_ALL':
      return {
        ...state,
        drumGrid: createEmptyDrumGrid(state.stepCount),
        synthTracks: state.synthTracks.map((t) =>
          createEmptySynthTrack(t.id, t.presetId, state.stepCount),
        ),
        isPlaying: false,
        currentStep: -1,
      }
    default:
      return state
  }
}

function loadPersistedState(): SequencerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const saved = JSON.parse(raw)
    // Merge with initial state to handle missing keys from newer versions
    return {
      ...initialState,
      ...saved,
      // Always reset transient state
      isPlaying: false,
      currentStep: -1,
      activeXyPad: null,
    }
  } catch {
    return initialState
  }
}

function persistState(state: SequencerState) {
  try {
    const toSave: Record<string, unknown> = { ...state }
    for (const key of TRANSIENT_KEYS) {
      delete toSave[key]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function useSequencer(): [
  SequencerState,
  React.Dispatch<SequencerAction>,
] {
  const [state, dispatch] = useReducer(
    sequencerReducer,
    undefined,
    loadPersistedState,
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Persist on state changes (debounced, skip transient-only changes)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => persistState(state), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    state.drumGrid,
    state.synthTracks,
    state.bpm,
    state.swing,
    state.scaleIndex,
    state.rootNote,
    state.stepCount,
    state,
  ])

  return [state, dispatch]
}

/** Export for use in composition saving */
export { initialState, STORAGE_KEY, TRANSIENT_KEYS }
