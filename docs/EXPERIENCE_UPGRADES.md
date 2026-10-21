# Experience upgrades

## Scope and constraints
Personal use, no conversation persistence, no paid cloud service, no publication until the product is ready. Settings may persist; conversation text, feedback, declined activities, and contextual preferences are held only in the conversation component's memory and disappear on exit/reload. Support all browser/device targets through feature checks and fallback UI, without claiming unsupported speech or GPU capabilities.

## Contextual adaptation
`adaptation.ts` adds a session policy to the model's recent conversation. It remembers only session-local interaction preferences: listen mode, declined activities, recently offered activities, and explicit helpful feedback. The prompt receives this structured context. A deterministic policy suppresses declined/repeated suggestions, enforces a three-turn repeat cooldown, and spaces model mood changes by two turns. In listen mode, activity/mood changes are suppressed and obvious unsolicited advice gets a brief authored listening response. This guard was added after a real local-model failure; it is not a guarantee of general response quality. Held mood and sound-off still win. Talk no longer changes mood from draft keywords; it uses the model's contextual reply plus this policy. Flow retains local decorative word cues and never sends thoughts to AI. Preferences do not constitute an assessment of emotional state.

## Sound library
`public/audio/` includes original water-dripping and rainfall recordings from Wikimedia Commons, each CC BY-SA 3.0 with attribution, source and licence in `public/audio/CREDITS.md`. Original files are unchanged; playback crossfades loop edges. Procedural room tone and shore sounds provide network-free alternatives and a decoder fallback. Selection crossfades, the volume slider uses a dB mapping, and ambience ducks during speech/listening. Backgrounding stops playback. A recording decoder failure is disclosed; headphone/speaker listening tests are still required.

## Welcome
`WelcomeBloom.tsx` is original SVG artwork: eight white petals pulse and gather/fade into a white brain with fine contour lines, then return to the flower. It is not a blocking splash screen. Reduced motion displays a still flower. The graphic is independent of personal history.

## Activity space and extension path
`activity-registry.ts` is the catalog and source of truth for valid action IDs, titles, descriptions, practice notes and provenance. The picker and model catalog use it automatically. Seven ready activities: drawing, 5/5 breathing, sensory grounding, gentle release, body check-in, listening, and fingertip tracing. A new self-paced practice needs one registry entry with `renderer:'steps'` and a reviewed `steps` list; it immediately becomes available to the picker, validator, model prompt and generic renderer. New interactions need a reviewed renderer; the model never executes generated code. There is no claim that a bespoke drawing game has clinical efficacy.

Sources reviewed:
- NHS breathing: https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/
- NHS grounding: https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises
- Guy's and St Thomas' body scan and mindful movement: https://www.guysandstthomas.nhs.uk/health-information/mindfulness-based-stress-reduction-mbsr/mbsr-exercises
- NHS mindfulness: https://www.nhs.uk/mental-health/self-help/tips-and-support/mindfulness/
- Humber hand-tracing and grounding: https://connect.humber.nhs.uk/resource/mindfulness-hand-breathing-and-grounding-techniques/

## Voice: implementation and explicit boundary
`voice-loop.ts` coordinates an explicitly started hands-free session. A 1.8-second pause in recognition results sends one turn automatically. Recognition is paused while generating or speaking; successful playback completion resumes listening. Tap the circle during speech to interrupt and listen. Sentence captions follow speech boundary events when a voice supplies them; the full reply remains the fallback. End session, mute, settings, activity start, exit, backgrounding, permission errors and repeated recognition failures stop automatic listening. Late events cannot restart a stopped session.

This is hands-free **turn-taking**, not simultaneous full-duplex audio. Browser SpeechRecognition availability, endpointing and permission behaviour vary. Browser TTS boundary events are not guaranteed. True cross-browser full duplex requires a different streaming speech transport/engine, echo handling and device tests; the current free local stack cannot guarantee it. AI chooses words and suggestions, while the client implements capture, playback, timing and interruption. No cloud provider or billing was silently enabled.

Browser references:
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/continuous
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event

## Verification
`node scripts/check-upgrades.mjs` covers session preference/cooldown rules, registered actions, subtitle segmentation, automatic turn submission, no duplicate turns, resumption, cancellation and permission-denial shutdown with a simulated recognizer. These tests do not establish real microphone transcription, end-to-end voice quality, echo cancellation, physical-phone performance or full-duplex compatibility. Build and PWA cache checks cover the bundled shell and audio assets. Browser QA separately covers actual visible controls/practice steps.
