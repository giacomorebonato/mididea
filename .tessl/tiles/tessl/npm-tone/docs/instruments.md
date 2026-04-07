# Synthesizers and Instruments

Ready-to-use musical instruments including monophonic and polyphonic synthesizers with various synthesis techniques for creating musical sounds.

## Capabilities

### Basic Synthesizer

Simple oscillator-based synthesizer with ADSR envelope.

```typescript { .api }
/**
 * Basic synthesizer composed of an oscillator and amplitude envelope
 */
class Synth {
  constructor(options?: Partial<SynthOptions>);
  
  /** The oscillator */
  readonly oscillator: OmniOscillator;
  
  /** The frequency signal */
  readonly frequency: Signal<"frequency">;
  
  /** The detune signal in cents */
  readonly detune: Signal<"cents">;
  
  /** The amplitude envelope */
  readonly envelope: AmplitudeEnvelope;
  
  /** Trigger attack (note on) */
  triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this;
  
  /** Trigger release (note off) */
  triggerRelease(time?: Time): this;
  
  /** Trigger attack and release */
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time, velocity?: NormalRange): this;
  
  /** Connect to destination */
  toDestination(): this;
  
  /** Set note (for monophonic playing) */
  setNote(note: Frequency, time?: Time): this;
}

interface SynthOptions {
  oscillator: OmniOscillatorSynthOptions;
  envelope: Omit<EnvelopeOptions, "context">;
  detune: Cents;
  portamento: Time;
}
```

**Usage Examples:**

```typescript
import { Synth, start } from "tone";

const synth = new Synth({
  oscillator: {
    type: "sine"
  },
  envelope: {
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8
  }
}).toDestination();

// Play single note
await start();
synth.triggerAttackRelease("C4", "8n");

// Play sequence
const notes = ["C4", "E4", "G4", "C5"];
notes.forEach((note, i) => {
  synth.triggerAttackRelease(note, "8n", i * 0.5);
});
```

### Monophonic Synthesizers

Advanced monophonic synthesizers with different synthesis methods.

```typescript { .api }
/**
 * Monophonic synthesizer with filter
 */
class MonoSynth {
  constructor(options?: Partial<MonoSynthOptions>);
  
  readonly oscillator: OmniOscillator;
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  readonly filter: Filter;
  readonly envelope: AmplitudeEnvelope;
  readonly filterEnvelope: FrequencyEnvelope;
  
  triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Amplitude modulation synthesizer
 */
class AMSynth {
  constructor(options?: Partial<AMSynthOptions>);
  
  readonly oscillator: AMOscillator;
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  readonly envelope: AmplitudeEnvelope;
  
  triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Frequency modulation synthesizer
 */
class FMSynth {
  constructor(options?: Partial<FMSynthOptions>);
  
  readonly oscillator: FMOscillator;
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  readonly envelope: AmplitudeEnvelope;
  
  triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Two-oscillator synthesizer
 */
class DuoSynth {
  constructor(options?: Partial<DuoSynthOptions>);
  
  readonly voice0: MonoSynth;
  readonly voice1: MonoSynth;
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  readonly vibratoAmount: Signal<"normalRange">;
  readonly vibratoRate: Signal<"frequency">;
  
  triggerAttack(note: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time, velocity?: NormalRange): this;
}
```

### Percussion Synthesizers

Specialized synthesizers for percussion sounds.

```typescript { .api }
/**
 * Kick drum synthesizer
 */
class MembraneSynth {
  constructor(options?: Partial<MembraneSynthOptions>);
  
  readonly oscillator: OmniOscillator;
  readonly envelope: AmplitudeEnvelope;
  readonly octaves: number;
  readonly pitchDecay: Time;
  
  triggerAttack(note?: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note?: Frequency, duration?: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Metallic percussion synthesizer
 */
class MetalSynth {
  constructor(options?: Partial<MetalSynthOptions>);
  
  readonly frequency: Signal<"frequency">;
  readonly envelope: AmplitudeEnvelope;
  readonly harmonicity: Signal<"positive">;
  readonly modulationIndex: Signal<"positive">;
  readonly resonance: Signal<"frequency">;
  readonly octaves: Signal<"number">;
  
  triggerAttack(note?: Frequency, time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(note?: Frequency, duration?: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Noise-based synthesizer
 */
class NoiseSynth {
  constructor(options?: Partial<NoiseSynthOptions>);
  
  readonly noise: Noise;
  readonly envelope: AmplitudeEnvelope;
  
  triggerAttack(time?: Time, velocity?: NormalRange): this;
  triggerRelease(time?: Time): this;
  triggerAttackRelease(duration: Time, time?: Time, velocity?: NormalRange): this;
}

/**
 * Plucked string synthesizer
 */
class PluckSynth {
  constructor(options?: Partial<PluckSynthOptions>);
  
  readonly attackNoise: number;
  readonly dampening: Signal<"frequency">;
  readonly resonance: Signal<"normalRange">;
  
  triggerAttack(note: Frequency, time?: Time): this;
  triggerAttackRelease(note: Frequency, duration?: Time, time?: Time): this;
}
```

### Polyphonic Synthesizer

Wrapper for creating polyphonic versions of monophonic synthesizers.

```typescript { .api }
/**
 * Polyphonic synthesizer that manages voice allocation
 */
class PolySynth<T = Synth> {
  constructor(voice?: new () => T, options?: Partial<PolySynthOptions<T>>);
  
  /** Maximum number of voices */
  maxPolyphony: number;
  
  /** Voice allocation mode */
  options: PolySynthOptions<T>;
  
  /** Trigger attack for single note or chord */
  triggerAttack(notes: Frequency | Frequency[], time?: Time, velocity?: NormalRange | NormalRange[]): this;
  
  /** Trigger release for single note or chord */
  triggerRelease(notes: Frequency | Frequency[], time?: Time): this;
  
  /** Trigger attack and release for single note or chord */
  triggerAttackRelease(
    notes: Frequency | Frequency[], 
    duration: Time | Time[], 
    time?: Time, 
    velocity?: NormalRange | NormalRange[]
  ): this;
  
  /** Set options for all voices */
  set(options: RecursivePartial<T["options"]>): this;
  
  /** Get a voice by note */
  get(note: Frequency): T | undefined;
  
  /** Release all voices */
  releaseAll(time?: Time): this;
  
  /** Connect to destination */
  toDestination(): this;
}

interface PolySynthOptions<T> {
  maxPolyphony: number;
  voice: new () => T;
  context: Context;
}
```

**Usage Examples:**

```typescript
import { PolySynth, Synth, start } from "tone";

// Basic polyphonic synth
const polySynth = new PolySynth(Synth).toDestination();

await start();

// Play chord
polySynth.triggerAttackRelease(["C4", "E4", "G4"], "4n");

// Play with different durations
polySynth.triggerAttackRelease(
  ["C4", "E4", "G4", "B4"], 
  ["8n", "4n", "2n", "1n"]
);

// Advanced synth with custom options
const fmPoly = new PolySynth(FMSynth, {
  maxPolyphony: 8
}).toDestination();

fmPoly.set({
  envelope: {
    attack: 0.1,
    release: 2
  }
});
```

### Sample-based Instrument

Multi-sample instrument with automatic pitch shifting.

```typescript { .api }
/**
 * Polyphonic sampler instrument
 */
class Sampler {
  constructor(urls?: {[note: string]: string} | ToneAudioBuffer, options?: Partial<SamplerOptions>);
  
  /** Base URL for loading samples */
  baseUrl: string;
  
  /** Attack time */
  attack: Time;
  
  /** Release time */
  release: Time;
  
  /** Curve type for attack/release */
  curve: "linear" | "exponential";
  
  /** Add sample */
  add(note: string, url: string | ToneAudioBuffer, callback?: () => void): this;
  
  /** Check if sample exists */
  has(note: string): boolean;
  
  /** Trigger attack */
  triggerAttack(notes: Frequency | Frequency[], time?: Time, velocity?: NormalRange | NormalRange[]): this;
  
  /** Trigger release */
  triggerRelease(notes: Frequency | Frequency[], time?: Time): this;
  
  /** Trigger attack and release */
  triggerAttackRelease(
    notes: Frequency | Frequency[], 
    duration: Time | Time[], 
    time?: Time, 
    velocity?: NormalRange | NormalRange[]
  ): this;
  
  /** Release all notes */
  releaseAll(time?: Time): this;
  
  /** Connect to destination */
  toDestination(): this;
}

interface SamplerOptions {
  attack: Time;
  release: Time;
  onload: () => void;
  onerror: (error: Error) => void;
  baseUrl: string;
  curve: "linear" | "exponential";
  urls: {[note: string]: string};
}
```

**Usage Examples:**

```typescript
import { Sampler, start } from "tone";

const sampler = new Sampler({
  urls: {
    "C4": "C4.mp3",
    "D#4": "Ds4.mp3", 
    "F#4": "Fs4.mp3",
    "A4": "A4.mp3"
  },
  release: 1,
  baseUrl: "https://example.com/samples/"
}).toDestination();

// Wait for samples to load
await start();
await Tone.loaded();

// Play notes (automatic pitch shifting for missing samples)
sampler.triggerAttackRelease(["Eb4", "G4", "Bb4"], 4);

// Play with custom timing
sampler.triggerAttack("C4", 0);
sampler.triggerRelease("C4", "+2");
```

## Types

```typescript { .api }
interface EnvelopeOptions {
  attack: Time;
  decay: Time;
  sustain: NormalRange;
  release: Time;
  attackCurve: EnvelopeCurve;
  releaseCurve: EnvelopeCurve;
  decayCurve: EnvelopeCurve;
}

interface MonophonicOptions {
  detune: Cents;
  portamento: Time;
  onsilence: (voice: Monophonic<any>) => void;
}

interface OmniOscillatorSynthOptions {
  type: OmniOscillatorType;
  frequency: Frequency;
  detune: Cents;
  phase: Degrees;
  volume: Decibels;
}

type EnvelopeCurve = "linear" | "exponential" | number[] | string;
type OmniOscillatorType = "sine" | "square" | "sawtooth" | "triangle" | "fatsine" | "fatsquare" | "fatsawtooth" | "fattriangle" | string;

interface MonoSynthOptions extends MonophonicOptions {
  oscillator: OmniOscillatorSynthOptions;
  filter: Omit<FilterOptions, "context">;
  envelope: Omit<EnvelopeOptions, "context">;
  filterEnvelope: Omit<FrequencyEnvelopeOptions, "context">;
}

interface AMSynthOptions extends MonophonicOptions {
  oscillator: AMOscillatorOptions;
  envelope: Omit<EnvelopeOptions, "context">;
}

interface FMSynthOptions extends MonophonicOptions {
  oscillator: FMOscillatorOptions;
  envelope: Omit<EnvelopeOptions, "context">;
}

interface DuoSynthOptions extends MonophonicOptions {
  voice0: MonoSynthOptions;
  voice1: MonoSynthOptions;
  harmonicity: Positive;
  vibratoAmount: NormalRange;
  vibratoRate: Frequency;
}
```