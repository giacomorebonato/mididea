# Signal Processing

Audio-rate signal processing utilities for mathematical operations, scaling, and control signal generation.

## Capabilities

### Core Signal Classes

Fundamental signal processing building blocks.

```typescript { .api }
/**
 * Audio-rate signal with unit conversion and automation
 */
class Signal<T extends UnitName = "number"> {
  constructor(value?: UnitMap[T], units?: T);
  
  /** Current signal value */
  value: UnitMap[T];
  
  /** Signal units */
  units: T;
  
  /** Whether to convert units */
  convert: boolean;
  
  /** Set value at specific time */
  setValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Linear ramp to value */
  linearRampToValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Exponential ramp to value */
  exponentialRampToValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Ramp to value over duration */
  rampTo(value: UnitMap[T], time: Time, startTime?: Time): this;
  
  /** Target ramp with time constant */
  targetRampTo(value: UnitMap[T], time: Time, startTime?: Time): this;
  
  /** Cancel scheduled changes */
  cancelScheduledValues(time: Time): this;
  
  /** Connect to audio parameter or node */
  connect(destination: AudioParam | AudioNode): this;
  
  /** Disconnect from destinations */
  disconnect(): this;
}

/**
 * Signal synchronized to transport
 */
class SyncedSignal extends Signal {
  constructor(value?: number, units?: UnitName);
  
  /** Sync to transport time */
  sync(): this;
  
  /** Unsync from transport */
  unsync(): this;
}
```

### Mathematical Operations

Signals for performing mathematical operations on audio signals.

```typescript { .api }
/**
 * Add two signals or add constant to signal
 */
class Add {
  constructor(value?: number);
  
  /** Value to add */
  addend: Signal<"number">;
  
  /** Connect inputs */
  connect(destination: AudioNode): this;
}

/**
 * Subtract two signals or subtract constant from signal
 */
class Subtract {
  constructor(value?: number);
  
  /** Value to subtract */
  subtrahend: Signal<"number">;
}

/**
 * Multiply two signals or multiply signal by constant
 */
class Multiply {
  constructor(value?: number);
  
  /** Value to multiply by */
  factor: Signal<"number">;
}

/**
 * Absolute value of signal
 */
class Abs {
  constructor();
  
  /** Connect input signal */
  connect(destination: AudioNode): this;
}

/**
 * Negate signal (multiply by -1)
 */
class Negate {
  constructor();
}

/**
 * Raise signal to power
 */
class Pow {
  constructor(exp?: number);
  
  /** Exponent value */
  value: number;
}
```

### Scaling and Mapping

Utilities for scaling and mapping signal ranges.

```typescript { .api }
/**
 * Linear scaling of signal range
 */
class Scale {
  constructor(min?: number, max?: number);
  
  /** Minimum output value */
  min: number;
  
  /** Maximum output value */
  max: number;
}

/**
 * Exponential scaling of signal range
 */
class ScaleExp {
  constructor(min?: number, max?: number, exponent?: number);
  
  /** Minimum output value */
  min: number;
  
  /** Maximum output value */
  max: number;
  
  /** Scaling exponent */
  exponent: number;
}
```

### Comparison Operations

Signal comparison and logic operations.

```typescript { .api }
/**
 * Output 1 if input > threshold, 0 otherwise
 */
class GreaterThan {
  constructor(value?: number);
  
  /** Comparison threshold */
  value: number;
}

/**
 * Output 1 if input > 0, 0 otherwise
 */
class GreaterThanZero {
  constructor();
}
```

### Signal Conversion

Convert between audio-rate and control-rate signals.

```typescript { .api }
/**
 * Convert audio-rate signal to gain-rate (0-1 range)
 */
class AudioToGain {
  constructor();
}

/**
 * Convert gain-rate signal to audio-rate
 */
class GainToAudio {
  constructor();
}
```

### Waveshaping

Non-linear signal processing for distortion and waveshaping.

```typescript { .api }
/**
 * Waveshaping using lookup table or function
 */
class WaveShaper {
  constructor(mapping?: number[] | ((value: number) => number), length?: number);
  
  /** Waveshaping curve */
  curve: Float32Array | null;
  
  /** Oversampling factor */
  oversample: "none" | "2x" | "4x";
  
  /** Set curve from array or function */
  setMap(mapping: number[] | ((value: number) => number)): this;
}
```

### Constant Signals

Utility signals for providing constant values.

```typescript { .api }
/**
 * Zero signal constant
 */
class Zero {
  constructor();
  
  /** Connect to destination */
  connect(destination: AudioNode): this;
}
```

**Usage Examples:**

```typescript
import { Signal, Add, Scale, LFO, Oscillator, start } from "tone";

await start();

// Create control signals
const baseFreq = new Signal(220, "frequency");
const lfo = new LFO(2, -50, 50);
const add = new Add();

// Chain: base frequency + LFO modulation
baseFreq.connect(add);
lfo.connect(add.addend);

// Connect to oscillator frequency
const osc = new Oscillator().toDestination();
add.connect(osc.frequency);

// Start everything
lfo.start();
osc.start();

// Automate base frequency
baseFreq.rampTo(440, 4);

// Scale signal example
const envelope = new Envelope();
const scale = new Scale(200, 2000);

envelope.connect(scale);
scale.connect(osc.frequency);
```

## Types

```typescript { .api }
type UnitName = "number" | "frequency" | "time" | "decibels" | "normalRange" | "positive" | "cents" | "degrees" | "gain" | "bpm";

type UnitMap = {
  number: number;
  frequency: number;
  time: number;
  decibels: number;
  normalRange: number;
  positive: number;
  cents: number;
  degrees: number;
  gain: number;
  bpm: number;
};

interface SignalOptions<T extends UnitName> {
  value: UnitMap[T];
  units: T;
  convert: boolean;
}

interface ScaleOptions {
  min: number;
  max: number;
}

interface ScaleExpOptions extends ScaleOptions {
  exponent: number;
}

interface WaveShaperOptions {
  mapping: number[] | ((value: number) => number);
  length: number;
  oversample: "none" | "2x" | "4x";
}
```