This section covers social/community, collaboration, data architecture, feed/discovery, onboarding, monetization, export, and risk mitigation. Part 2 of 3 from Mididea brainstorming sessions (Mar 30 + Apr 4, 2026).

## Social & Community

- Public-First Feed: landing page IS feed of creations playing as you scroll; no sign-up wall; "Remix" clones into editor
- Play-Before-Login: create without login; localStorage; auth prompt only on save/share
- Remix Chain: every creation tracks lineage ("Remixed from → [original]"); family tree; original creator gets credit + notification
- Reaction Sounds: listeners drop sound reactions (cymbal, clap, vinyl scratch) that play on top of pattern; audible engagement
- Embed Widget: iframe with interactive mini animated grid player; "open"→full editor; every embed is a funnel
- "Made with Mididea" Audio Tag: optional subtle melodic signature+app name at start of audio exports; "Intel Inside" approach
- Profile = Sonic Identity: auto-generates mega-mix of latest creations with continuous crossfading playback
- Creation Calendar: GitHub-style contribution squares for music creation; streaks visible

## Collaboration

- Three-Tier Permissions: Owner (full), Collaborator (edit), Everyone (listen+remix); no viewer role — if you can see it, you can remix it
- Live Collaboration Cursors: colored cursors for simultaneous collaborators; changes heard real-time via WebSocket
- Surprise Collaborator: opt-in random pairing with someone's public song; add one track; creator gets notification
- Track Claiming: each track shows who's working on it (small avatar); "claim" empty tracks for coordination
- Musical Chat: 4-step snippets tagged to specific bars instead of text
- Fork Don't Fight: "fork" song → instant copy with shared lineage; no destructive conflicts; remix chain shows divergence
- Async by Default: edit, save, walk away; collaborator sees diff highlight (new notes glow); live sync is bonus; works across time zones
- Contribution Timeline: timeline showing who added what/when; play song at any historical point

## Data Architecture

- SQLite-Per-Song: main SQLite for users/permissions/metadata; each creation gets own SQLite file (tracks, steps, notes, patterns, chain, sounds) named by UUID
- Creation File as Export: .sqlite file IS the save format; download=download .sqlite; import=accept .sqlite; server format=local format; zero conversion bugs
- Lazy Loading: feed loads only metadata from main DB; pattern data loads on play/edit
- WebSocket Collab Sync: Bun.serve WebSocket broadcasts real-time edits; tiny messages (step, track, action, note, filter); SQLite is source of truth
- Snapshot Versioning: every save creates snapshot in versions table; undo history persists across sessions; rewind to any previous state; git-like at near-zero cost; anti-griefing tool
- Collaboration via File Lock: server opens SQLite for editing; WebSocket broadcasts; Bun single-threaded serializes writes; WAL mode handles concurrent reads
- Sharding by Song: 10k songs=10k small SQLite files; no single DB grows large; scale by adding disk; horizontal scaling without DB clusters; no Postgres/Redis/managed DB
- Cold Storage: songs not accessed 30+ days compress to R2 (no egress fees); decompress on demand (sub-second)
- Main DB Stays Tiny: central SQLite only: users, song metadata, social graph; no music data; fits in RAM

## Feed & Discovery

- Auto-Playing Cards: each creation = card with animated grid (steps lighting, playhead sweeping); audio plays when in viewport (one at a time)
- "Listening Now" Counter: live count of current listeners; FOMO + social proof
- Remix Count as Social Proof: branch icon with count; most-remixed = community landmarks; better quality signal than plays/likes
- Feed Filters by Vibe: horizontal scrollable pills ("Chill," "Heavy," "Weird," "Collab Wanted," "Fresh Today")
- Infinite Scroll Radio Mode: "Radio" toggle; creations autoplay one after another; lean-back community-programmed listening
- Random Song Button: dice icon loads random public creation; no algorithm; 0-play songs have equal chance

## Onboarding (Zero Onboarding)

- Discoverable by Doing: app loads with pre-filled demo pattern already playing; every tap audible; no tutorial/modal/welcome screen
- Pre-Seeded Starter Patterns: 3-4 genre starters ("Chill," "Techno," "Hip-Hop," "Weird"); modify rather than create from scratch
- Land on a Playing Pattern: first visit=featured creation already playing; grid alive; product demonstrates itself in first second
- "Tap Anything" Prompt: single subtle text overlay; disappears after first tap; entire tutorial=one sentence, 3 seconds
- Instant Remix Entry Point: featured pattern has glowing "Remix this" button; clone into editor; first action=modifying not creating
- Sound Reward for Every Action: every UI interaction makes micro-sound; sonically alive UI as brand identity
- No Sign-Up Screen Ever: minimal bottom sheet only on first persistence action; one OAuth button

## Monetization

- Free Tier: 5 song slots, full functionality; constraint is storage not capability
- Single Subscription: unlimited songs, ~$3-5/month; no tiered plans
- Collaborator Slots Don't Count: songs where you're collaborator don't count toward 5
- Export Always Free: MIDI, WAV, SQLite project file

## Export

- One-Button MIDI Export: all tracks, all patterns in chain order, tempo, velocities; immediate download; no settings/dialog
- WAV Bounce: render Tone.js audio to .wav; small MIDI/Audio toggle
- SQLite Project Export: download .sqlite file as project backup/transfer

## Delight & Retention

- Undo/Redo as Time Travel: every undo step plays pattern at that state; undo becomes creative tool
- Notification as Music: collaborator edit notification opens song playing with changes
- "Continue This" Challenges: weekly community prompt (2-pattern starter); all submissions public
- Trending Sounds Rotation: weekly featured Tone.js presets; creations using them get visual badge
- Streaks Without Pressure: flame icon for consecutive days; missing pauses not resets; flame dims but never dies
- Creation Birthday: anniversary notification with stats ("Remixed 23 times")
- Collaborator Credits Roll: after full song plays, brief credits showing each collaborator + their tracks
- Ghost Playback of Original: in remix, toggle "show original" as ghost chips for A/B listening
- First Remix Celebration: special notification with confetti; milestone converting tool user → community member

## Risk Mitigation

- Mobile Latency: Web Audio API latency; mitigate with pre-buffer on load, AudioWorklet; test on cheap Android early; step sequencer forgiving but XY preview must feel responsive
- Content Moderation: basic text moderation on titles/usernames only; music can't be offensive in step sequencer context
- Discovery Problem: "most remixed" ranking surfaces quality organically; no algorithm needed
- Collaboration Abuse: snapshot versioning → destructive edits one click to revert; owner can revoke access instantly
