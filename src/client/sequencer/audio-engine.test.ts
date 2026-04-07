import { test, expect, describe, mock, beforeEach } from 'bun:test'

// Mock Tone.js
const mockTriggerAttackRelease = mock(() => {})
const mockReleaseAll = mock(() => {})
const mockSynthDispose = mock(() => {})
const mockFilterDispose = mock(() => {})

const mockResume = mock(() => Promise.resolve())
const mockClose = mock(() => Promise.resolve())

const mockRawContext = {
  state: 'running' as string,
  currentTime: 0,
  resume: mockResume,
  close: mockClose,
}

mock.module('tone', () => ({
  start: mock(() => Promise.resolve()),
  getContext: () => ({
    rawContext: mockRawContext,
  }),
  PolySynth: class {
    triggerAttackRelease = mockTriggerAttackRelease
    releaseAll = mockReleaseAll
    connect = mock(() => ({ volume: { value: 0 } }))
    dispose = mockSynthDispose
    volume = { value: 0 }
  },
  FMSynth: class {},
  Synth: class {},
  Filter: class {
    toDestination = mock(() => ({ dispose: mockFilterDispose }))
    dispose = mockFilterDispose
  },
}))

const { AudioEngine } = await import('./audio-engine')

describe('AudioEngine', () => {
  beforeEach(() => {
    mockResume.mockClear()
    mockClose.mockClear()
    mockRawContext.state = 'running'
    mockRawContext.currentTime = 0
    mockTriggerAttackRelease.mockClear()
  })

  test('dispose does NOT close the AudioContext', async () => {
    const engine = new AudioEngine()
    await engine.play()
    engine.dispose()

    expect(mockClose).not.toHaveBeenCalled()
  })

  test('synths still work after dispose and recreate cycle', async () => {
    // Simulate: create engine → set tracks → play → dispose
    const engine1 = new AudioEngine()
    const tracks = [
      {
        id: 'track-1',
        presetId: 'glass',
        steps: [
          [{ pitch: 'C4', velocity: 0.8, duration: 1 }],
        ],
      },
    ]
    engine1.setSynthTracks(tracks)
    await engine1.play()
    engine1.dispose()

    // Simulate: create new engine → set tracks → play
    const engine2 = new AudioEngine()
    engine2.setSynthTracks(tracks)
    await engine2.play()

    // The AudioContext should still be usable (not closed)
    expect(mockClose).not.toHaveBeenCalled()
    expect(mockRawContext.state).toBe('running')

    engine2.dispose()
  })
})
