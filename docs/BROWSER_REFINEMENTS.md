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

## One navigation and deliberate entry
Entry now requires a slide (90% threshold, cancellation resets; Enter/Space accessible alternative), with no timer. Bottom bar is sole primary navigation; header retains utilities/contextual Back. Home has three starting actions. Moments exposes 12 direct tools/practices, including separate toys and Draw in the first group. Companion options live in the mode row. Main reveal uses Web Animations without remounting sessions; respects reduced motion. Browser checked at 320×700 and 444×703: no horizontal overflow, direct tools/Back, draft continuity, keyboard entry/options visibility and no console errors. Swipe on physical phone remains unverified.

## Responsive layout
Dedicated responsive.css after legacy styles: readable tablet/desktop Talk, split desktop Home, four-column Moments from 1024px, uncropped aspect-ratio fidget SVGs, bounded header/content, short-window entry/settings and bottom safe clearance. Browser matrix 320/768/1024/1440/1920 plus 844×390 landscape: main pages have no horizontal overflow, nav in bounds. Breathe/Notice/Draw/Water/Sand checked at phone/desktop. Desktop composer cap corrected (bottom 711, nav top808 at1440×900). Build/PWA/entry checks pass. Other engines and real devices remain unverified.

## Breathing library
Replaced dot/automatic 5-2-5-2 with four explicit-start practices: belly 4/4, equal 4/4, longer-exhale 4/6, alternate nostrils 4×4. Four short rounds, no holds; timings are optional app adaptations. NHS gentle breathing and VA yoga guidance linked in UI. Shared room/chat renderer, belly/ribbon/own-left-right SVG cues, static reduced-motion alternatives, phase-linked synthesized musical pad with mute/volume/hidden cleanup. Browser 320×700 and1440×900: selectors/start/pause/resume/return/settings work, no overflow/errors; phone control bottom599 vs nav628. Timing/cycle/nostril and audio lifecycle tests pass. Physical speaker/headphone sound quality remains unverified.

## Symbolic breathing and optional realtime voice
Breathing selectors/control icons, In/Out phase symbol, large count, four round marks and optional Guide replace repeated prose. Hold symbol documented but no holds introduced.320px controls clear nav, no overflow. Optional OpenAI voice UI requires consent/private backend code; disabled backend checked before mic. Backend mock tests verify origin/auth/offer validation, instruction loading/response-token bound, persistent daily reservation and provider failure without real API calls. Credentials never included in Vite variables except public server URL. Live voice/API access/actual costs remain unverified; no hard dollar ceiling promised.
