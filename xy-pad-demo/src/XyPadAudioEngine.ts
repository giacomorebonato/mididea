import { Synth, PolySynth, Tone } from 'tone';

/**
 * Tone.js Audio Engine for XyPad
 * Handles note preview, playback, and synthesis
 */

export class XyPadAudioEngine {
  private synth: PolySynth;
  private initialized: boolean = false;

  constructor() {
    this.synth = new PolySynth(Tone.Synth, {
      maxPolyphony: 8,
      voiceAllocation: 'random',
    });
  }

  /**
   * Initialize audio engine (must be called after user interaction)
   * Browsers block audio until user gesture
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await Tone.start();
      await this.synth.toDestination();
      this.initialized = true;
      console.log('XyPad Audio Engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Play note with specified parameters
   * @param midiNote - MIDI note number (0-127)
   * @param velocity - Velocity value (0-127)
   * @param duration - Duration in milliseconds
   */
  playNote(midiNote: number, velocity: number, duration: number): void {
    if (!this.initialized) return;

    try {
      // Convert velocity to Tone.Normal (0-1)
      const normalizedVelocity = Math.max(0, Math.min(1, velocity / 127));

      // Convert duration to seconds
      const durationSeconds = duration / 1000;

      // Trigger note with envelope
      this.synth.triggerAttackRelease(
        Tone.Midi(midiNote),
        Tone.now(),
        durationSeconds,
        Tone.Normal(normalizedVelocity)
      );
    } catch (error) {
      console.error('Failed to play note:', error);
    }
  }

  /**
   * Preview note (short duration, immediate feedback)
   * @param midiNote - MIDI note number
   * @param velocity - Velocity value
   */
  previewNote(midiNote: number, velocity: number): void {
    if (!this.initialized) return;

    const normalizedVelocity = Math.max(0, Math.min(1, velocity / 127));
    const previewDuration = 0.1; // Short preview (100ms)

    this.synth.triggerAttackRelease(
      Tone.Midi(midiNote),
      Tone.now(),
      previewDuration,
      Tone.Normal(normalizedVelocity)
    );
  }

  /**
   * Stop all notes immediately
   */
  stopAll(): void {
    this.synth.releaseAll(Tone.now());
  }

  /**
   * Dispose audio engine resources
   */
  dispose(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.initialized = false;
  }

  /**
   * Check if audio engine is ready
   */
  isReady(): boolean {
    return this.initialized;
  }
}

// Singleton instance
let audioEngineInstance: XyPadAudioEngine | null = null;

export const getAudioEngine = (): XyPadAudioEngine => {
  if (!audioEngineInstance) {
    audioEngineInstance = new XyPadAudioEngine();
  }
  return audioEngineInstance;
};

export const disposeAudioEngine = (): void => {
  if (audioEngineInstance) {
    audioEngineInstance.dispose();
    audioEngineInstance = null;
  }
};
