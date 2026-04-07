import type { DrumId } from './types'

type DrumSoundFn = (ctx: AudioContext, time: number) => void

function kick(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, time)
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.1)
  gain.gain.setValueAtTime(1, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.3)
}

function snare(ctx: AudioContext, time: number) {
  // Tone component
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(200, time)
  oscGain.gain.setValueAtTime(0.7, time)
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
  osc.connect(oscGain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.1)

  // Noise component
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(3000, time)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.8, time)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15)
  noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination)
  noise.start(time)
  noise.stop(time + 0.15)
}

function hihat(ctx: AudioContext, time: number) {
  const bufferSize = ctx.sampleRate * 0.05
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(8000, time)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.4, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
  noise.connect(filter).connect(gain).connect(ctx.destination)
  noise.start(time)
  noise.stop(time + 0.05)
}

function clap(ctx: AudioContext, time: number) {
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(2000, time)
  filter.Q.setValueAtTime(2, time)
  const gain = ctx.createGain()
  // Multi-tap envelope to simulate clap
  gain.gain.setValueAtTime(0.8, time)
  gain.gain.setValueAtTime(0.001, time + 0.01)
  gain.gain.setValueAtTime(0.6, time + 0.02)
  gain.gain.setValueAtTime(0.001, time + 0.03)
  gain.gain.setValueAtTime(0.8, time + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15)
  noise.connect(filter).connect(gain).connect(ctx.destination)
  noise.start(time)
  noise.stop(time + 0.15)
}

function tom(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(250, time)
  osc.frequency.exponentialRampToValueAtTime(100, time + 0.15)
  gain.gain.setValueAtTime(0.8, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.25)
}

function rim(ctx: AudioContext, time: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(800, time)
  gain.gain.setValueAtTime(0.6, time)
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03)
  osc.connect(gain).connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.03)
}

export const drumSounds: Record<DrumId, DrumSoundFn> = {
  kick,
  snare,
  hihat,
  clap,
  tom,
  rim,
}
