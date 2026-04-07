# Audio Components

Lower-level building blocks including analysis tools, filters, envelopes, and channel utilities for custom audio processing.

## Capabilities

### Analysis Components

Tools for analyzing audio signals in real-time.

```typescript { .api }
/**
 * Real-time FFT analyzer
 */
class FFT {
  constructor(size?: number);
  
  /** FFT size */
  size: number;
  
  /** Smoothing factor */
  smoothing: NormalRange;
  
  /** Get frequency domain data */
  getValue(): Float32Array;
  
  /** Get frequency value at index */
  getFrequencyValue(frequency: Frequency): number;
}

/**
 * Level meter for amplitude measurement
 */
class Meter {
  constructor(smoothing?: NormalRange);
  
  /** Smoothing factor */
  smoothing: NormalRange;
  
  /** Get current level */
  getValue(): number;
  
  /** Get level in decibels */
  getLevel(): number;
}

/**
 * Waveform analyzer for time domain visualization
 */
class Waveform {
  constructor(size?: number);
  
  /** Buffer size */
  size: number;
  
  /** Get time domain data */
  getValue(): Float32Array;
}

/**
 * Envelope follower for tracking amplitude
 */
class Follower {
  constructor(attack?: Time, release?: Time);
  
  /** Attack time */
  attack: Time;
  
  /** Release time */
  release: Time;
  
  /** Connect to audio parameter */
  connect(param: AudioParam): this;
}
```

### Filter Components

Various filter types for frequency shaping.

```typescript { .api }
/**
 * Biquad filter with multiple types
 */
class Filter {
  constructor(frequency?: Frequency, type?: BiquadFilterType, rolloff?: number);
  
  /** Cutoff frequency */
  frequency: Signal<"frequency">;
  
  /** Q factor (resonance) */
  Q: Signal<"positive">;
  
  /** Gain for peaking/shelving filters */
  gain: Signal<"decibels">;
  
  /** Filter type */
  type: BiquadFilterType;
  
  /** Filter rolloff (-12, -24, -48, -96 dB/oct) */
  rolloff: number;
  
  /** Get frequency response */
  getFrequencyResponse(length?: number): Float32Array;
}

/**
 * 3-band equalizer
 */
class EQ3 {
  constructor(lowFrequency?: Frequency, highFrequency?: Frequency);
  
  /** Low frequency gain */
  low: Signal<"decibels">;
  
  /** Mid frequency gain */
  mid: Signal<"decibels">;
  
  /** High frequency gain */
  high: Signal<"decibels">;
  
  /** Low/mid crossover frequency */
  lowFrequency: Signal<"frequency">;
  
  /** Mid/high crossover frequency */
  highFrequency: Signal<"frequency">;
  
  /** Low frequency Q */
  Q: Signal<"positive">;
}

/**
 * Convolution filter using impulse responses
 */
class Convolver {
  constructor(url?: string | AudioBuffer | ToneAudioBuffer, onload?: () => void);
  
  /** Impulse response buffer */
  buffer: ToneAudioBuffer;
  
  /** Normalize the impulse response */
  normalize: boolean;
  
  /** Load impulse response */
  load(url: string): Promise<this>;
}
```

### Envelope Components

Envelope generators for shaping audio parameters over time.

```typescript { .api }
/**
 * ADSR envelope generator
 */
class Envelope {
  constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
  
  /** Attack time */
  attack: Time;
  
  /** Decay time */
  decay: Time;
  
  /** Sustain level */
  sustain: NormalRange;
  
  /** Release time */
  release: Time;
  
  /** Attack curve */
  attackCurve: EnvelopeCurve;
  
  /** Decay curve */
  decayCurve: EnvelopeCurve;
  
  /** Release curve */
  releaseCurve: EnvelopeCurve;
  
  /** Trigger attack phase */
  triggerAttack(time?: Time, velocity?: NormalRange): this;
  
  /** Trigger release phase */
  triggerRelease(time?: Time): this;
  
  /** Trigger attack and release */
  triggerAttackRelease(duration: Time, time?: Time, velocity?: NormalRange): this;
  
  /** Cancel envelope */
  cancel(time?: Time): this;
  
  /** Connect to audio parameter */
  connect(destination: AudioParam): this;
}

/**
 * Amplitude envelope (Envelope connected to Gain)
 */
class AmplitudeEnvelope extends Envelope {
  constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
  
  /** Connect to audio node */
  connect(destination: AudioNode): this;
}

/**
 * Frequency envelope for filter modulation
 */
class FrequencyEnvelope extends Envelope {
  constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
  
  /** Base frequency */
  baseFrequency: Frequency;
  
  /** Envelope range in octaves */
  octaves: number;
  
  /** Envelope exponent */
  exponent: number;
}

type EnvelopeCurve = "linear" | "exponential" | number[] | string;
```

### Channel Components

Utilities for stereo processing and channel manipulation.

```typescript { .api }
/**
 * Stereo panner
 */
class Panner {
  constructor(pan?: NormalRange);
  
  /** Pan position (-1 to 1) */
  pan: Signal<"normalRange">;
}

/**
 * Volume control with metering
 */
class Volume {
  constructor(volume?: Decibels);
  
  /** Volume in decibels */
  volume: Signal<"decibels">;
  
  /** Mute the volume */
  mute: boolean;
}

/**
 * Audio channel with volume and pan
 */
class Channel {
  constructor(volume?: Decibels, pan?: NormalRange);
  
  /** Volume control */
  volume: Volume;
  
  /** Pan control */
  pan: Panner;
  
  /** Mute the channel */
  mute: boolean;
  
  /** Solo the channel */
  solo: boolean;
}

/**
 * Crossfader between two inputs
 */
class CrossFade {
  constructor(fade?: NormalRange);
  
  /** Fade position (0 = A, 1 = B) */
  fade: Signal<"normalRange">;
  
  /** Input A */
  a: Gain;
  
  /** Input B */
  b: Gain;
}
```

### Dynamics Components

Compression and gating for dynamics control.

```typescript { .api }
/**
 * Audio compressor
 */
class Compressor {
  constructor(threshold?: Decibels, ratio?: Positive);
  
  /** Compression threshold */
  threshold: Signal<"decibels">;
  
  /** Compression ratio */
  ratio: Signal<"positive">;
  
  /** Attack time */
  attack: Signal<"time">;
  
  /** Release time */
  release: Signal<"time">;
  
  /** Knee softness */
  knee: Signal<"decibels">;
  
  /** Get current reduction amount */
  reduction: number;
}

/**
 * Noise gate
 */
class Gate {
  constructor(threshold?: Decibels, attack?: Time, release?: Time);
  
  /** Gate threshold */
  threshold: Signal<"decibels">;
  
  /** Attack time */
  attack: Signal<"time">;
  
  /** Release time */
  release: Signal<"time">;
}

/**
 * Peak limiter
 */
class Limiter {
  constructor(threshold?: Decibels);
  
  /** Limiting threshold */
  threshold: Signal<"decibels">;
  
  /** Get current reduction */
  reduction: number;
}
```

**Usage Examples:**

```typescript
import { Oscillator, Filter, Envelope, Compressor, start } from "tone";

await start();

// Filter with envelope modulation
const osc = new Oscillator(220, "sawtooth");
const filter = new Filter(400, "lowpass");
const env = new FrequencyEnvelope(0.1, 0.2, 0.3, 1);

osc.connect(filter);
filter.toDestination();

// Connect envelope to filter frequency
env.connect(filter.frequency);

// Trigger envelope and oscillator
osc.start();
env.triggerAttackRelease("2n");

// Add compression
const comp = new Compressor(-24, 4);
filter.connect(comp);
comp.toDestination();
```

## Types

```typescript { .api }
type BiquadFilterType = "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "notch" | "allpass" | "peaking";

interface FilterOptions {
  frequency: Frequency;
  type: BiquadFilterType;
  Q: Positive;
  gain: Decibels;
  rolloff: number;
}

interface EnvelopeOptions {
  attack: Time;
  decay: Time;
  sustain: NormalRange;
  release: Time;
  attackCurve: EnvelopeCurve;
  decayCurve: EnvelopeCurve;
  releaseCurve: EnvelopeCurve;
}

interface CompressorOptions {
  threshold: Decibels;
  ratio: Positive;
  attack: Time;
  release: Time;
  knee: Decibels;
}
```