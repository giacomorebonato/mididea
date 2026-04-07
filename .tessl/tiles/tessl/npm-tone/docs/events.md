# Event Scheduling and Sequencing

Musical event scheduling, loops, sequences, and patterns for creating musical arrangements and synchronized events.

## Capabilities

### Event Scheduling

Core event scheduling for timed musical events.

```typescript { .api }
/**
 * Single scheduled event
 */
class ToneEvent {
  constructor(callback: (time: number, value: any) => void, value?: any);
  
  /** Event callback function */
  callback: (time: number, value: any) => void;
  
  /** Event value */
  value: any;
  
  /** Event state */
  state: "started" | "stopped";
  
  /** Start the event */
  start(time?: TransportTime): this;
  
  /** Stop the event */
  stop(time?: TransportTime): this;
  
  /** Cancel the event */
  cancel(time?: TransportTime): this;
}
```

### Looping

Repeating callback loops synchronized to transport.

```typescript { .api }
/**
 * Looped callback synchronized to transport
 */
class Loop {
  constructor(callback: (time: number) => void, interval: Time);
  
  /** Loop callback function */
  callback: (time: number) => void;
  
  /** Loop interval */
  interval: Time;
  
  /** Loop state */
  state: "started" | "stopped";
  
  /** Number of iterations (-1 for infinite) */
  iterations: number;
  
  /** Playback probability */
  probability: NormalRange;
  
  /** Humanization amount */
  humanize: boolean | Time;
  
  /** Mute the loop */
  mute: boolean;
  
  /** Start the loop */
  start(time?: TransportTime): this;
  
  /** Stop the loop */
  stop(time?: TransportTime): this;
  
  /** Cancel the loop */
  cancel(time?: TransportTime): this;
}
```

### Sequences

Step sequencers for playing arrays of musical data.

```typescript { .api }
/**
 * Step sequencer for playing arrays of events
 */
class Sequence {
  constructor(callback: (time: number, note: any) => void, events: any[], subdivision: Time);
  
  /** Sequence callback */
  callback: (time: number, note: any) => void;
  
  /** Events array */
  events: any[];
  
  /** Subdivision timing */
  subdivision: Time;
  
  /** Playback probability */
  probability: NormalRange;
  
  /** Humanization */
  humanize: boolean | Time;
  
  /** Mute sequence */
  mute: boolean;
  
  /** Loop the sequence */
  loop: boolean | number;
  
  /** Loop start point */
  loopStart: number;
  
  /** Loop end point */
  loopEnd: number;
  
  start(time?: TransportTime, offset?: Time): this;
  stop(time?: TransportTime): this;
  
  /** Add event at index */
  add(index: number, value: any): this;
  
  /** Remove event at index */
  remove(index: number): this;
  
  /** Get event at index */
  at(index: number): any;
}
```

### Patterns

Algorithmic pattern generation for sequences.

```typescript { .api }
/**
 * Pattern-based sequence generator
 */
class Pattern {
  constructor(callback: (time: number, note: any) => void, values: any[], pattern: PatternType);
  
  /** Pattern callback */
  callback: (time: number, note: any) => void;
  
  /** Values to pattern through */
  values: any[];
  
  /** Pattern type */
  pattern: PatternType;
  
  /** Pattern index */
  index: number;
  
  /** Interval between events */
  interval: Time;
  
  /** Playback probability */
  probability: NormalRange;
  
  /** Humanization */
  humanize: boolean | Time;
  
  start(time?: TransportTime): this;
  stop(time?: TransportTime): this;
}

type PatternType = "up" | "down" | "upDown" | "downUp" | "alternateUp" | "alternateDown" | "random" | "randomWalk" | "randomOnce";
```

### Musical Parts

Collections of timed events for complex arrangements.

```typescript { .api }
/**
 * Collection of timed events
 */
class Part {
  constructor(callback: (time: number, value: any) => void, events?: Array<{time: Time, [key: string]: any}>);
  
  /** Part callback */
  callback: (time: number, value: any) => void;
  
  /** Events array */
  events: Array<{time: Time, [key: string]: any}>;
  
  /** Loop the part */
  loop: boolean | number;
  
  /** Loop start */
  loopStart: Time;
  
  /** Loop end */
  loopEnd: Time;
  
  /** Playback probability */
  probability: NormalRange;
  
  /** Humanization */
  humanize: boolean | Time;
  
  start(time?: TransportTime, offset?: Time): this;
  stop(time?: TransportTime): this;
  
  /** Add event */
  add(event: {time: Time, [key: string]: any} | Time, value?: any): this;
  
  /** Remove event */
  remove(event: {time: Time, [key: string]: any} | Time, value?: any): this;
  
  /** Get events at time */
  at(time: Time): Array<{time: Time, [key: string]: any}>;
}
```

**Usage Examples:**

```typescript
import { Loop, Sequence, Part, Synth, getTransport, start } from "tone";

const synth = new Synth().toDestination();

await start();

// Simple loop
const loop = new Loop((time) => {
  synth.triggerAttackRelease("C4", "8n", time);
}, "4n");

// Sequence with notes
const seq = new Sequence((time, note) => {
  synth.triggerAttackRelease(note, "8n", time);
}, ["C4", "E4", "G4", "C5"], "8n");

// Part with timed events
const part = new Part((time, event) => {
  synth.triggerAttackRelease(event.note, event.duration, time);
}, [
  { time: "0:0:0", note: "C4", duration: "4n" },
  { time: "0:1:0", note: "E4", duration: "8n" },
  { time: "0:2:0", note: "G4", duration: "4n" }
]);

// Start everything
loop.start(0);
seq.start("4n");
part.start("1m");

getTransport().start();
```

## Types

```typescript { .api }
type TransportTime = Time | string;

interface ToneEventOptions {
  callback: (time: number, value: any) => void;
  value: any;
  loop: boolean | number;
  loopStart: TransportTime;
  loopEnd: TransportTime;
  probability: NormalRange;
  humanize: boolean | Time;
  mute: boolean;
}

interface LoopOptions {
  callback: (time: number) => void;
  interval: Time;
  iterations: number;
  probability: NormalRange;
  humanize: boolean | Time;
  mute: boolean;
}

interface SequenceOptions {
  callback: (time: number, note: any) => void;
  events: any[];
  subdivision: Time;
  probability: NormalRange;
  humanize: boolean | Time;
  mute: boolean;
  loop: boolean | number;
  loopStart: number;
  loopEnd: number;
}
```