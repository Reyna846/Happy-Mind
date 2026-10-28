# Conversation room

## Shared experience
`ChatRoom.tsx` owns one in-memory conversation and draft. Voice and Chat are views of that same state. Switching views stops speech and the microphone without clearing words. Leaving the room clears the room's transient state. App settings can clear/remount it explicitly. Page hide stops speech/microphone and terminates the AI worker.

Voice supports manual dictation/review/send and an explicitly started hands-free session: speech → pause → automatic send → local AI → speech synthesis → listening again. The circle follows actual speech start/end events, with a subtitle card that remains readable after playback. It is turn-based, not full-duplex Realtime. Speaking can be stopped, muted, or interrupted by starting the mic. The global sound toggle also stops voice. A speech epoch prevents late AI replies from restarting audio after view/mute/settings changes. No background listening. Automatic listening restarts only within an active, explicitly started hands-free session; stop/mute/settings/hide/errors disarm it.

## Activity slot
`CalmActivity.tsx` hosts authored, reviewed modules in place, without navigating away from the conversation:
- Draw: leaf tracing or free strokes, bounded vector paths, pointer capture for touch, colour choice, clear, and a keyboard-accessible sample line.
- Breathe: one local elapsed-time clock drives the ball size, phase, and countdown; 5 seconds in, 5 seconds out, no hold. Pause retains elapsed time; close unmounts the clock. Page hide/settings pause it. Reduced motion keeps the ball still while preserving the text cues.
- Ground: self-paced 5–4–3–2–1 sensory noticing with previous/next controls.
- Release: gentle shoulder, hand, jaw, and support-awareness prompts, with no forced stretch.

Activities are optional and do not claim to treat a condition. The drawing module is a focus activity, not a clinically validated intervention. Grounding/breathing reference general NHS guidance; no single pace is required or comfortable for everyone.

Sources:
- https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/
- https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises

## Dynamic AI controls
`chat-protocol.ts` owns the provider-neutral response schema and runtime parser. The local WebLLM request uses constrained JSON generation. Future cloud providers must return the same contract:

```json
{"reply":"Would you like a quiet moment to draw?","activity":"draw","mood":"sand","ambience":"soften"}
```

Only four fields are allowed: `reply` (nonempty text, up to 1200 characters), `activity` (`draw|breathe|ground|release|body|listen|hand|null`), `mood` (`lake|dusk|sand|null`), `ambience` (`keep|soften|quiet`). Unknown keys/types/values reject the response. Plain text can be displayed but has no interface authority. No model code, SVG, HTML, URLs, arbitrary audio parameters, microphone commands, or runtime game generation.

Activity suggestions render as buttons; they do not start or replace an activity. Validated moods apply only when automatic atmosphere is enabled. Sound commands can only soften/silence existing ambience, never enable audio or override manual sound-off. Audio ducks during listening/speaking. Visual changes are decorative, not an assessment of the person's mental state.

## AI boundary and recovery
Free browser-local WebLLM remains the current provider. Initial download and inference depend on WebGPU, device memory, network access to model/runtime hosts, and model compatibility. GPT/cloud credentials are not configured. Preparation has a 5-minute timeout; response generation has a 60-second timeout. Stop/leave/hide invalidates pending results and terminates the worker. Responses arriving after cancellation cannot alter the UI. Context is bounded and adjacent user turns after a failed reply are normalized. Failure leaves activity controls accessible.

## Checks
`node scripts/check-chat.mjs` covers valid/rejected actions, plain-text fallback, malformed payloads, exact 5/5 breath boundaries, and bounded/normalized history. `npm run build -- --base=/Happy-Mind/` checks production typing/build. Physical microphone, audible playback, actual model generation, and hosted/offline behavior require separate validation; browser events and screenshots alone cannot prove them.

The latest session policy, sound library, flower welcome, activity registry and hands-free controller are documented in `EXPERIENCE_UPGRADES.md`. Conversation persistence is intentionally absent, and deployment is explicitly deferred.
