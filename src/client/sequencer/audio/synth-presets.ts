import * as Tone from 'tone'

export interface SynthPreset {
  id: string
  name: string
  knobLabel: string
  knobMin: number
  knobMax: number
  knobDefault: number
  create: () => Tone.PolySynth
}

function createGlass(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3,
    modulationIndex: 10,
    envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 },
    modulation: { type: 'sine' as const },
    oscillator: { type: 'sine' as const },
  })
}

function createWarm(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' as const },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.5 },
  })
}

function createBuzz(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' as const },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.2 },
  })
}

function createPluck(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' as const },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
  })
}

function createPad(): Tone.PolySynth {
  return new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 1,
    modulationIndex: 2,
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.8, release: 1.0 },
    modulation: { type: 'sine' as const },
    oscillator: { type: 'sine' as const },
  })
}

export const SYNTH_PRESETS: SynthPreset[] = [
  {
    id: 'glass',
    name: 'Glass',
    knobLabel: 'Decay',
    knobMin: 0.05,
    knobMax: 1.5,
    knobDefault: 0.4,
    create: createGlass,
  },
  {
    id: 'warm',
    name: 'Warm',
    knobLabel: 'Warmth',
    knobMin: 200,
    knobMax: 8000,
    knobDefault: 2000,
    create: createWarm,
  },
  {
    id: 'buzz',
    name: 'Buzz',
    knobLabel: 'Drive',
    knobMin: 0,
    knobMax: 1,
    knobDefault: 0.3,
    create: createBuzz,
  },
  {
    id: 'pluck',
    name: 'Pluck',
    knobLabel: 'Brightness',
    knobMin: 500,
    knobMax: 10000,
    knobDefault: 3000,
    create: createPluck,
  },
  {
    id: 'pad',
    name: 'Pad',
    knobLabel: 'Depth',
    knobMin: 0.5,
    knobMax: 3.0,
    knobDefault: 1.0,
    create: createPad,
  },
]

export function getPresetById(id: string): SynthPreset {
  return SYNTH_PRESETS.find((p) => p.id === id) ?? SYNTH_PRESETS[0]!
}
