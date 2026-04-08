declare namespace MidiWriter {
  class Track {
    constructor()
    setTempo(bpm: number): void
    addEvent(event: any): void
  }
  class NoteEvent {
    constructor(options: any)
  }
  class Writer {
    constructor(tracks: any[])
    buildFile(): any
  }
}
