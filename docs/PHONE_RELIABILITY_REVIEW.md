# Phone reliability: first assessment

Date: 28 October 2026

## Product priority

Someone in distress should be able to open one familiar toy, tap or drag at their own pace, and receive immediate, predictable feedback. The app must tolerate rapid taps. Reliability must not depend on the person slowing down.

This is a source inspection, not a reproduction of the reported OnePlus crash. No phone memory trace, browser crash log, frame measurements, or real-device test has been collected. The issues below identify concrete sources of unnecessary work and lifecycle gaps; they do not establish the exact cause of the crash. No app behaviour has been changed in this pass.

## Findings, in implementation order

### 1. Cached AI starts outside Talk and stays allocated after leaving it

Evidence:

- `src/main.tsx:103` mounts ChatRoom even when Talk is hidden and passes `opened={!entering}` independently of the selected room.
- `src/ChatRoom.tsx:106` checks the model cache on entry and calls `prepare()` if cached. `src/model-startup.ts` explicitly implements this auto-warm behaviour.
- `src/ChatRoom.tsx:101` creates the model worker. `src/local-ai.ts` configures a Llama 3.2 1B model with a 4096-token context.
- `src/ChatRoom.tsx:70–74` pauses microphone and speech on navigation, suspension, or page hide, but does not call `stopAI()`. The worker is terminated on component unmount, which ordinary room navigation does not trigger.

Impact: returning visitors with the model cached can load a substantial model while using another activity. Navigating away during a reply can leave generation running. This is the strongest memory/resource concern found in this pass; it only applies when AI is installed or prepared.

Proposed change: start AI only through an explicit action in Talk. Cancel pending initialization and generation, and release the worker when leaving Talk or hiding the page. Keep the visible conversation separately so freeing the model does not erase it. Apply the same resource-ownership policy to optional downloaded voice and transcription workers.

### 2. All toys and several activities are mounted together

Evidence:

- `src/main.tsx:112–118` renders multiple activity panels behind `hidden` attributes.
- `src/FidgetRoom.tsx:32` constructs every toy and hides all but the selection.
- `src/ChatRoom.tsx:150` mounts every catalog activity behind hidden wrappers.

Impact: hidden content is excluded from layout by CSS, but its React components, retained state, listeners, and effects still exist. Some activities correctly pause their timers through `active`; this is not evidence that every hidden toy is continuously animating. It is unnecessary retained work and makes consistent cleanup harder.

Proposed change: mount the selected activity and toy only. Preserve small useful state explicitly where needed; avoid retaining complete interactive scenes just to retain progress.

### 3. Drawing and sand rebuild accumulated strokes on pointer movement

Evidence:

- `src/CalmActivity.tsx` copies the latest stroke into React state on each pointer move, then reconstructs every visible polyline string. Its limits permit 40 strokes of 1200 points each.
- `src/FidgetRoom.tsx` does the same for sand, permitting 30 strokes of 600 points, with three rendered polylines per stroke.
- Sand also includes an SVG turbulence filter.

Impact: the cost of each movement can increase with the drawing's accumulated detail. The existing bounds prevent unlimited growth, but still allow tens of thousands of coordinates to be serialized repeatedly.

Proposed change: keep in-progress pointer samples outside React state, draw at most once per display frame, discard redundant nearby points, and cache completed strokes. Consider a small 2D canvas for the drawing surface if needed. Set a total point budget, rather than relying only on per-stroke limits. Replace the sand turbulence with a static texture or simpler fill.

### 4. Decorative rendering competes with interaction

Evidence:

- `src/main.tsx:102` enables the interactive 3D sculpture on Home.
- `src/MindSculpture.tsx` creates an antialiased WebGL renderer, uses a pixel ratio up to 1.75, loads a brain model, and renders continuously while visible when motion is enabled. Returning Home remounts it.
- `src/Atmosphere.tsx`, `src/style.css`, and `src/controls.css` add animated scenery, filters, and several blurred translucent surfaces.
- The sculpture already has visibility gating, cleanup, and a context-loss fallback. These are useful protections, but do not eliminate its normal rendering cost.

Impact: extra graphics work may reduce the headroom available for touch feedback, particularly alongside AI. Its actual contribution needs device profiling.

Proposed change: use a lightweight illustration by default, keep motion concentrated in the chosen toy, and replace broad backdrop blurs with simple surfaces. Preserve the gentle colours and tactile feedback. A lightweight mode should remain playful, rather than merely turning off all animation.

### 5. Rapid input needs explicit resource and transition guarantees

Evidence:

- Existing toys already guard pointer identity, cap several effect lists, and throttle many sounds. Preserve these protections.
- `src/ChatRoom.tsx:101` has no synchronous in-flight guard before creating a preparation worker. Its epoch check prevents stale completion from being accepted, but does not immediately stop an older worker if preparation is invoked again.
- `src/local-voice.ts` stops playback separately from terminating its synthesis worker; navigation calls the playback stop operation.
- `src/soundscapes.ts` generates noise buffers and decodes recordings during sound changes. Crossfades intentionally keep previous sources alive briefly.

Impact: fast transitions can create resource churn. Duplicate preparation is an edge case to test, not a confirmed explanation of normal toy taps crashing.

Proposed change: make initialization single-flight, cancel superseded work immediately, reuse bounded audio resources where practical, and ensure a leaving room owns no active work. Coalesce decorative tap feedback while responding immediately to meaningful input. Do not impose a general slow-tapping requirement.

## Proposed experience

Make a familiar favourite available with one ordinary tap. Keep one obvious interaction on the activity screen, a clear way back, and optional sound. Move the larger activity catalog and AI setup away from the immediate entry path. The current slide-to-enter screen followed by a carousel adds gestures and choices before a toy is reached; simplifying that route should accompany the performance work.

Suggested first implementation: isolate AI lifecycle, mount one toy, simplify Home rendering, and bound drawing work. Then simplify the entry route and adjust only the effects that still cost too much in profiling.

## Verification before calling this fixed

- Test the actual OnePlus model, browser/version, and installed-app mode used by the person.
- Measure a cold visit with no models installed and a return visit with the AI model cached.
- Rapidly alternate navigation and repeatedly tap toys; verify no duplicate model workers or queued transitions.
- Draw and play with sand continuously, switch away and back repeatedly, and compare frame timing and retained memory after repeated cycles.
- Leave Talk while loading or generating; verify cancellation, worker release, and retained visible words.
- Switch away from the app, lock/unlock the phone, and resume; verify sound/microphone stop and the activity remains usable.
- Verify the essential toy works offline after installation. Test slow loading, audio failure, and WebGL failure without blocking access to the basic activity.
- Check that memory settles after repeated room changes rather than growing continually. A desktop or emulated phone viewport alone cannot validate the reported device crash.

## Review status

After the user explicitly approved source sharing, CodeRabbit reviewed the initial app and raised four minor issues: unnecessarily unloading AI after reply validation failures, outdated model documentation, inconsistent deployment path casing, and a version-specific offline runtime cache. All four were addressed. A second review raised one major issue about preserving marks when scenes unmount; a session-only data store was added to address it. A third review raised one minor issue about repeatedly showing the model install prompt after dismissal; dismissal is now remembered for the visit, with explicit retry still available. The performance observations above came from direct source inspection, independently of CodeRabbit.


## Implemented reliability pass

The user asked to retain the existing UI. The entry screen, carousel, artwork, activity catalog, colours and controls are preserved; the proposed navigation redesign was not implemented.

- Home no longer constructs the hidden Talk session or toy scenes. Only the selected toy/activity mounts. Transcripts and Wind down text retain their existing session continuity. Bounded marks and toy/practice progress are retained separately as session data when scenes unmount, preserving continuity without keeping hidden scenes active.
- Even a cached AI model waits for an explicit start. Leaving Talk or hiding the page cancels loading/generation and releases workers. Optional local voice/transcription workers also release on leaving Talk or hiding the page.
- Preparation is single-flight; a synchronous guard prevents duplicate AI sends. Cancellation settles the loading wait and clears its timeout.
- Drawing and sand coalesce pointer samples into display frames, retain stable completed strokes, and simplify long gestures. At most 32 strokes with 256 points each remain in a drawing.
- The sculpture keeps its existing controls and appearance, with fewer sphere triangles, a 1.25 maximum pixel ratio on touch devices, and a 30 fps idle animation target. Direct manipulation can render immediately.
- Recoverable malformed/empty replies retain the working AI engine. Hardware, worker and timeout failures still unload it.
- A React error boundary offers a visible fresh start if rendering fails. This cannot recover a browser process killed by the operating system.
- Service-worker version is v50. Offline ONNX runtime matching accepts numeric semantic versions while retaining the trusted origin and filename restrictions.

## Validation of the implementation

- TypeScript and production build pass.
- All 35 non-browser check scripts passed. The voice-server test uses a local fixture with no real AI calls. An existing guide test was corrected to distinguish playback state from error notices.
- Mobile Chrome at 393 × 851: 200 immediate bubble toggles, 2,000 drawing moves, 25 room changes, no retained toy/activity DOM, and no JavaScript errors. Home initially constructed 461 elements versus 1,492 in the baseline (about 69% fewer).
- Sound-enabled browser test: rapid toy taps shared bounded audio contexts; leaving the toy released its context and muting closed the remaining background context.
- All 12 toys were visited twice without JavaScript errors. Clear all my words also clears retained toy data.
- Layout also fits a 320-pixel viewport. Home and sand screenshots were inspected in `test-results/`.
- Simulated cached-model tests passed: no automatic loading, duplicate preparation coalesced, empty reply recovery, later successful reply, cancellation on navigation, transcript retention, and download cancellation. These validate lifecycle control, not real phone inference speed or memory use.
- The production build reloaded offline in Chrome and Bubbles remained interactive, without JavaScript errors.

Physical OnePlus validation remains required. The exact phone model/browser and an actual crash trace have not been supplied; this pass does not claim to reproduce or conclusively eliminate the reported phone crash.

Browser checks are in `scripts/check-phone-browser.mjs`. They require a development server and Playwright/Chrome; set `HAPPY_MIND_PLAYWRIGHT_PATH` if Playwright comes from an external runtime. Screenshots are written to ignored `test-results/`.


CodeRabbit review results across the three passes: 6 issues, all addressed:

| Severity | File | Impact and fix |
| --- | --- | --- |
| Major | `src/FidgetRoom.tsx`, `src/main.tsx` | Scene disposal lost marks; bounded session data now preserves drawings and toy/practice progress separately. |
| Minor | `src/ChatRoom.tsx` | Invalid replies forced expensive model reloads; validation failures retain the working engine. |
| Minor | `public/sw.js` | A version-specific runtime path could break offline voice; numeric semantic versions are accepted on the existing trusted origin. |
| Minor | `README.md`, `docs/CHAT_INTERFACE.md` | Incorrect path casing differed from deployment; examples now use `/Happy-Mind/`. |
| Minor | `README.md`, current project/policy docs | Model descriptions named an earlier model; current descriptions identify Llama and historical QA is labelled. |
| Minor | `src/ChatRoom.tsx` | Declining setup led to repeated prompts; dismissal now persists for this visit and explicit retry remains available. |
