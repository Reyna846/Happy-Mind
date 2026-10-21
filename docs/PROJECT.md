# Happy Mind

## Product and stack
Personal phone-first calm PWA; no tours or publishing until requested. React 19/TypeScript/Vite, lazy Three.js. No backend/dedicated repo/deployment; checkout is in a parent Git worktree. Talk defaults to labelled demo replies; optional WebLLM Qwen 1.5B needs WebGPU/~1GB download, no API bill. Physical-device/model quality remains unverified.

## Interaction and navigation
Lavender/plum glass, gentle highlights/elevation; motion preferences win. Home carousel: Wind down / Talk (centred) / Breathe. Bottom: Home / Talk / Wind down / Moments. Flow was a private journal without AI; removed from primary navigation. Header Back/volume/settings. Notice returns to Breathe, then originating room without a loop.

Talk, Notice guidance and Wind down stay mounted in hidden/inert panels across navigation, preserving conversation, draft, selected mode, activity and bedtime notes in memory. Inactive chat stops mic/read-aloud. Pending replies may finish into their transcript, with background UI actions suppressed. No analytics/history/text persistence; reload clears words. Clear all my words remounts sessions. Model files and UI/voice preferences may persist.

## Conversation
Voice and Chat use the same message state/send path. Always-visible mode row precedes content; composer directly follows transcript. Activities replace voice/chat content until closed, never compact it into overlapping columns. No standing Draw invitation; activities live in Moments. Recognition auto-sends after silence and resumes after read-aloud; full duplex unimplemented. Stop on settings/mute/hide/inactive/unmount.

`speech.ts` selects/ previews installed soft voices; browser speech services may process online. Subtitles show greeting/progressive replies/spoken sentences. Flower/Waves/Glow are avatars, with local mic RMS and recognition bounce. `chat-protocol.ts` validates activity/mood/ambience and bounded garden/stars/feeling artifacts; no executable content. Listen-only/manual mood/sound-off preferences win. Prompt: `local-ai.ts`; contract: `AGENT_BEHAVIOR.md`.

## Quiet tools and assets
Notice: held pebble, optional 12ms vibration, sensory cues and shared artifact board. Breathing: two-second preparation, three 5/2/5/2 cycles, count/pause/finish. Car: scratch/purr, treats/meow/thanks; sound stops on exit/settings/hide. Bubbles, Glow palette/fade-clear, grainy sand/Clean sweep, drag-responsive water. SVG drawing uses inverse screen coordinates. Marks bounded; keyboard alternatives.

Wind down: temporary notes, affirmations, dark lavender, spacious ending and generated five-expression moon sprite crossfades. NHS practice notes linked. Home: procedural petals plus CC0 brain GLB (315KB), source/license in `public/models/CREDITS.md`; rotation/inertia/crossfade. Abort pending loads and dispose resources on exit; WebGL fallback. Brain/moon are precached with production-only service worker; bump cache each release. Asset tests do not prove device offline behavior.

References: `ASSET_NOTES.md`, `BROWSER_REFINEMENTS.md`, `plan.md`; scripts cover protocol, adaptation, voice, timing, gestures, GLB and PWA.
