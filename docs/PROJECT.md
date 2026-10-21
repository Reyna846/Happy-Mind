# Happy Mind

## Product and stack
Calm React/TypeScript/Vite PWA, lazy Three.js. Optional protected Node realtime backend; parent Git worktree. Talk defaults to labelled demo replies; optional WebLLM Qwen 1.5B needs WebGPU/~1GB download, no API bill. Phone/model quality unverified.

## Interaction and navigation
Lavender/plum glass, gentle elevation; reduced motion respected. Entry says “Slide into a softer moment” and requires a slide (keyboard Enter/Space alternative), never auto-opens. Entry starts a four-second audio fade. Bottom bar is the sole primary navigation: Home / Talk / Wind down / Moments. Header keeps brand, volume/settings and contextual Back for tools. Moments exposes toys/drawing/practices. `responsive.css` follows legacy styles: 640px reading sizes, 1024px split Home/four-column Moments, bounded artwork and safe nav clearance. Page reveal animates the existing main without remounting sessions. Notice returns to Breathe, then originating room without a loop.

One Talk instance owns voice/chat; Notice links back to it. Full transcript stays in memory; only AI context is bounded. Talk, Notice, Wind down, breathing, drawing/practices, toys and water stay mounted in hidden/inert panels. Marks/progress persist across navigation and toy switches. Inactive audio/mic stop, breathing pauses; pending replies may finish without background UI actions. No text persistence; reload clears words. Clear all my words remounts sessions/tools. Model files and UI preferences may persist.

## Conversation
Voice/Chat share messages. Always-visible mode row includes direct Companion options; composer directly follows transcript. Activities replace voice/chat content until closed, never compact it into overlapping columns. No standing Draw invitation; activities live in Moments. Local voice uses short plain-text turns/streamed captions; Chat retains structured actions. Optional OpenAI WebRTC voice: server key, private access code, consent, quotas/timer, agent.md instructions; disabled until configured. Setup: `OPENAI_VOICE.md`. Mic/speech stop on settings/mute/hide/inactive; prepared model survives backgrounding.

`speech.ts` selects/ previews installed soft voices; browser speech services may process online. Subtitles show greeting/progressive replies/spoken sentences. Flower/Waves/Glow are avatars, with local mic RMS and recognition bounce. `chat-protocol.ts` validates activity/mood/ambience and bounded garden/stars/feeling artifacts; no executable content. Listen-only/manual mood/sound-off preferences win. Prompt: `local-ai.ts`; contracts: `agent.md` and `AGENT_BEHAVIOR.md`.

## Quiet tools and assets
Notice: held pebble, optional gentle vibration, sensory cues and shared artifact board. Breathing: four no-hold practices, SVG phase/control icons, numeric counts, optional guide and musical cues; retained pause. Car: scratch/purr, treats/meow/thanks; sound stops on exit/settings/hide. Bubbles, Glow palette/fade-clear, grainy sand/Clean sweep, water with spaced raindrop sounds. SVG drawing uses inverse screen coordinates. Bounded marks; keyboard access. Drawing/sand use continuous filtered friction loops, speed-shaped with idle/release fades; other feedback is throttled. Mute/pause/hide/unmount dispose audio. Chat send/cancel stays icon-only at 44px. Haptics: brief rate-limited taps on deliberate controls/tactile starts, no continuous drag/typing/bedtime pulses; Settings toggle and reduced-motion/hidden-page guards.

Wind down: temporary notes, affirmations, dark lavender, spacious ending and generated five-expression moon sprite crossfades. NHS practice notes linked. Home: procedural flower/CC0 brain GLB; credits in `public/models/CREDITS.md`. Abort pending loads and dispose resources on exit; WebGL fallback. Brain/moon are precached with production-only service worker; bump cache each release. Asset tests do not prove device offline behavior.

References: `ASSET_NOTES.md`, `BROWSER_REFINEMENTS.md`, `plan.md`; scripts cover protocol, adaptation, voice, timing, gestures, GLB and PWA.
