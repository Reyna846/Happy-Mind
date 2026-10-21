# Happy Mind

## Product and stack
React/TypeScript/Vite PWA, lazy Three.js. Legacy backend; parent worktree. Talk is local-only; WebLLM Qwen 1.5B needs WebGPU/~1GB; no API bill. Phones unverified.

## Interaction and navigation
Lavender/plum glass; 44px targets, readable labels and focus rings. Final control styling: `controls.css`; direction: `UIUXVisions.md`. Reduced motion respected. Entry requires a slide or Enter/Space, then a four-second audio fade. Bottom bar is the sole primary navigation: Home / Talk / Wind down / Moments. Header keeps volume/settings/Back. Home restores Wind down/Talk/Breathe circles. English-only voices/dictation. Moments exposes tools. `responsive.css` follows legacy styles: 640px reading sizes, 1024px split Home/four-column Moments, bounded artwork and safe nav clearance. Page reveal animates the existing main without remounting sessions. Notice returns to Breathe, then originating room without a loop.

One Talk instance; provider selection retains user messages. Transcript stays in memory; AI context is bounded. Talk, Notice, Wind down, breathing, drawing/practices, toys and water stay mounted in hidden/inert panels. Marks/progress persist across navigation and toy switches. Inactive audio/mic stop, breathing pauses; pending replies may finish without background UI actions. Reload clears words. Clear all my words remounts sessions/tools. Models/preferences may persist.

## Conversation
Voice/Chat share messages. Voice/Chat mode row; composer directly follows transcript. Activities replace voice/chat content until closed, never compact it into overlapping columns. Activities live in Moments. Local voice uses short plain-text turns/streamed captions; Chat retains structured actions. No provider chooser or demo. First entry probes WebLLM cache: missing model prompts for consent; cached model warms automatically. Global Settings retained.  Mic/speech stop on settings/mute/hide/inactive; prepared model survives backgrounding.

Optional Kokoro Heart q8/WASM worker speaks Qwen replies at 0.9 speed after explicit Sound-settings preparation. Browser speech may process online. Optional Whisper Tiny English records 30-second local turns after preparation; no recording persistence. Bundled Heart guides in Breathe/Notice/Talk work without Qwen. Model downloads cache, words do not. Audio epochs suppress interrupted playback. Subtitles show greeting/progressive replies/spoken sentences. Flower/Waves/Glow are avatars, with local mic RMS and recognition bounce. `chat-protocol.ts` validates activity/mood/ambience and bounded garden/stars/feeling artifacts; no executable content. Listen-only/manual mood/sound-off preferences win. Prompt: `local-ai.ts`; contracts: `agent.md` and `AGENT_BEHAVIOR.md`.

## Quiet tools and assets
Notice: held pebble, optional gentle vibration, sensory cues and shared artifact board. Breathing: four no-hold practices, SVG phase/control icons, numeric counts, optional guide and musical cues; retained pause. Car: scratch/purr, treats/meow/thanks; sound stops on exit/settings/hide. Bubbles, Glow palette/fade-clear, grainy sand/Clean sweep, water with spaced raindrop sounds. SVG drawing uses inverse screen coordinates. Bounded marks; keyboard access. Drawing/sand use continuous filtered friction loops, speed-shaped with idle/release fades; other feedback is throttled. Mute/pause/hide/unmount dispose audio. Chat send/cancel stays icon-only at 44px. Haptics: brief rate-limited taps on deliberate controls/tactile starts, no continuous drag/typing/bedtime pulses; Settings toggle and reduced-motion/hidden-page guards.

Wind down: temporary notes, affirmations, dark lavender, spacious ending and generated five-expression moon sprite crossfades. Home: procedural flower/CC0 brain GLB; credits in `public/models/CREDITS.md`. Abort pending loads and dispose resources on exit; WebGL fallback. SW precaches guides/art, caches JS/WASM, uses network-first pages and explicit update/restart notice. Phone offline behavior unverified.

References: `QA_AUDIT.md`, `ASSET_NOTES.md`, `LOCAL_VOICE.md`.
