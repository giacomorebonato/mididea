# Tone.js

Tone.js is a Web Audio framework for creating interactive music in the browser. The architecture aims to be familiar to both musicians and audio programmers, offering high-level DAW features like global transport for synchronizing events, prebuilt synthesizers and effects, and high-performance building blocks for custom audio applications.

## Package Information

- **Package Name**: tone
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install tone`

## Core Imports

```typescript
import * as Tone from "tone";
```

For specific imports:

```typescript
import { Synth, Transport, start, now } from "tone";
```

CommonJS:

```javascript
const Tone = require("tone");
// or
const { Synth, Transport, start, now } = require("tone");
```

## Basic Usage

```typescript
import { Synth, start, now } from "tone";

// User interaction required before audio
document.addEventListener("click", async () => {
  // Start the audio context
  await start();
  
  // Create a synth and connect it to the main output
  const synth = new Synth().toDestination();
  
  // Play a middle 'C' for the duration of an 8th note
  synth.triggerAttackRelease("C4", "8n");
  
  // Schedule notes in the future
  const time = now();
  synth.triggerAttackRelease("E4", "8n", time + 0.5);
  synth.triggerAttackRelease("G4", "8n", time + 1);
});
```

## Architecture

Tone.js is built around several key architectural components:

- **Global Context**: Single audio context with utilities (Transport, Destination, Draw, Listener)
- **Modular Design**: Core, instruments, effects, sources, events, components, and signal processing modules
- **Audio-rate Control**: Sample-accurate parameter automation and signal processing
- **Time Abstraction**: Unified time system supporting musical notation ("4n", "8t") and absolute time
- **Connection Graph**: Flexible audio routing with connect/disconnect methods
- **Transport System**: Global timekeeper for synchronizing musical events and sequences

## Capabilities

### Core Audio System

Global audio context management, time utilities, and fundamental audio types. Essential for all Tone.js applications.

```typescript { .api }
function start(): Promise<void>;
function now(): number;
function immediate(): number;
function loaded(): Promise<void>;
function getContext(): Context;
function getTransport(): TransportInstance;
function getDestination(): DestinationInstance;
```

[Core Audio System](./core.md)

### Synthesizers and Instruments

Ready-to-use musical instruments including monophonic and polyphonic synthesizers with various synthesis techniques.

```typescript { .api }
class Synth {
  constructor(options?: Partial<SynthOptions>);
  triggerAttackRelease(note: Frequency, duration: Time, time?: Time): this;
  toDestination(): this;
}

class PolySynth<T = Synth> {
  constructor(voice?: new () => T, options?: Partial<PolySynthOptions<T>>);
  triggerAttackRelease(notes: Frequency[], duration: Time, time?: Time): this;
}
```

[Synthesizers and Instruments](./instruments.md)

### Audio Effects

Comprehensive collection of audio effects including reverbs, delays, modulation, and distortion effects.

```typescript { .api }
class Reverb {
  constructor(roomSize?: NormalRange);
  connect(destination: AudioNode): this;
}

class FeedbackDelay {
  constructor(delay?: Time, feedback?: NormalRange);
  toDestination(): this;
}
```

[Audio Effects](./effects.md)

### Audio Sources

Audio generation including oscillators, noise sources, and audio file players for creating sound content.

```typescript { .api }
class Oscillator {
  constructor(frequency?: Frequency, type?: OscillatorType);
  start(time?: Time): this;
  stop(time?: Time): this;
}

class Player {
  constructor(url?: string | AudioBuffer | ToneAudioBuffer);
  load(url: string): Promise<this>;
  start(time?: Time): this;
}
```

[Audio Sources](./sources.md)

### Event Scheduling and Sequencing

Musical event scheduling, loops, sequences, and patterns for creating musical arrangements.

```typescript { .api }
class Loop {
  constructor(callback: (time: number) => void, interval: Time);
  start(time?: TransportTime): this;
  stop(time?: TransportTime): this;
}

class Sequence {
  constructor(callback: (time: number, note: any) => void, events: any[], subdivision: Time);
  start(time?: TransportTime): this;
}
```

[Event Scheduling](./events.md)

### Audio Components

Lower-level building blocks including analysis tools, filters, envelopes, and channel utilities for custom audio processing.

```typescript { .api }
class Filter {
  constructor(frequency?: Frequency, type?: BiquadFilterType, rolloff?: number);
  frequency: Signal<"frequency">;
  Q: Signal<"positive">;
}

class Envelope {
  constructor(attack?: Time, decay?: Time, sustain?: NormalRange, release?: Time);
  triggerAttack(time?: Time): this;
  triggerRelease(time?: Time): this;
}
```

[Audio Components](./components.md)

### Signal Processing

Audio-rate signal processing utilities for mathematical operations, scaling, and control signal generation.

```typescript { .api }
class Signal<T extends UnitName = "number"> {
  constructor(value?: UnitMap[T], units?: T);
  value: UnitMap[T];
  rampTo(value: UnitMap[T], time: Time): this;
}

class Add {
  constructor(value: number);
  addend: Signal<"number">;
}
```

[Signal Processing](./signals.md)

## Types

### Core Types

```typescript { .api }
type Time = number | string;
type Frequency = number | string;
type NormalRange = number;
type Positive = number;
type Cents = number;
type Decibels = number;
type Degrees = number;

interface ToneOptions {
  context?: BaseAudioContext;
}

type UnitName = "number" | "frequency" | "time" | "decibels" | "normalRange" | "positive" | "cents" | "degrees";
```

### Transport Types

```typescript { .api }
interface TransportInstance {
  bpm: Signal<"bpm">;
  state: TransportState;
  start(time?: Time): this;
  stop(time?: Time): this;
  pause(time?: Time): this;
  toggle(time?: Time): this;
  scheduleOnce(callback: (time: number) => void, time: TransportTime): number;
  scheduleRepeat(callback: (time: number) => void, interval: Time, startTime?: TransportTime): number;
}

type TransportState = "started" | "stopped" | "paused";
```

### Context Types

```typescript { .api }
interface DestinationInstance {
  volume: Volume;
  mute: boolean;
  connect(destination: AudioNode): this;
}

interface Context extends BaseAudioContext {
  now(): number;
  immediate(): number;
  transport: TransportInstance;
  destination: DestinationInstance;
}
```