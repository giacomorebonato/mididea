import { test, expect, describe, mock, beforeEach } from 'bun:test'

// Mock Tone.js before importing SynthEngine
const mockTriggerAttackRelease = mock(() => {})
const mockReleaseAll = mock(() => {})
const mockConnect = mock(() => ({ volume: { value: 0 } }))
const mockSynthDispose = mock(() => {})
const mockFilterDispose = mock(() => {})
const mockToDestination = mock(() => ({ dispose: mockFilterDispose }))

mock.module('tone', () => ({
  PolySynth: class {
    triggerAttackRelease = mockTriggerAttackRelease
    releaseAll = mockReleaseAll
    connect = mockConnect
    dispose = mockSynthDispose
    volume = { value: 0 }
  },
  FMSynth: class {},
  Synth: class {},
  Filter: class {
    toDestination = mockToDestination
    dispose = mockFilterDispose
  },
}))

const { SynthEngine } = await import('./synth-engine')

describe('SynthEngine', () => {
  let engine: InstanceType<typeof SynthEngine>

  beforeEach(() => {
    engine = new SynthEngine()
    mockTriggerAttackRelease.mockClear()
    mockReleaseAll.mockClear()
    mockConnect.mockClear()
    mockSynthDispose.mockClear()
    mockFilterDispose.mockClear()
    mockToDestination.mockClear()
  })

  test('scheduleStep calls triggerAttackRelease for each note in a step', () => {
    const tracks = [
      {
        id: 'track-1',
        presetId: 'glass',
        steps: [
          [
            { pitch: 'C4', velocity: 0.8, duration: 1 },
            { pitch: 'E4', velocity: 0.6, duration: 2 },
          ],
        ],
      },
    ]
    engine.setTracks(tracks)
    engine.scheduleStep(0, 1.0, 0.125)

    expect(mockTriggerAttackRelease).toHaveBeenCalledTimes(2)
    // First note: C4, duration = 1 * 0.125, velocity = 0.1 + 0.8 * 0.9
    const call1 = mockTriggerAttackRelease.mock.calls[0] as unknown[]
    expect(call1[0]).toBe('C4')
    expect(call1[1]).toBe(0.125)
    expect(call1[2]).toBe(1.0)
    expect(call1[3]).toBeCloseTo(0.82)
    // Second note: E4, duration = 2 * 0.125, velocity = 0.1 + 0.6 * 0.9
    const call2 = mockTriggerAttackRelease.mock.calls[1] as unknown[]
    expect(call2[0]).toBe('E4')
    expect(call2[1]).toBe(0.25)
    expect(call2[2]).toBe(1.0)
    expect(call2[3]).toBeCloseTo(0.64)
  })

  test('empty steps produce no calls', () => {
    const tracks = [
      {
        id: 'track-1',
        presetId: 'glass',
        steps: [[], []],
      },
    ]
    engine.setTracks(tracks)
    engine.scheduleStep(0, 1.0, 0.125)
    engine.scheduleStep(1, 1.125, 0.125)

    expect(mockTriggerAttackRelease).not.toHaveBeenCalled()
  })

  test('setTracks creates synths for new tracks', () => {
    const tracks = [
      { id: 'track-1', presetId: 'glass', steps: [[]] },
      { id: 'track-2', presetId: 'warm', steps: [[]] },
    ]
    engine.setTracks(tracks)

    // Each track creates a synth that gets connected
    expect(mockConnect).toHaveBeenCalledTimes(2)
  })

  test('setTracks reuses synths when preset unchanged', () => {
    const tracks = [{ id: 'track-1', presetId: 'glass', steps: [[]] }]
    engine.setTracks(tracks)
    expect(mockConnect).toHaveBeenCalledTimes(1)

    // Set same tracks again — synth should NOT be recreated
    engine.setTracks(tracks)
    expect(mockConnect).toHaveBeenCalledTimes(1)
  })

  test('dispose cleans up all synths', () => {
    const tracks = [
      { id: 'track-1', presetId: 'glass', steps: [[]] },
      { id: 'track-2', presetId: 'warm', steps: [[]] },
    ]
    engine.setTracks(tracks)
    engine.dispose()

    expect(mockSynthDispose).toHaveBeenCalledTimes(2)
    expect(mockFilterDispose).toHaveBeenCalledTimes(2)
  })
})
