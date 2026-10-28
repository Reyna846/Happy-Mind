> Historical QA notes below refer to earlier Qwen builds. The current app downloads Llama 3.2 1B; these older inference results do not validate the current model on a phone.

# App audit — 21 October 2026

## Fixed
- Provider selection discarded the user's transcript; Local AI now removes only labelled examples, retaining personal turns. Reselecting the active provider no longer unloads Qwen.
- Closing Settings stopped browser speech but left Heart audio alive. Both playback paths now stop; switching between preview engines also cancels the previous audio.
- Drawing used 8px action labels, 34px colour targets and a 40px close control. Actions are now 14px with 44px targets; drawing/feedback rows wrap on small screens.
- Supporting copy increased to 12px, body/instructions to 16px; navigation labels remain 11px only below 360px to fit four destinations. Input/select text uses 16px to avoid phone focus zoom. DM Sans controls and Lora headings retain the existing identity.
- Darker muted text and primary gradients improve contrast; bedtime background darkened. Checked reference foreground/background pairs exceed 4.5:1. This is not an exhaustive automated accessibility certification of gradients/translucency.
- Links, selects, summaries and interactive SVGs now have visible keyboard focus; Guide has a 44px target. Glow accepts Enter/Space. Drawing already offers an Add line alternative, sand accepts Enter/Space, and water is a keyboard button.
- Final Wind down step now allows Previous; completed routines offer Start a new wind down.
- Privacy copy now distinguishes local AI from opt-in OpenAI voice.
- Entry focus no longer scrolls the brand/settings off-screen. Conversation mode controls stop sticking over an open drawing. Cancelling a local reply exposes preparation controls and explains that words remain.

## Browser evidence
In-app desktop browser; viewport overrides are layout checks, not physical-device tests.
- 390×844: entry, Home circles, Voice/Chat, demo send/busy state, transcript continuity through grounding, all Moments routes, drawing add/clear, water keyboard ripple, cat treat/feed, bubbles toggle/reset/retention, Glow colour/clear, sand keyboard/clean. Body/listening/fingertip steps including end/back/restart; shoulder cue and feedback exits.
- 320×568: Home, Chat, inline drawing and colour/action controls, Settings groups, soundscapes, mute/volume, English voice selection/preview, avatar, movement/haptics, palette and creation preferences. Privacy/reset flow exercised. No horizontal overflow in sampled screens; measured visible enabled/disabled controls meet 44px minimum after fixes. Long tools/dialogs intentionally scroll.
- 1440×900: split Home and three circles, full Wind down including new back/restart, Qwen cached preparation, active-provider reselection, real generated reply, transcript/draft continuity across navigation, cancellation.
- 768×1024: Moments grid and Talk; no horizontal overflow or measured undersized controls.
- Console: no warning/error entries observed in the audit tab.
- Screenshots: `qa-winddown-desktop.png`, `qa-mobile-drawing.png`.

## Automated checks
All 20 existing `scripts/check-*.mjs` scripts pass. Coverage includes protocol validation, bounded model context/artifacts, recognition turns, voice lifecycle, local TTS cancellation, backend auth/quota/mock sessions, breathing timing, sounds, haptics, entry/carousel motion, model asset and production PWA cache. `npm run build -- --base=/Happy-Mind/` passes. Vite reports existing large AI/Three.js bundle warnings.

## Still requires external/device verification
- Installed iOS/Android PWA: microphone permissions, speech recognition/end-of-turn, real mic → Qwen → Heart latency and memory, playback interruption, mobile keyboard/safe areas and vibration support. Desktop model success does not prove phone performance.
- Fresh-install/update/offline/evicted-cache behavior on actual phones. Model downloads are optional and browser-managed; offline speech is not guaranteed until assets are cached.
- Optional OpenAI backend deployment/key/access code and a real paid session are not configured or exercised. Mock tests made no provider calls.
- Published GitHub build and production checks: this work is local; nothing was pushed or deployed.
- Kokoro's Node-only transitive dependency advisories remain documented in LOCAL_VOICE.md; browser uses WASM. Revisit upstream before server-side use.

No claim that every browser/device or every possible interaction combination is bug-free.

## 22 October — narrated/offline support
Added 11 bundled Heart guide WAVs and explicit guide controls in Breathe/Notice; Talk has an immediate scripted grounding sequence independent of Qwen readiness. Guide tests cover phase clip duration/headroom, ducking, pause/interruption/hidden-page lifecycle and stale error suppression. Optional local English microphone uses Whisper Tiny q8/WASM with bounded 30-second Record/Finish turns, draft insertion in Chat and explicit submission in Voice. Recordings remain in memory. Persistent-storage request is optional.

23/23 check scripts and production build pass. Service-worker tests simulate loss of network for all 11 guides, app shell and downloaded ONNX runtime; API responses are excluded from runtime caching. Real Whisper CPU inference correctly transcribed a bundled Heart cue. Browser WASM model preparation reached “English microphone ready”; guide controls worked before preparing Qwen, with no observed console warnings/errors or 390px overflow. Screenshot: spoken-grounding-guide.png.

Physical microphone capture, real phone latency and airplane-mode installed-PWA end-to-end remain unverified. Initial online preparation and retained model/runtime caches are required for full local conversation. No claim of first-run or eviction-proof offline AI. No paid API calls or deployment.

## 22 October — control visual refinement
Added `controls.css` as the final shared control finish: plum primary, light glass secondary, consistent chips, restrained highlights/depth, quieter navigation and smaller explicit focus ring. Guide actions now have distinct Listen/Next/icon Stop roles. Mode controls no longer stick over subtitles on short screens. Maintains readable labels, 44px targets and reduced-motion handling.

Production build and updated PWA cache checks pass. Browser views checked: 390px Talk/Breathe/Settings, 320px Talk and 1440px Moments; no sampled horizontal overflow or sub-44px visible buttons. Mobile screenshots: premium-talk-mobile.png and premium-breathe-mobile.png. Visual direction documented in UIUXVisions.md. Changes local only.

## 22 October — icon, swipe and local-only choices
Talk/Chat share a rounded thin-line speech silhouette; Talk has a flowing inner stroke. Replaced the pointer polyline/ring with an eased, tapered ribbon and sparse light particles. Bounded 28 samples/380ms lifetime; RAF stops after release and on unmount; Less movement/reduced motion disables it. Swipe ribbon unit checks, existing carousel checks, production build and PWA cache check pass. Browser pointer drag moved Home's carousel from Talk to Breathe, and provider options showed only Demo/Local AI. OpenAI UI/import and cloud disclosure removed; legacy backend files are retained but not wired into the app. Screenshots: refined-talk-icon.png, local-only-companion-options.png.

## 22 October — automatic local-model onboarding and updates
Removed demo messages/replies/provider settings. Retained general Sound/Appearance/Companion/Privacy settings. First entry probes WebLLM's actual cache: uncached/denied cache asks consent for ~1GB model; cached model warms without install buttons. Startup errors and cancelled generation expose recovery only. Browser verified uncached origin prompted (no download started), Not now preserved Settings, cached origin auto-loaded to ready with empty Chat and no provider chooser. Screenshots: model-first-open.png, local-only-chat.png.

Live server check at request time served index-CWqhUGom.js / index-ChKOUF8R.css and SW v39; these new changes are local v40. Previous cache-first navigation could retain old shell until all old clients closed. v40 uses network-first online navigation/offline cached fallback and explicit update/restart banner; restart warns that conversation memory clears. Startup cache-policy tests and SW refreshed-shell/offline/SKIP_WAITING tests pass. Production build passes. Actual hosted update transition awaits upload/deployment; no forced reload of active conversations.
