# Happy Mind

A phone-first, installable calm space. Original SVG scenery inspired by Tide's quiet pacing. React + TypeScript + Vite.

## Run

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The production preview registers a service worker; development does not. Words are in React memory only. Sound and reduced-motion preferences persist locally. Dictation uses browser SpeechRecognition when available, which may send audio to the browser vendor. Microphone starts only after a tap and stops on mode exit/page hide. Permission denial and unsupported browsers allow typing.

## GitHub Pages

Create a GitHub repository, push this source to its `main` branch, and set Settings → Pages → Source to GitHub Actions. The included workflow builds with the repository base path and deploys `dist`. No deployment has been performed yet. A custom domain or root user site needs the workflow base adjusted to `/`. HTTPS is required for installation and microphone access outside localhost.

The first production visit caches the shell and built JS/CSS for offline use. Tools work offline; speech recognition may require a connection. Close/reopen the app to activate an updated service worker. Increment the cache version in `public/sw.js` when releasing changes. Installation varies by platform; iOS uses Share → Add to Home Screen. Real-device installation, microphone, and audio checks are still required.

## Free personal AI

Talk offers an explicit on-device model download using WebLLM and Llama 3.2 1B. No account, API key, cloud AI bill, or separate backend is required for this option. Model/runtime files are downloaded from their hosts and may remain browser-cached; words are kept in memory and processed by the local model. Device compatibility, storage, and initial download are material requirements. A small model is less capable than GPT. An earlier Qwen model completed a local generation and drawing-module handoff in the desktop in-app browser; phone inference remains unverified. No silent cloud fallback is used.

The local runtime prompt is in `src/local-ai.ts`; keep it aligned with `docs/AGENT_BEHAVIOR.md`. Context is bounded; loading and generation can be cancelled. Switching rooms cancels active work; page hide terminates the worker. Clear words resets chat state. Spoken replies use browser speech synthesis, which may involve vendor servers. Voice and Chat share a conversation. Voice has a speaking circle, subtitles, browser dictation turns and read-aloud; full-duplex streaming is not implemented.

Atmosphere follows conservative local word cues after 1.4 seconds without typing; it does not diagnose emotions. A manual mood selection disables automatic adaptation. Reduced motion disables the new landscape animations. Mood can adapt without loading AI, including in Flow, with no text sent externally.

Optional future cloud integration requires server-only keys and explicit opt-in; do not put keys in the PWA. Free cloud tiers have quotas and privacy tradeoffs. They are not configured here.

## Verification

`npm run build -- --base=/Happy-Mind/` passes. Preview that build with `npm run preview -- --base=/Happy-Mind/`. `node scripts/check-pwa.mjs` checks manifest assets and service-worker cache behavior against the built output. Browser interaction and responsive checks passed; the in-app browser's offline reload did not render, so offline operation is not yet verified on a supported physical device.

Latest checks: `node scripts/check-mood.mjs` tests word cues, negation and neutral text. Production build and PWA resource checks pass. Browser tested live mood switching/hold, local model preparation/cancel and manual/reduced-motion controls. Actual AI responses and read-aloud still need device validation.

## Modular chat

See `docs/CHAT_INTERFACE.md` for voice lifecycle, inline drawing/breathing/grounding/release modules, the validated AI reply/action contract, and verification boundaries. Run `node scripts/check-chat.mjs` for action/timing/context regression checks. Activities work before loading AI. The circle tracks speech synthesis events, and a subtitle card remains visible even when sound is muted.

Modular-chat QA: real Qwen 1.5B reply → validated warm palette + drawing suggestion → inline drawing passed. Browser checks also covered speech start events, subtitles/global mute, shared drafts, pointer drawing, breathing phase/pause, grounding and release prompts, and 320/390px layouts. This does not verify physical microphone capture, audible output quality, clinical benefit, or hosted/offline behavior.

## Experience upgrade

See `docs/EXPERIENCE_UPGRADES.md` for session-aware adaptation, seven registered activities, the flower/brain animation, credited rain/water recordings, and hands-free turn-taking. Run `node scripts/check-upgrades.mjs`. Conversation persistence remains intentionally absent. Deployment is deferred by request. Full-duplex all-browser voice is not provided by this free browser speech stack.
