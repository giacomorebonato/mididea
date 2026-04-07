# Core Audio System

The core audio system provides global audio context management, time utilities, and fundamental audio types that form the foundation for all Tone.js applications.

## Capabilities

### Audio Context Management

Control the global audio context and initialization.

```typescript { .api }
/**
 * Start the audio context. Required before any audio can be played.
 * Must be called from a user interaction event handler.
 * @returns Promise that resolves when audio is ready
 */
function start(): Promise<void>;

/**
 * Get the current audio context time in seconds
 * @returns Current audio context time
 */
function now(): number;

/**
 * Get the current audio context time without lookAhead offset
 * @returns Immediate audio context time
 */
function immediate(): number;

/**
 * Get the global Tone.js context
 * @returns The global context instance
 */
function getContext(): Context;

/**
 * Set a custom audio context as the global context
 * @param context - Custom AudioContext to use
 */
function setContext(context: BaseAudioContext): void;

/**
 * Check if Web Audio API is supported in the current browser
 */
const supported: boolean;
```

**Usage Examples:**

```typescript
import { start, now, getContext } from "tone";

// Start audio from user interaction
document.addEventListener("click", async () => {
  await start();
  console.log("Audio context started");
  
  // Get current time for scheduling
  const currentTime = now();
  console.log("Current time:", currentTime);
});

// Check support
if (!supported) {
  console.warn("Web Audio API not supported");
}
```

### Global Singletons

Access global audio system components.

```typescript { .api }
/**
 * Get the global Transport instance for timing and scheduling
 * @returns Global transport instance
 */
function getTransport(): TransportInstance;

/**
 * Get the global Destination (output) instance
 * @returns Global destination instance
 */
function getDestination(): DestinationInstance;

/**
 * Get the global Listener instance for 3D audio positioning
 * @returns Global listener instance
 */
function getListener(): ListenerInstance;

/**
 * Get the global Draw instance for animation synchronization
 * @returns Global draw instance
 */
function getDraw(): DrawInstance;
```

### Audio Buffer Management

Utilities for loading and managing audio buffers.

```typescript { .api }
/**
 * Promise that resolves when all ToneAudioBuffers have finished loading
 * @returns Promise that resolves when all audio is loaded
 */
function loaded(): Promise<void>;

/**
 * Audio buffer wrapper with additional functionality
 */
class ToneAudioBuffer {
  constructor(url?: string | AudioBuffer, onload?: () => void, onerror?: (error: Error) => void);
  
  /** The underlying AudioBuffer */
  buffer: AudioBuffer | null;
  
  /** Duration of the buffer in seconds */
  duration: number;
  
  /** Sample rate of the buffer */
  sampleRate: number;
  
  /** Number of channels in the buffer */
  numberOfChannels: number;
  
  /** Load audio from URL */
  load(url: string): Promise<ToneAudioBuffer>;
  
  /** Get channel data as Float32Array */
  getChannelData(channel: number): Float32Array;
  
  /** Convert buffer to array */
  toArray(): number[] | number[][];
  
  /** Reverse the buffer */
  reverse(): ToneAudioBuffer;
  
  /** Slice the buffer */
  slice(start: number, end?: number): ToneAudioBuffer;
  
  /** Static method to check if all buffers are loaded */
  static loaded(): Promise<void>;
}

/**
 * Collection of named audio buffers
 */
class ToneAudioBuffers {
  constructor(urls: {[name: string]: string} | ToneAudioBuffer[], baseUrl?: string, onload?: () => void);
  
  /** Get buffer by name */
  get(name: string): ToneAudioBuffer;
  
  /** Check if buffer exists */
  has(name: string): boolean;
  
  /** Add buffer */
  add(name: string, url: string | ToneAudioBuffer, callback?: () => void): ToneAudioBuffers;
}

/**
 * Deprecated aliases for backward compatibility
 */

/** @deprecated Use ToneAudioBuffer instead */
const Buffer: typeof ToneAudioBuffer;

/** @deprecated Use ToneAudioBuffers instead */
const Buffers: typeof ToneAudioBuffers;

/** @deprecated Use ToneBufferSource instead */
const BufferSource: typeof ToneBufferSource;
```

### Time and Frequency Types

Advanced time and frequency value classes with unit conversions.

```typescript { .api }
/**
 * Time value with unit conversion support
 */
class Time {
  constructor(value: Time, units?: string);
  
  /** Convert to seconds */
  toSeconds(): number;
  
  /** Convert to frequency */
  toFrequency(): number;
  
  /** Convert to ticks */
  toTicks(): number;
  
  /** Convert to samples */
  toSamples(): number;
  
  /** Convert to musical notation */
  toNotation(): string;
  
  /** Convert to milliseconds */
  toMilliseconds(): number;
  
  /** Add time values */
  add(value: Time): Time;
  
  /** Subtract time values */
  sub(value: Time): Time;
  
  /** Multiply time values */
  mult(value: number): Time;
  
  /** Divide time values */
  div(value: number): Time;
}

/**
 * Frequency value with unit conversion support
 */
class Frequency {
  constructor(value: Frequency, units?: string);
  
  /** Convert to hertz */
  toFrequency(): number;
  
  /** Convert to MIDI note number */
  toMidi(): number;
  
  /** Convert to note name */
  toNote(): string;
  
  /** Convert to cents */
  toCents(): number;
  
  /** Transpose by semitones */
  transpose(semitones: number): Frequency;
  
  /** Harmonize with interval */
  harmonize(intervals: number[]): Frequency[];
}

/**
 * MIDI note number representation
 */
class Midi {
  constructor(value: number);
  
  /** Convert to frequency */
  toFrequency(): number;
  
  /** Convert to note name */
  toNote(): string;
  
  /** Transpose by semitones */
  transpose(semitones: number): Midi;
}
```

### Core Audio Nodes

Fundamental audio node wrappers.

```typescript { .api }
/**
 * Base class for all Tone.js audio nodes
 */
class ToneAudioNode {
  constructor(options?: Partial<ToneAudioNodeOptions>);
  
  /** Audio context */
  context: Context;
  
  /** Number of inputs */
  numberOfInputs: number;
  
  /** Number of outputs */
  numberOfOutputs: number;
  
  /** Connect to another node */
  connect(destination: AudioNode | ToneAudioNode, outputNumber?: number, inputNumber?: number): this;
  
  /** Disconnect from other nodes */
  disconnect(destination?: AudioNode | ToneAudioNode, outputNumber?: number, inputNumber?: number): this;
  
  /** Connect to destination and return destination */
  toDestination(): this;
  
  /** Dispose of the node */
  dispose(): this;
  
  /** Get the audio node */
  get(): AudioNode;
}

/**
 * Gain node wrapper with additional functionality
 */
class Gain extends ToneAudioNode {
  constructor(gain?: number, units?: string);
  
  /** Gain parameter */
  gain: Param<"decibels" | "gain">;
}

/**
 * Delay node wrapper with additional functionality
 */
class Delay extends ToneAudioNode {
  constructor(delayTime?: Time, maxDelay?: number);
  
  /** Delay time parameter */
  delayTime: Param<"time">;
}

/**
 * Audio parameter with automation and unit conversion
 */
class Param<T extends UnitName = "number"> {
  constructor(param: AudioParam, units?: T, convert?: boolean);
  
  /** Current value */
  value: UnitMap[T];
  
  /** Set value at specific time */
  setValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Linear ramp to value */
  linearRampToValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Exponential ramp to value */
  exponentialRampToValueAtTime(value: UnitMap[T], time: Time): this;
  
  /** Ramp to value over duration */
  rampTo(value: UnitMap[T], time: Time, startTime?: Time): this;
  
  /** Target value with time constant */
  targetRampTo(value: UnitMap[T], time: Time, startTime?: Time): this;
  
  /** Cancel scheduled changes */
  cancelScheduledValues(time: Time): this;
  
  /** Convert to units */
  convert: boolean;
  
  /** Parameter units */
  units: T;
}
```

### Utility Classes and Functions

Core utilities for audio development.

```typescript { .api }
/**
 * Conversion functions
 */

/** Convert decibels to gain */
function dbToGain(db: number): number;

/** Convert gain to decibels */
function gainToDb(gain: number): number;

/** Convert frequency to MIDI note number */
function ftom(frequency: number): number;

/** Convert MIDI note number to frequency */
function mtof(midi: number): number;

/** Convert interval in semitones to frequency ratio */
function intervalToFrequencyRatio(interval: number): number;

/**
 * Argument handling utilities
 */

/** Provide default values for undefined arguments */
function defaultArg<T>(value: T | undefined, defaultValue: T): T;

/** Parse constructor arguments into options object */
function optionsFromArguments<T>(defaults: T, args: IArguments): T;

/**
 * Timeline classes for event scheduling
 */
class Timeline<T> {
  constructor();
  
  /** Add event to timeline */
  add(event: TimelineEvent<T>): Timeline<T>;
  
  /** Remove event from timeline */
  remove(event: TimelineEvent<T>): Timeline<T>;
  
  /** Get events at specific time */
  get(time: number): T[];
  
  /** Cancel events after time */
  cancel(time: number): Timeline<T>;
  
  /** Clear all events */
  clear(): Timeline<T>;
}

class IntervalTimeline extends Timeline<any> {
  /** Add interval event */
  add(event: IntervalTimelineEvent): IntervalTimeline;
  
  /** Get events at time */
  get(time: number): IntervalTimelineEvent[];
}

class StateTimeline<T> extends Timeline<T> {
  /** Get state at time */
  getValueAtTime(time: number): T | null;
  
  /** Set state at time */
  setStateAtTime(state: T, time: number): StateTimeline<T>;
}
```

## Types

```typescript { .api }
interface Context extends BaseAudioContext {
  now(): number;
  immediate(): number;
  lookAhead: number;
  updateInterval: number;
  transport: TransportInstance;
  destination: DestinationInstance;
  listener: ListenerInstance;
  draw: DrawInstance;
}

interface ToneAudioNodeOptions {
  context?: Context;
}

interface TimelineEvent<T> {
  time: number;
  value: T;
}

interface IntervalTimelineEvent extends TimelineEvent<any> {
  duration: number;
}

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
```