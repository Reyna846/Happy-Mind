# Local voice response diagnosis
- Goal: prepared PWA voice must submit and show replies, with useful progress/failure states.
- Evidence: real desktop model preparation and structured typed reply succeeded. User reports large Let’s talk reaches Taking a moment, isolating generation path; exact phone hardware unknown.
- Approach: local Voice uses short plain-text generation (120 output tokens, compact prompt, streamed captions) instead of nested JSON/action grammar. Chat keeps structured actions. Retain prepared engine on background; fix single-mic auto-send, duplicate-interim timeout and explicit Finish & reply fallback. Distinct download/GPU/timeout/reply messages.
- Verification: dictation exactly-once/error/Chat-draft tests, VoiceLoop stable-interim/manual-finish regressions, status tests, build and real local generation. Physical PWA voice/audio remains open.

- Result: real desktop simplified local Voice response/subtitles succeeded, as did original structured typed generation. Actual installed PWA mic/TTS not reproducible here. Changes local; installed deployment needs update.
