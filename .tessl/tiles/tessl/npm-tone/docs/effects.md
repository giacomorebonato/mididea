# Audio Effects

Comprehensive collection of audio effects including reverbs, delays, modulation, and distortion effects for processing audio signals.

## Capabilities

### Reverb Effects

Spatial reverb effects for creating sense of space and ambience.

```typescript { .api }
/**
 * Convolution reverb using impulse responses
 */
class Reverb {
  constructor(roomSize?: NormalRange);
  
  /** Room size parameter */
  roomSize: NormalRange;
  
  /** Presets for different room types */
  presets: {[name: string]: string};
  
  /** Generate impulse response */
  generate(): Promise<this>;
  
  /** Connect to destination */
  connect(destination: AudioNode): this;
}

/**
 * Freeverb algorithm reverb
 */
class Freeverb {
  constructor(roomSize?: NormalRange, dampening?: NormalRange);
  
  /** Room size parameter */
  roomSize: Signal<"normalRange">;
  
  /** Dampening parameter */
  dampening: Signal<"frequency">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}

/**
 * John Chowning reverb algorithm
 */
class JCReverb {
  constructor(roomSize?: NormalRange);
  
  /** Room size parameter */
  roomSize: Signal<"normalRange">;
}
```

### Delay Effects

Time-based delay effects for echoes and rhythmic patterns.

```typescript { .api }
/**
 * Delay with feedback control
 */
class FeedbackDelay {
  constructor(delayTime?: Time, feedback?: NormalRange);
  
  /** Delay time */
  delayTime: Signal<"time">;
  
  /** Feedback amount */
  feedback: Signal<"normalRange">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
  
  /** Connect to destination */
  toDestination(): this;
}

/**
 * Stereo ping-pong delay
 */
class PingPongDelay {
  constructor(delayTime?: Time, feedback?: NormalRange);
  
  /** Delay time */
  delayTime: Signal<"time">;
  
  /** Feedback amount */
  feedback: Signal<"normalRange">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}
```

### Modulation Effects

Effects that modulate audio parameters over time.

```typescript { .api }
/**
 * Chorus effect with multiple delayed voices
 */
class Chorus {
  constructor(frequency?: Frequency, delayTime?: number, depth?: NormalRange);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Delay time */
  delayTime: number;
  
  /** Modulation depth */
  depth: NormalRange;
  
  /** LFO type */
  type: ToneOscillatorType;
  
  /** Spread between voices */
  spread: Degrees;
  
  /** Start the LFO */
  start(time?: Time): this;
  
  /** Stop the LFO */
  stop(time?: Time): this;
}

/**
 * Phaser effect
 */
class Phaser {
  constructor(frequency?: Frequency, octaves?: number, baseFrequency?: Frequency);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Number of octaves */
  octaves: number;
  
  /** Base frequency for filtering */
  baseFrequency: Frequency;
  
  /** Feedback amount */
  Q: Signal<"positive">;
}

/**
 * Tremolo (amplitude modulation)
 */
class Tremolo {
  constructor(frequency?: Frequency, depth?: NormalRange);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Modulation depth */
  depth: Signal<"normalRange">;
  
  /** LFO type */
  type: ToneOscillatorType;
  
  /** Spread for stereo tremolo */
  spread: Degrees;
  
  /** Start the LFO */
  start(time?: Time): this;
  
  /** Stop the LFO */
  stop(time?: Time): this;
}

/**
 * Vibrato (frequency modulation)
 */
class Vibrato {
  constructor(frequency?: Frequency, depth?: NormalRange);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Modulation depth */
  depth: Signal<"normalRange">;
  
  /** LFO type */
  type: "sine" | "square" | "triangle" | "sawtooth";
}

/**
 * Auto-filter (filter sweep)
 */
class AutoFilter {
  constructor(frequency?: Frequency, baseFrequency?: Frequency, octaves?: number);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Modulation depth */
  depth: Signal<"normalRange">;
  
  /** Base frequency */
  baseFrequency: Frequency;
  
  /** Number of octaves to sweep */
  octaves: number;
  
  /** LFO type */
  type: ToneOscillatorType;
  
  /** Start the LFO */
  start(time?: Time): this;
  
  /** Stop the LFO */
  stop(time?: Time): this;
  
  /** Filter instance for additional configuration */
  readonly filter: Filter;
}

/**
 * Auto-panner
 */
class AutoPanner {
  constructor(frequency?: Frequency);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Modulation depth */
  depth: Signal<"normalRange">;
  
  /** LFO type */
  type: ToneOscillatorType;
  
  /** Start the LFO */
  start(time?: Time): this;
  
  /** Stop the LFO */
  stop(time?: Time): this;
}

/**
 * Auto-wah effect
 */
class AutoWah {
  constructor(baseFrequency?: Frequency, octaves?: number, sensitivity?: Decibels);
  
  /** Base frequency */
  baseFrequency: Frequency;
  
  /** Number of octaves */
  octaves: number;
  
  /** Input sensitivity */
  sensitivity: Decibels;
  
  /** Filter Q */
  Q: Signal<"positive">;
  
  /** Follower gain */
  gain: Signal<"decibels">;
}
```

### Distortion Effects

Effects that add harmonic content and saturation.

```typescript { .api }
/**
 * Waveshaping distortion
 */
class Distortion {
  constructor(distortion?: NormalRange);
  
  /** Distortion amount */
  distortion: NormalRange;
  
  /** Oversampling factor */
  oversample: "none" | "2x" | "4x";
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}

/**
 * Bit crusher for digital distortion
 */
class BitCrusher {
  constructor(bits?: number);
  
  /** Bit depth */
  bits: Signal<"positive">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}

/**
 * Chebyshev waveshaping
 */
class Chebyshev {
  constructor(order?: number);
  
  /** Polynomial order */
  order: number;
  
  /** Oversampling factor */
  oversample: "none" | "2x" | "4x";
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}
```

### Pitch Effects

Effects that manipulate pitch and frequency content.

```typescript { .api }
/**
 * Real-time pitch shifting
 */
class PitchShift {
  constructor(shift?: number);
  
  /** Pitch shift in semitones */
  pitch: Signal<"cents">;
  
  /** Window size for granular processing */
  windowSize: number;
  
  /** Delay time */
  delayTime: Time;
  
  /** Feedback amount */
  feedback: Signal<"normalRange">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}

/**
 * Frequency domain shifting
 */
class FrequencyShifter {
  constructor(frequency?: Frequency);
  
  /** Frequency shift amount */
  frequency: Signal<"frequency">;
  
  /** Wet/dry mix */
  wet: Signal<"normalRange">;
}
```

### Stereo Effects

Effects that manipulate stereo field and imaging.

```typescript { .api }
/**
 * Stereo width adjustment
 */
class StereoWidener {
  constructor(width?: NormalRange);
  
  /** Stereo width (0 = mono, 1 = normal, >1 = wider) */
  width: Signal<"normalRange">;
}
```

**Usage Examples:**

```typescript
import { Synth, Reverb, FeedbackDelay, Chorus, start } from "tone";

await start();

// Create synth with effects chain
const synth = new Synth();
const chorus = new Chorus(4, 2.5, 0.5);
const delay = new FeedbackDelay("8n", 0.3);
const reverb = new Reverb(0.4);

// Connect in series
synth.chain(chorus, delay, reverb, Tone.getDestination());

// Play with effects
synth.triggerAttackRelease("C4", "4n");

// Animate effect parameters
reverb.roomSize = 0.8;
delay.feedback.rampTo(0.6, 2);
chorus.frequency.rampTo(8, 4);
```

## Types

```typescript { .api }
type BiquadFilterType = "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "notch" | "allpass" | "peaking";

type ToneOscillatorType = "sine" | "square" | "triangle" | "sawtooth" | "sine2" | "sine3" | "sine4" | "sine5" | "sine6" | "sine7" | "sine8" | "triangle2" | "triangle3" | "triangle4" | "triangle5" | "triangle6" | "triangle7" | "triangle8" | "square2" | "square3" | "square4" | "square5" | "square6" | "square7" | "square8" | "sawtooth2" | "sawtooth3" | "sawtooth4" | "sawtooth5" | "sawtooth6" | "sawtooth7" | "sawtooth8" | string;

interface FeedbackDelayOptions {
  delayTime: Time;
  feedback: NormalRange;
  wet: NormalRange;
  maxDelay: number;
}

interface ReverbOptions {
  roomSize: NormalRange;
  dampening: NormalRange;
}

interface ChorusOptions {
  frequency: Frequency;
  delayTime: number;
  depth: NormalRange;
  type: "sine" | "square" | "triangle" | "sawtooth";
  spread: Degrees;
}

interface DistortionOptions {
  distortion: NormalRange;
  oversample: "none" | "2x" | "4x";
  wet: NormalRange;
}
```