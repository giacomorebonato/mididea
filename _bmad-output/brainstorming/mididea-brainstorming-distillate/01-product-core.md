This section covers core product interaction, visual design, sound design, musical intelligence, and mobile-first design. Part 1 of 3 from Mididea brainstorming sessions (Mar 30 + Apr 4, 2026).

## Core Interaction — Note Input & Step Editing

- XY Pad Note Selector: tap step → full-screen XY pad; X=pitch (scale-locked, snaps to nearest scale degree), Y=filter cutoff; drag→hear in real-time via Tone.js→release to confirm; inspired by Kaossilator
- Validated axis mapping (post-iteration): Y axis = duration, X expansion = velocity per note; supersedes original pitch×filter for velocity/duration layer
- Stacked Chips: each step shows assigned notes as colored chips stacked vertically (higher pitch=higher position); double-tap chip to remove (validated: prevents accidental deletion during drag), "+" for XY pad; visual = mini melodic contour
- Try-Before-You-Commit: hear note as you drag on XY pad
- Scale Strip (alt to XY): horizontal strip with wide thumb-friendly scale degree zones; tap→hear→add
- Chord Presets: quick-add for root/power/triad/7th; custom voicings via XY pad
- Track Types: drum (binary toggle, compact circle rows) vs synth (XY pad input, taller rows with note chips)
- Ghost Notes Preview: XY pad shows adjacent step notes as faded chips for spatial memory
- Swipe-to-Copy: long-press→lift step→swipe paste; double-tap to clear
- Octave Zones: XY pad divided into 2-3 horizontal zones (low/mid/high); X=scale degrees within zone
- Per-Step Filter from Y-Axis: filter cutoff saved per-note; timbral variation baked into input gesture

## Visual Design & Feedback

- Sweeping Column Playhead: semi-transparent colored column highlights active step; glow/pulse effect
- Step Intensity Heatmap: steps with more stacked notes glow more intensely; empty=dark
- Note Chip Color = Pitch: warm (red/orange)=low, cool (blue/purple)=high; chord=color blend
- Minimal Chrome during playback: grid + playhead only; controls on tap; creation takes 95% of screen
- Dark Mode Only: nightclub/studio aesthetic; opinionated brand identity
- Waveform Silhouette on Feed Cards: tiny waveform showing energy contour of loop

## Sound Design

- Tone.js Synth Palette: 4-6 curated presets ("Glass," "Warm," "Buzz," "Pluck," "Pad"); filter cutoff interacts differently per preset
- One-Knob-Per-Sound: exactly one tweakable parameter per preset (Glass→decay, Buzz→distortion, Pad→reverb)
- Macro Knob: global "intensity" slider adjusting filter+reverb+distortion+attack simultaneously
- Sound Preview Carousel: tap instrument label→horizontal carousel; each sound previews using current pattern
- Seasonal Sound Packs: quarterly Tone.js preset drops; free for all; shared sonic vocabulary

## Musical Intelligence

- Scale Selector with Mood Labels: scales labeled by feel ("Happy," "Mysterious," "Melancholic," "Funky," "Spacey"); actual name in small text
- Auto-Harmonize: toggle adds harmonizing note (3rd or 5th) to every placed note
- Root Note Lock: toggle forcing first step of each loop to root
- Pattern Length Per Track: each track can have different step count (drums=16, bass=12); creates polyrhythm
- Auto Genre/Mood Tags: computed from content (tempo→Slow/Driving, scale→Dark/Bright, density→Minimal/Dense)

## Mobile-First Design

- Thumb Zone Design: play/stop + step tapping in center/bottom thumb zones; secondary controls in corners
- Haptic Feedback: every step toggle/note placement triggers haptic buzz; different intensities for add/delete; rhythmic pulse on edited steps
- Landscape Lock Prompt: portrait=feed, landscape=editor; orientation IS mode switch
- Tap Tempo: tap empty area rhythmically; 3 taps locks in tempo
- Shake to Randomize: shake→randomize synth notes within scale (keeps rhythm, scrambles melody)
- Tilt to Pan: tilting phone left/right pans stereo field
- Progressive Track Disclosure: first-time editor shows 1 drum+1 synth; "+" to add; complexity scales with confidence

## Pattern & Song Structure

- Horizontal Pattern Slots: thin numbered filmstrip row below grid; tap=switch, long-press=copy; chain plays L→R, loops
- Pattern Chain Editor: drag reorder; tap slot multiple times to repeat (x2, x3)
- Color-Coded Patterns: each pattern auto-assigns color; grid border tints match; color shifts during chain playback
- Transition Hints: last step of pattern A + first step of pattern B shown as ghost preview
- Scene Variations: duplicate pattern; mute/unmute tracks or shift notes

## MVP Scope

- Tracks: 1 drum (8 preset sounds) + 1 synth
- Steps: 16 per pattern
- Note Input: XY pad, scale-locked, mood-labeled scales; velocity via X expansion, duration via Y (post-iteration validated)
- Visual: dark mode, stacked chips, sweeping column playhead, heatmap glow
- Sound: 4-6 Tone.js presets, one-knob-per-sound
- Patterns: single pattern (chaining post-MVP)
- Controls: play/stop, tempo slider, swing slider
- Export: one-button MIDI
- Social: public feed, play-before-login, remix with lineage
- Auth: OAuth on save/share only
- Data: SQLite-per-song, main DB for users/metadata
- Mobile: landscape editor, portrait feed, thumb-zone layout
- Monetization: free (5 songs), subscription for unlimited
