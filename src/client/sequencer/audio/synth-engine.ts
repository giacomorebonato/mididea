import * as Tone from 'tone'
import type { SynthTrack } from '../types'
import { getPresetById } from './synth-presets'

export class SynthEngine {
  private synths = new Map<string, Tone.PolySynth>()
  private filters = new Map<string, Tone.Filter>()
  private tracks: SynthTrack[] = []

  setTracks(tracks: SynthTrack[]) {
    this.tracks = tracks

    // Create/update synths for each track
    for (const track of tracks) {
      if (
        !this.synths.has(track.id) ||
        this.getPresetForTrack(track.id) !== track.presetId
      ) {
        this.disposeTrack(track.id)
        const preset = getPresetById(track.presetId)
        const filter = new Tone.Filter(8000, 'lowpass').toDestination()
        const synth = preset.create()
        synth.connect(filter)
        synth.volume.value = -6
        this.synths.set(track.id, synth)
        this.filters.set(track.id, filter)
        this.presetCache.set(track.id, track.presetId)
      }
    }
  }

  private presetCache = new Map<string, string>()

  private getPresetForTrack(trackId: string): string | undefined {
    return this.presetCache.get(trackId)
  }

  /** Schedule synth notes at a specific time in the Web Audio timeline */
  scheduleStep(step: number, time: number, secondsPerStep: number) {
    for (const track of this.tracks) {
      const notes = track.steps[step] ?? []
      if (notes.length === 0) continue

      const synth = this.synths.get(track.id)
      const filter = this.filters.get(track.id)
      if (!synth || !filter) continue

      // Trigger each note with its own duration and velocity
      for (const note of notes) {
        const duration = (note.duration ?? 1) * secondsPerStep
        // Map velocity (0-1) to Tone.js velocity (0.1-1)
        const velocity = 0.1 + (note.velocity ?? 0.8) * 0.9
        synth.triggerAttackRelease(note.pitch, duration, time, velocity)
      }
    }
  }

  releaseAll() {
    for (const synth of this.synths.values()) {
      synth.releaseAll()
    }
  }

  private disposeTrack(trackId: string) {
    this.synths.get(trackId)?.dispose()
    this.filters.get(trackId)?.dispose()
    this.synths.delete(trackId)
    this.filters.delete(trackId)
    this.presetCache.delete(trackId)
  }

  dispose() {
    for (const trackId of this.synths.keys()) {
      this.disposeTrack(trackId)
    }
  }
}
