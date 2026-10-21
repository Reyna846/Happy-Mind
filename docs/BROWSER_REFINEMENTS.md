# Browser review changes
1/11: Back moved to header left.
2: Voice chooser/preview, natural-voice preference and slower speech; quality depends on installed voices.
3: Welcome cycles on open/foreground and at 30 minutes, without replacing sent-conversation replies.
4: SVG wave transition into Flow.
5: Three circular Home choices side by side.
6: Cat icon and Car label.
7/16: Old company caption replaced by Smol car / Car is happy / treat feedback.
8: Voice default, composer in Chat only; voice draft review/share remains.
9: Removed room privacy disclosure; privacy retained in Settings.
10: Header volume dropdown and mute.
12: Removed second room navigation; Moments is a hub.
13: Purr, synthetic meow/treat request, Feed Car and thank-you feedback.
14: Removed Add a wave; retained keyboard drawing on sand.
15: Replaced Orbit with touch-painted Glow garden.
17: Larger defined water surface, no island/lily pad or bank props.
18: Notice gains sensory choices and embedded companion compositions. Demo verifies display path; live model quality remains open.
Additional: Wind down routine, selected/hover/focus highlights throughout. Sleep/voice references in ASSET_NOTES.md.

## Latest carousel / voice refinement
Home uses a large three-room swipe carousel; compact version docks on Flow/Talk/Breathe. Direct dragging, resisted edges, short-fling snap, fading contact trail, keyboard arrows/Enter and entry pulse implemented. Header/nav/activity tiles use translucent glass. Talk has a primary “Talk to me” action, flower/Waves/Glow avatar choice, microphone-level feedback with recognition fallback, streaming reply subtitles and smaller invitation. Creation controls moved to Settings → Companion. Wind down no longer offers restart.
Verified at 444×703 and 320×700: drag and keyboard selection, docked route switching, demo partial text and subtitle completion, avatar/auto settings, no horizontal overflow and bedtime terminal state. Automated protocol/gesture/partial parsing/voice checks and base-path PWA asset checks pass. Physical microphone/audio and real-model streaming require device validation.

## Soft sculpture and rituals
Brain now has smooth blush-pink lobes and softer grooves; release spin coasts longer with bounded spring bounce, and only Flower/Mind controls remain. Breathing prepares for two seconds, counts live through three 5/5 rounds, pauses and ends with “Good job.” Graphic bounds reserve space for controls. Notice uses a hold-to-warm pebble and explicit colour/touch/sound next steps. Wind down has an original drifting crescent/stars, “I accept the day” / “And make room for joy” actions and affirmative feedback. Activity cards use translucent lavender.
Browser: 444×703 and 320×700; confirmed pink rendered model, yaw continuing from 1.151 to 1.964 after release, reset absent, Ready state, live phase/count and pause/resume, button clearance/no horizontal overflow, 3.2s pebble hold feedback and next cue, moon animation and bedtime affirmations. Timing tests cover preparation/phase boundaries/completion. Physical phone touch/graphics remains unverified.
Live 32-second session rechecked after fixing a deferred React updater timing capture: Ready → three cycles → “Good job.” / “You made a little space for yourself.” verified in-browser at 320×700. Screenshot: breathing-finish.jpg.

## Reading, drawing and 5/2/5/2 rhythm
Voice subtitles now fill a read-only textarea with Lora type; Chat remains the editable conversation mode. Drawing maps client coordinates through inverse SVG screen CTM, tracks one pointer and preserves its viewBox ratio. Verified rendered endpoints at (120,320) and (300,390) match pointer drag within 0.001px in a letterboxed viewport. Main/inline breathing share 5s in, 2s hold, 5s out, 2s rest, three cycles plus ready countdown. Holds can be skipped by leaving the practice. Quadratic gesture trail, transparent compact carousel, 1.25× active / .78× neighbours and lilac/peach flower materials implemented. Build, rhythm boundaries, gesture/voice and PWA checks pass.
Final narrow check: at 320×700, primary CTA bottom 583px versus nav top 628px, no horizontal overflow. Lilac petals/peach centre visually confirmed. Docked swipe still routes to Breathe; calmer serif phase/count rendered. Compact carousel scrolls with page content to avoid covering headings while activities are open.

## Sleepier moon
Wind-down moon progresses from relaxed → drowsy → yawning → eyes closed → peaceful sleep after Let go. SVG eyelids/mouth ease between expressions; drift slows per step, faint dream letters appear at the end. Reduced motion suppresses drifting/dream motion and transitions. Verified all five accessible mood states through the actual four-step flow, plus final screenshot at 444×703. Production build and PWA cache checks pass.

## Material and settings polish
Home defaults to centred Talk with Flow/Breathe on either side; play uses cat icon. Brain has separate hemispheres/raised winding gyri instead of drawn grooves. Water uses captured pointer trails and local rings with shifted reflections, never a whole-surface press. Sand has warm grain/dunes, carved grooves and a 950ms left-to-right Clean sweep; input blocked during cleanup and timer disposed on unmount. Cat treat CTA has biscuit/heart detailing. Glass settings, lavender/twilight/rose swatches and visible sound definitions; avatar legend now says Voice avatar and explains it changes the shape only.
Browser 444×703: Talk initial focus, actual water drag produces multiple rings with parent transform none; sand draw creates grooves then Clean ends with zero stroke polylines; settings glass, correct swatches and sound descriptions inspected. Build, sculpture/voice/audio and PWA checks pass. Physical touch/audio remains unverified.

## Focused conversation and light play
Voice/Chat switch portals into the appropriate page header (embedded Notice guidance included); unmount removes it. Greeting now lives in subtitles; “Let’s talk” uses Lora directly below, with mute/mic to the side. Transcript immediately precedes composer; activities/setup follow it. Assistant messages/composer use glass lavender. Talk carousel icon is larger and redesigned.
Breathe→Notice remembers its source independently from the parent room: Back returns to Breathe then original room, with explicit Back to breathing available. Pebble tap/keyboard requests 12ms vibration where supported. Glow Scatter removed; swatches replace Colour; Clear gathers/fades seeds over 850ms, then removes them, cancels timer on unmount and respects reduced motion.
Browser verified header toggle preserves Chat state, composer adjacency, Breathe→Notice→Breathe→Talk without loop, palette selection and clearing→zero seeds. Build/voice/audio/PWA checks pass. Physical vibration/microphone feedback remains unverified; existing RMS feedback and recognized-word bounce are retained.
Final 320×700 check: composer bottom 599px vs navigation top 628px, no horizontal overflow, directly adjacent to transcript. Demo send streams and completes with no browser errors; header toggle/voice layout fit. Screenshots: focused-voice.jpg, focused-chat.jpg.

## Session continuity / navigation / activity repair
Flow retired from primary navigation in favour of Wind down; Home carousel now Wind down/Talk/Breathe, bottom Home/Talk/Wind down/Moments. Talk, Notice guidance and bedtime panels remain mounted, hidden/inert while inactive; stop mic/TTS and suppress background UI actions while retaining messages/draft/mode/progress. Pending demo reply completed while away and appeared on return. Clear all words remounts panels; no disk history.
Modes now precede content and stay reachable. Standing drawing invitation removed. Activity replaces voice/chat stage; carousel hides and scroll resets to avoid the former compact-grid overlap. Switching mode closes activity. Glass microphone notices, elevated/highlighted buttons and darker bedtime palette. Ending reduced to one line and a spaced action.
Browser verified 444×703 and 320×700: send→Wind down→Talk retains user+reply; unfinished draft survives Moments; Voice/Chat share transcript; bedtime step retained across tabs; activity opens without orb/subtitle overlap and modes restore conversation. At 320px composer bottom 596 vs nav top 628; no horizontal overflow. Imported 315KB brain loads ready and renders/rotates, generated moon expressions render through bedtime. Build/GLB/voice/timing/PWA checks pass (13 cached resources). Physical voice/haptics and installed-PWA offline remain unverified.
Privacy regression check: Clear all my words reset Talk's draft/mode/session and returned Wind down to step 1 with an empty note. No browser errors observed.
