# Audio Sources

Audio generation including oscillators, noise sources, and audio file players for creating sound content and musical material.

## Capabilities

### Oscillators

Basic waveform generators for synthesis.

```typescript { .api }
/**
 * Basic oscillator with standard waveforms
 */
class Oscillator {
  constructor(frequency?: Frequency, type?: OscillatorType);
  
  /** Frequency parameter */
  frequency: Signal<"frequency">;
  
  /** Detune parameter in cents */
  detune: Signal<"cents">;
  
  /** Oscillator type */
  type: OscillatorType;
  
  /** Phase offset */
  phase: Degrees;
  
  /** Start oscillator */
  start(time?: Time): this;
  
  /** Stop oscillator */
  stop(time?: Time): this;
  
  /** Connect to destination */
  toDestination(): this;
}

/**
 * Unified oscillator interface supporting multiple oscillator types
 */
class OmniOscillator {
  constructor(frequency?: Frequency, type?: OmniOscillatorType);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  type: OmniOscillatorType;
  phase: Degrees;
  
  start(time?: Time): this;
  stop(time?: Time): this;
  toDestination(): this;
}

/**
 * Low Frequency Oscillator for modulation
 */
class LFO {
  constructor(frequency?: Frequency, min?: number, max?: number);
  
  /** LFO frequency */
  frequency: Signal<"frequency">;
  
  /** Minimum output value */
  min: number;
  
  /** Maximum output value */
  max: number;
  
  /** LFO waveform type */
  type: "sine" | "square" | "triangle" | "sawtooth";
  
  /** Phase offset */
  phase: Degrees;
  
  /** Amplitude of LFO */
  amplitude: Signal<"normalRange">;
  
  start(time?: Time): this;
  stop(time?: Time): this;
  connect(destination: AudioParam | AudioNode): this;
}
```

### Advanced Oscillators

Complex oscillators with modulation capabilities.

```typescript { .api }
/**
 * Amplitude modulated oscillator
 */
class AMOscillator {
  constructor(frequency?: Frequency, type?: OscillatorType, modulationType?: OscillatorType);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  
  /** Modulation frequency */
  modulationFrequency: Signal<"frequency">;
  
  /** Harmonicity ratio */
  harmonicity: Signal<"positive">;
  
  type: OscillatorType;
  modulationType: OscillatorType;
  
  start(time?: Time): this;
  stop(time?: Time): this;
}

/**
 * Frequency modulated oscillator
 */
class FMOscillator {
  constructor(frequency?: Frequency, type?: OscillatorType, modulationType?: OscillatorType);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  
  /** Modulation index */
  modulationIndex: Signal<"positive">;
  
  /** Harmonicity ratio */
  harmonicity: Signal<"positive">;
  
  type: OscillatorType;
  modulationType: OscillatorType;
  
  start(time?: Time): this;
  stop(time?: Time): this;
}

/**
 * Multiple detuned oscillators for thick sound
 */
class FatOscillator {
  constructor(frequency?: Frequency, type?: OscillatorType, spread?: Cents);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  
  /** Number of oscillators */
  count: number;
  
  /** Detune spread between oscillators */
  spread: Cents;
  
  type: OscillatorType;
  
  start(time?: Time): this;
  stop(time?: Time): this;
}

/**
 * Pulse width oscillator
 */
class PulseOscillator {
  constructor(frequency?: Frequency, width?: NormalRange);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  
  /** Pulse width */
  width: Signal<"normalRange">;
  
  start(time?: Time): this;
  stop(time?: Time): this;
}

/**
 * Pulse width modulated oscillator
 */
class PWMOscillator {
  constructor(frequency?: Frequency, modulationFrequency?: Frequency);
  
  readonly frequency: Signal<"frequency">;
  readonly detune: Signal<"cents">;
  
  /** Modulation frequency */
  modulationFrequency: Signal<"frequency">;
  
  start(time?: Time): this;
  stop(time?: Time): this;
}
```

### Audio File Players

Sources for playing back recorded audio.

```typescript { .api }
/**
 * Audio file player
 */
class Player {
  constructor(url?: string | AudioBuffer | ToneAudioBuffer, onload?: () => void);
  
  /** Playback rate */
  playbackRate: Signal<"positive">;
  
  /** Loop the audio */
  loop: boolean;
  
  /** Loop start time */
  loopStart: Time;
  
  /** Loop end time */
  loopEnd: Time;
  
  /** Reverse playback */
  reverse: boolean;
  
  /** Auto-start playback when loaded */
  autostart: boolean;
  
  /** Fade in time */
  fadeIn: Time;
  
  /** Fade out time */
  fadeOut: Time;
  
  /** Current loaded state */
  loaded: boolean;
  
  /** Buffer duration */
  buffer: ToneAudioBuffer;
  
  /** Load audio file */
  load(url: string): Promise<this>;
  
  /** Start playback */
  start(time?: Time, offset?: Time, duration?: Time): this;
  
  /** Stop playback */
  stop(time?: Time): this;
  
  /** Seek to position */
  seek(offset: Time, time?: Time): this;
  
  /** Connect to destination */
  toDestination(): this;
}

/**
 * Collection of audio players organized by name
 */
class Players {
  constructor(
    urls: {[name: string]: string} | ToneAudioBuffer[], 
    onload?: () => void, 
    baseUrl?: string
  );
  
  /** Volume control */
  volume: Volume;
  
  /** Mute all players */
  mute: boolean;
  
  /** Base URL for loading */
  baseUrl: string;
  
  /** Get player by name */
  player(name: string): Player;
  
  /** Check if player exists */
  has(name: string): boolean;
  
  /** Get player (alias for player()) */
  get(name: string): Player;
  
  /** Start all players */
  startAll(time?: Time): this;
  
  /** Stop all players */
  stopAll(time?: Time): this;
  
  /** Connect to destination */
  toDestination(): this;
}

/**
 * Granular synthesis player
 */
class GrainPlayer {
  constructor(url?: string | ToneAudioBuffer, onload?: () => void);
  
  /** Playback rate */
  playbackRate: Signal<"positive">;
  
  /** Grain size */
  grainSize: Signal<"time">;
  
  /** Overlap between grains */
  overlap: Signal<"time">;
  
  /** Loop the buffer */
  loop: boolean;
  
  /** Loaded buffer */
  buffer: ToneAudioBuffer;
  
  /** Load audio file */
  load(url: string): Promise<this>;
  
  start(time?: Time, offset?: Time, duration?: Time): this;
  stop(time?: Time): this;
  toDestination(): this;
}

/**
 * Low-level buffer source wrapper
 */
class ToneBufferSource {
  constructor(buffer?: ToneAudioBuffer | AudioBuffer, onended?: () => void);
  
  /** Playback rate */
  playbackRate: Signal<"positive">;
  
  /** Loop the buffer */
  loop: boolean;
  
  /** Loop start */
  loopStart: number;
  
  /** Loop end */
  loopEnd: number;
  
  /** Curve for attack/release */
  curve: "linear" | "exponential";
  
  /** Fade in time */
  fadeIn: Time;
  
  /** Fade out time */
  fadeOut: Time;
  
  start(time?: Time, offset?: Time, duration?: Time, gain?: NormalRange): this;
  stop(time?: Time): this;
}
```

### Noise Sources

Generators for various types of noise.

```typescript { .api }
/**
 * Noise generator
 */
class Noise {
  constructor(type?: NoiseType);
  
  /** Noise type */
  type: NoiseType;
  
  /** Playback state */
  state: "started" | "stopped";
  
  start(time?: Time): this;
  stop(time?: Time): this;
  restart(time?: Time): this;
  toDestination(): this;
}

type NoiseType = "white" | "brown" | "pink";
```

### Input Sources

Sources for capturing external audio.

```typescript { .api }
/**
 * Microphone and media device input
 */
class UserMedia {
  constructor(volume?: Decibels);
  
  /** Volume control */
  volume: Volume;
  
  /** Mute the input */
  mute: boolean;
  
  /** Device constraints */
  constraints: MediaStreamConstraints;
  
  /** Open media device */
  open(deviceId?: string): Promise<this>;
  
  /** Close media device */
  close(): this;
  
  /** Get available devices */
  static enumerateDevices(): Promise<MediaDeviceInfo[]>;
  
  /** Check for user media support */
  static supported: boolean;
  
  toDestination(): this;
}
```

**Usage Examples:**

```typescript
import { Oscillator, Player, LFO, Noise, start } from "tone";

await start();

// Basic oscillator
const osc = new Oscillator(440, "sawtooth").toDestination();
osc.start();
osc.stop("+2");

// LFO modulation
const lfo = new LFO(2, 200, 800);
lfo.connect(osc.frequency);
lfo.start();

// Audio player
const player = new Player("path/to/audio.mp3", () => {
  console.log("Loaded");
}).toDestination();

player.autostart = true;
player.loop = true;

// Multiple players
const players = new Players({
  kick: "kick.mp3",
  snare: "snare.mp3",
  hihat: "hihat.mp3"
}).toDestination();

players.player("kick").start();
players.player("snare").start("+0.5");

// Noise source
const noise = new Noise("pink").toDestination();
noise.start();
noise.stop("+1");
```

## Types

```typescript { .api }
type OscillatorType = "sine" | "square" | "triangle" | "sawtooth";
type OmniOscillatorType = OscillatorType | "fatsine" | "fatsquare" | "fatsawtooth" | "fattriangle" | string;

interface PlayerOptions {
  onload: () => void;
  onerror: (error: Error) => void;
  playbackRate: Positive;
  loop: boolean;
  autostart: boolean;
  loopStart: Time;
  loopEnd: Time;
  reverse: boolean;
  fadeIn: Time;
  fadeOut: Time;
}

interface OscillatorOptions {
  frequency: Frequency;
  detune: Cents;
  type: OncillatorType;
  phase: Degrees;
  volume: Decibels;
}

interface LFOOptions {
  frequency: Frequency;
  min: number;
  max: number;
  phase: Degrees;
  type: "sine" | "square" | "triangle" | "sawtooth";
  amplitude: NormalRange;
}
```