# Local spoken replies

Qwen creates text. Optional Kokoro 82M speaks that text using `af_heart`, English, speed 0.9. Settings → Sound → Spoken replies → Heart → Prepare Heart → Preview Heart. Device voice remains the default and fallback before preparation. No API key or usage fees. This does not change OpenAI Realtime voices.

Model: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
Library: https://github.com/hexgrad/kokoro/tree/main/kokoro.js
Weights/library Apache-2.0. Voice character is subjective; preview before choosing.

The optional download includes q8 model, tokenizer, voice and WASM runtime (over 100 MB combined). Initial preparation needs internet; cached assets are browser-managed and may be evicted. Reload requires Prepare again to load the cached model into memory. CPU/WASM runs in a worker, leaving WebGPU to Qwen. Mobile latency/memory and installed-PWA playback still require physical-device checks.

No conversation is sent to a TTS server. Browser dictation and device speech have separate provider privacy behavior. Mute, volume, settings close, navigation, interruption and hidden pages invalidate pending audio/playback. A synthesis failure leaves readable subtitles and explains how to use device speech.

`node scripts/check-local-voice.mjs` covers preparation, delayed audio cancellation, playback/end, interruption and worker reset. Production build uses the GitHub Pages base path.

Dependency audit: kokoro-js brings Node-only sharp/onnxruntime-node dependencies with 7 reported transitive advisory entries. The browser build externalizes Node APIs and uses WASM, not those Node runtimes; these dependencies should not be used to process untrusted server content. Revisit upstream fixes before introducing server TTS.

## Immediate guides and local microphone
Breathe: enable Voice guide, then Begin. Notice: enable Voice guide and choose Colour/Touch/Sound. Talk: expand A spoken grounding moment; Listen/Next/Stop work while Qwen prepares. These are bundled scripted Heart WAVs, not live AI output. Breathing phase clips fit four-second phases; alternate-nostril cues name the person's left/right. Guides stop on pause, settings, navigation, mute, hide and interruption; ambience softens while they speak.

Settings → Sound → Microphone → Local English → Prepare local microphone loads `Xenova/whisper-tiny.en` q8/WASM. Voice uses explicit Record/Finish turns; Chat inserts an editable draft. Maximum 30 seconds; no automatic re-listening. Recordings stay in memory, are never uploaded and are discarded after transcription/cancellation. The browser-recognition option remains available and may need internet. Mic permission and MediaRecorder/audio decoding support are required.

For offline use: open the production PWA online first; prepare Qwen, Heart (including warm-up voice files) and Local English. The service worker caches bundled guides, downloaded application chunks and the specific Transformers 3.8.1 ONNX runtime files. Model libraries maintain their own model caches. Keep downloads requests persistent browser storage; browsers can refuse, users can clear it. Reopen and test with airplane mode before relying on it. First-run without downloads is not a supported fully offline AI scenario. Packaged guides need no model download beyond the app installation.

Verification: 11 WAVs pass duration/finite/peak checks, all phase clips <3.5s; worker client tests cover preparation/cancellation; real Whisper q8 CPU inference accurately transcribed the scripted Heart look cue. Physical mic and installed-PWA offline end-to-end remain unverified.
