import * as Tone from 'tone'
import type { DrumGrid, SynthTrack } from './types'
import { DRUM_IDS } from './types'
import { drumSounds } from './drum-sounds'
import { SynthEngine } from './synth-engine'

const SCHEDULE_AHEAD = 0.1 // seconds to schedule ahead
const LOOKAHEAD = 25 // ms between scheduler checks

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private timerID: ReturnType<typeof setInterval> | null = null
  private nextNoteTime = 0
  private currentStep = 0
  private bpm = 120
  private swing = 0 // 0-100
  private drumGrid: DrumGrid | null = null
  private stepCount = 16
  private onStep: ((step: number) => void) | null = null
  private synthEngine = new SynthEngine()

  setGrid(grid: DrumGrid) {
    this.drumGrid = grid
  }

  setSynthTracks(tracks: SynthTrack[]) {
    this.synthEngine.setTracks(tracks)
  }

  setTempo(bpm: number) {
    this.bpm = bpm
  }

  setSwing(swing: number) {
    this.swing = swing
  }

  setStepCount(stepCount: number) {
    this.stepCount = stepCount
  }

  setOnStep(cb: (step: number) => void) {
    this.onStep = cb
  }

  async play() {
    await Tone.start()
    // Use Tone's underlying AudioContext so drums and synths share the same timeline
    this.audioContext = Tone.getContext().rawContext as AudioContext
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    this.currentStep = 0
    this.nextNoteTime = this.audioContext.currentTime + 0.05
    this.scheduler()
    this.timerID = setInterval(() => this.scheduler(), LOOKAHEAD)
  }

  stop() {
    if (this.timerID !== null) {
      clearInterval(this.timerID)
      this.timerID = null
    }
    this.synthEngine.releaseAll()
  }

  private scheduler() {
    if (!this.audioContext) return
    while (this.nextNoteTime < this.audioContext.currentTime + SCHEDULE_AHEAD) {
      this.scheduleStep(this.currentStep, this.nextNoteTime)
      this.advanceStep()
    }
  }

  private scheduleStep(step: number, time: number) {
    if (!this.audioContext) return

    // Schedule drum sounds
    if (this.drumGrid) {
      for (const drum of DRUM_IDS) {
        if (this.drumGrid[drum][step]) {
          drumSounds[drum](this.audioContext, time)
        }
      }
    }

    // Schedule synth sounds
    const secondsPerStep = 60.0 / this.bpm / 4
    this.synthEngine.scheduleStep(step, time, secondsPerStep)

    // Notify UI of current step
    const stepForCallback = step
    setTimeout(() => {
      this.onStep?.(stepForCallback)
    }, (time - this.audioContext!.currentTime) * 1000)
  }

  private advanceStep() {
    const secondsPerBeat = 60.0 / this.bpm
    const secondsPer16th = secondsPerBeat / 4

    // Apply swing to even-numbered steps (off-beats)
    // Swing shifts the off-beat notes later in time
    const isOffBeat = this.currentStep % 2 === 1
    const swingAmount = isOffBeat ? (this.swing / 100) * secondsPer16th * 0.5 : 0

    this.nextNoteTime += secondsPer16th + swingAmount
    this.currentStep = (this.currentStep + 1) % this.stepCount
  }

  dispose() {
    this.stop()
    this.synthEngine.dispose()
    this.audioContext = null
  }
}
