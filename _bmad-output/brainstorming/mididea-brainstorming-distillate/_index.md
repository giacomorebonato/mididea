---
type: bmad-distillate
sources:
  - "../brainstorming-session-2026-03-30-001.md"
  - "../brainstorming-session-2026-04-04-001-final.md"
downstream_consumer: general
created: "2026-04-07"
token_estimate: 5685
parts: 3
---

## Orientation

- Distilled from 2 brainstorming sessions (Mar 30 + Apr 4, 2026) for Mididea — a web-based music step sequencer
- 140 total ideas generated across 21 themes; morphological analysis, SCAMPER, cross-pollination, first principles techniques used
- Product identity: mobile-first social music toy, not a DAW; competes with boredom
- Tech stack: Bun runtime, Bun.serve() with HTML imports, React frontend, Tone.js audio, SQLite-per-song architecture
- Facilitator: Mino; user gravitates toward simplicity, mobile-first, social-by-default, gesture-based controls over DAW paradigms

## Critical Design Decision — XyPad Validated Axis Mapping

- Y axis = duration (vertical position/movement controls note length)
- X expansion = velocity per note (horizontal expansion/stretching encodes velocity for each note)
- Validated through iterative prototyping; supersedes original brainstorm mappings (X=pitch, Y=filter cutoff, then later Y=velocity via slide)
- Each note carries its own velocity value; simple, direct spatial model

## Section Manifest

- `01-product-core.md` — Core interaction (XY pad, chips, note input), visual design, sound design, musical intelligence, mobile-first design, MVP scope
- `02-social-collab-data.md` — Social/community, collaboration, data architecture (SQLite-per-song), feed/discovery, onboarding, monetization, export, risk mitigation
- `03-xypad-velocity-duration.md` — XyPad velocity/duration brainstorm detail (40 ideas across 6 themes), prioritization, action plans, first principles

## Cross-Cutting Items

- Tone.js used for all audio: synth presets, XY pad preview, feed card playback, sound reactions
- Bun.serve() provides HTTP routes + WebSocket (real-time collab) + HTML imports (React bundling)
- SQLite-per-song enables: collaboration (file lock + WAL mode), scaling (sharding by song), export (.sqlite IS the project file), versioning (snapshot table)
- Dark mode only; nightclub/studio aesthetic; no light mode
- Mobile landscape = editor, portrait = feed; orientation IS mode switch
- Free tier: 5 songs, full functionality; subscription for unlimited
- Export always free: MIDI + WAV + SQLite project file
