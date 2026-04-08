import MidiWriter from 'midi-writer-js'
import { noteToMidi } from './scales'
import type { DrumGrid, DrumId, SynthTrack } from './types'
import { DRUM_IDS } from './types'

// General MIDI percussion map (channel 10)
const GM_PERCUSSION: Record<DrumId, number> = {
  kick: 36, // C1 - Bass Drum 1
  snare: 38, // D1 - Acoustic Snare
  hihat: 42, // F#1 - Closed Hi-Hat
  clap: 39, // Eb1 - Hand Clap
  tom: 45, // A1 - Low Tom
  rim: 37, // C#1 - Side Stick
}

export function exportMidi(
  drumGrid: DrumGrid,
  synthTracks: SynthTrack[],
  bpm: number,
  stepCount: number,
) {
  const tracks: MidiWriter.Track[] = []

  // Drum track
  const drumTrack = new MidiWriter.Track()
  drumTrack.setTempo(bpm)
  for (let step = 0; step < stepCount; step++) {
    const activeDrums: number[] = []
    for (const drum of DRUM_IDS) {
      if (drumGrid[drum][step]) {
        activeDrums.push(GM_PERCUSSION[drum])
      }
    }

    if (activeDrums.length > 0) {
      drumTrack.addEvent(
        new MidiWriter.NoteEvent({
          pitch: activeDrums as unknown as string[],
          duration: '16',
          channel: 10,
          velocity: 100,
        }),
      )
    } else {
      drumTrack.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [GM_PERCUSSION.kick] as unknown as string[],
          duration: '16',
          channel: 10,
          velocity: 0,
        }),
      )
    }
  }
  tracks.push(drumTrack)

  // Synth tracks (one MIDI track per synth, starting on channel 1)
  for (let tIdx = 0; tIdx < synthTracks.length; tIdx++) {
    const synthTrack = synthTracks[tIdx]!
    const midiTrack = new MidiWriter.Track()
    midiTrack.setTempo(bpm)
    const channel = tIdx + 1 // channels 1, 2, 3...

    // Map step duration to MIDI duration strings
    const DURATION_MAP: Record<number, string> = {
      1: '16',
      2: '8',
      3: 'd8',
      4: '4',
      6: 'd4',
      8: '2',
    }

    for (let step = 0; step < stepCount; step++) {
      const notes = synthTrack.steps[step] ?? []

      if (notes.length > 0) {
        const pitches = notes.map((n) => noteToMidi(n.pitch))
        // Map velocity (0-1) to MIDI velocity (40-127)
        const avgVelocity =
          notes.reduce((sum, n) => sum + (n.velocity ?? 0.8), 0) / notes.length
        const velocity = Math.round(40 + avgVelocity * 87)
        // Use the max duration of the notes in this step
        const maxDur = Math.max(...notes.map((n) => n.duration ?? 1))
        const midiDuration = DURATION_MAP[maxDur] ?? '16'

        midiTrack.addEvent(
          new MidiWriter.NoteEvent({
            pitch: pitches as unknown as string[],
            duration: midiDuration,
            channel,
            velocity,
          }),
        )
      } else {
        // Rest
        midiTrack.addEvent(
          new MidiWriter.NoteEvent({
            pitch: [60] as unknown as string[],
            duration: '16',
            channel,
            velocity: 0,
          }),
        )
      }
    }
    tracks.push(midiTrack)
  }

  const writer = new MidiWriter.Writer(tracks)
  const blob = new Blob([writer.buildFile()], { type: 'audio/midi' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mididea-pattern.mid'
  a.click()
  URL.revokeObjectURL(url)
}
