This section covers XyPad velocity/duration interaction design brainstorm detail (40 ideas across 6 themes), prioritization, action plans, and first principles. Part 3 of 3 from Mididea brainstorming sessions (Mar 30 + Apr 4, 2026).

## Validated Design (Post-Iteration) — SUPERSEDES BRAINSTORM DEFINITIONS BELOW

- Y axis = duration (vertical position/movement controls note length)
- X expansion = velocity per note (horizontal expansion/stretching encodes velocity for each note)
- Validated through iterative prototyping and usability testing; provides good usability with clear spatial mapping on mobile and desktop
- Product identity: XyPad makes velocity and duration natural spatial properties; each note carries its own velocity value

## Validated First Principles

1. Users don't think in MIDI values — need felt experience (soft/medium/loud), not numbers
2. Duration is about musical feel not time — tap timing = duration, not seconds
3. Mobile constraints matter — slide gestures over complex multi-touch are optimal
4. Visual feedback must be glance-readable — scan patterns while playing, not study each note
- Validated by First Principles Thinking technique; user inspired by Novation Circuit hardware for velocity-emergent patterns

## Velocity Control Ideas

- [V#1] Circle Size Visual: velocity as circle diameter (small=soft, big=loud); removes MIDI values entirely
- [V#2] Seconds Display: duration as "0.25s", "1.0s" on chip; time for non-musicians
- [V#3] Z-Axis Pressure: pressure sensitivity; harder press = higher velocity; Force Touch/Wacom
- [V#4] Tap Impact Speed: quick tap = loud, gentle = soft; drum dynamics via timing
- [V#5] Gesture Intensity: faster movement = higher velocity; frantic=loud, calm=soft
- [V#6] Circle Size Desktop: scroll wheel/modifier keys for velocity
- [V#7] Velocity Absent by Default: all notes medium; velocity only for deviations; reduces beginner anxiety
- [V#8] Y-Axis Line Thickness: slide up/down = velocity; chip border thickness
- [V#9] Tap Hold Staccato / Drag Sustained: quick tap = short, drag distance = duration
- [V#10] Desktop: scroll wheel velocity, Shift+drag duration, keyboard shortcuts
- [V#11] Note Personality Trait: velocity maps to sound character (low=gentle/round, high=sharp/brassy)
- [V#12] Elastic Band Gesture: velocity as tension (flick up=snap high), duration as stretch (pull right)
- [V#13] Multi-Touch Velocity: spread fingers = velocity across multiple notes simultaneously
- [V#14] Keyboard Velocity: number keys 1-9 as velocity presets (1=ghost, 5=medium, 9=forte)
- [V#15] Pulse Expansion: note animates from small pulse to full size; soft=slow glow, loud=fast explode
- [V#16] Swipe Chip Size: swipe up=velocity+, down=velocity-, right=duration+, left=duration-
- [V#17] Radial Menu: long-press→ring menu with velocity (inner) and duration (outer)
- [V#18] Velocity Zones: XY pad divided into zones (top=loud, middle=medium, bottom=soft)
- [V#19] Hover Preview Desktop: hover=hear preview at velocity; right-click-drag=velocity gradient
- [V#20] Pressure Curve Shape: sharp tap=loud+short, gentle rise=soft+sustained
- [V#21] Press+Hold All Params: position=pitch, hold length=duration, release pressure=velocity
- [V#22] Multi-Note Batch Edit: lasso/shift-click select, drag adjusts all velocities
- [V#23] Two-Finger Sculpting: first finger anchors pitch, second slides for velocity/duration
- [V#24] Duration as Fill Animation: horizontal bar fill=duration, brightness=velocity

## Duration Control Ideas

- [D#1] Relative Labels: "short/medium/long" or comparative to adjacent notes
- [D#2] Heat/Saturation Fade: notes glow when placed, fade over sequence; longer=sustained brightness
- [D#3] Snap to Musical Beats: velocity sets duration implicitly (louder=longer); grid snap to BPM subdivisions
- [D#4] Probability/Rhythm Deviation: duration=chance of triggering on subsequent steps; creates grooves/stutters
- [D#5] Echo/Delay Amount: duration controls echo into next step; spatial parameter
- [D#6] Automation Loop Length: duration=number of automation cycles; mini-automation per step
- [D#7] Note Personality/Mood: duration changes character (staccato/legato/pizzicato)
- [D#8] Fixed Duration Presets: no per-note duration; global per-track
- [D#9] Tap-to-Stretch: quick tap=default, drag horizontally to stretch
- [D#10] Musical Relationship: "quarter note", "eighth note", auto-calculated from tempo
- [D#11] Tap Length + Adjustable: duration=how long you hold XY pad; adjustable afterward; simplest mobile model
- [D#12] Relative Labels (duplicate of D#1)

## Visual Feedback Ideas

- [Vis#1] Duration as Visual Line: horizontal line from note; longer line=longer note; thickness=velocity
- [Vis#2] Note Silhouette: opacity/glow=velocity, outline width/shadow=duration
- [Vis#3] Pulse Expansion: same as V#15; duration as sustained glow
- [Vis#4] Column Glow During Sustain: step column glows with velocity intensity during playback
- [Vis#5] Single Chip Dimension: inner saturation=velocity, outer ring thickness=duration; one visual carries both
- [Vis#6] Duration as Fill Animation: same as V#24
- [Vis#7] Backlit Chip Color: brightness=velocity, saturation=duration
- [Vis#8] Heat/Saturation Fade: same as D#2

## Interaction Design Ideas

- [I#1] Elastic Band Gesture: same as V#12
- [I#2] Press+Hold All Params: same as V#21
- [I#3] Single Finger Two-Mode: tap=create, double-tap=remove (validated: prevents accidental deletion during drag); drag=adjust velocity/duration; long-press=edit mode
- [I#4] Hear First, Adjust Second: tap=plays immediately, adjust while sustaining; sound-driven learning
- [I#5] Multi-Touch Velocity: same as V#13
- [I#6] Two-Mode XY Pad: toggle Note Mode (X=pitch, Y=filter) vs Velocity/Duration Mode
- [I#7] Hover Preview Desktop: same as V#19
- [I#8] Velocity+Duration Single Axis: diagonal swipe (up-right=louder+longer)
- [I#9] Params Set First: velocity/duration visible before choosing pitch
- [I#10] XY Pad Always Shows State: every position displays velocity circles and duration bars
- [I#11] Stored Defaults + XY Modifiers: stored velocity/duration per step; XY modifies independently
- [I#12] Two-Finger Sculpting: same as V#23

## Cross-Domain Ideas (Gaming, Instruments)

- [G#1] Charge Mechanic: hold to charge velocity; longer hold=higher cap
- [G#2] Stamina/Mana Bar: duration as depleting bar; time as visible resource
- [G#3] Attack/Defense Stats: per-track velocity-in/velocity-out; RPG-style mix balance
- [G#4] Duration Overdrive: exceeding threshold→different timbre/distortion; risk/reward
- [G#5] Critical Hit Zones: center=medium, edges=max/crit; hitbox precision=velocity
- [G#6] Breath Curve Swell: velocity starts soft, swells; mimics wind instruments
- [Ins#7] Sustain Pedal Mode: toggle short/long; binary control like piano sustain
- [Ins#8] String Bend: drag during playback to bend velocity in real-time
- [Ins#9] Bellows Pump: repeated gestures pump time into note; duration as rhythmic gesture

## Experimental Ideas

- [E#1] Duration as Personality/Mood: same as D#7
- [E#2] Duration as Automation Loop: same as D#6
- [E#3] Duration as Echo/Delay: same as D#5
- [E#4] Gesture History Learning: system learns velocity preferences; personalized defaults
- [E#5] Time Dilation: tempo changes stretch/compress duration visuals
- [E#6] Rumble Feedback: phone vibrates matching velocity; multi-sensory; effective on mobile
- [E#7] Multi-Touch Velocity Sculpting: more fingers=louder; velocity via spatial distribution
- [E#8] Duration as Probability/Rhythm: same as D#4
- [E#9] Velocity=Overtones: high velocity adds harmonics; timbral richness not loudness
- [E#10] Velocity as Note Age: high=fresh/clean, low=worn/degraded

## Prioritization (Brainstorm — Superseded by Validated Design)

- Top 3: (1) Single Chip Encoding [Vis#5+V#8+D#11]; (2) Hear-First Adjustment [I#4+Vis#3]; (3) Elastic Band [I#1+V#1+D#9]
- Quick Wins: Circle Size Visual, Tap Length+Adjustable, Single Finger Two-Mode
- Most Innovative: Haptic Rumble, Stamina Bar, Probability/Rhythm Duration
- Action Plan P1: chip rendering (inner brightness+outer ring), tap-length gesture, adjustable duration, mobile testing
- Action Plan P2: physics gestures, spring animations, bounce-back; fun factor testing
- Action Plan P3: real-time preview, pulse animation, sound-driven learning loop
