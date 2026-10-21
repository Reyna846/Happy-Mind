# OpenAI realtime voice

Implemented as an optional provider under Talk → Companion options → OpenAI voice. This uses the OpenAI API, not a ChatGPT subscription. No paid call has been tested or enabled. Default configuration is disabled.

## Configuration
Frontend remains a static Vite/GitHub Pages app. Backend requires Node 22.12+ (Node 24 recommended), HTTPS in production and a persistent writable `.runtime` directory. Run ONE backend process; do not autoscale this file-based quota implementation.

Set server environment variables from `.env.example` in your hosting provider's secret settings. OPENAI_API_KEY is server-only. VOICE_ACCESS_CODE must be an independently generated private code of at least 24 characters, not your OpenAI key. APP_ORIGIN must exactly match the frontend origin (no path/trailing slash). Set VOICE_ENABLED=1 only after configuring API billing and limits. No credentials belong in a VITE_ variable; VITE_VOICE_SERVER_URL is a public HTTPS endpoint URL only. Never enter the API key into the app.

Local scripts: `npm run voice:server`; Vite proxies `/api/voice` to port8787. Production frontend requires VITE_VOICE_SERVER_URL at build time. GitHub Pages cannot host the backend. Host binding defaults to127.0.0.1; hosted containers typically need HOST=0.0.0.0.

## Controls and limitations
Backend validates origin and private access code, limits request size, fixes session configuration, loads behavioral portions of agent.md as session instructions and caps each response at512 output tokens. Defaults:3 session attempts per UTC day, one reserved session at a time,180 seconds per session; failed provider attempts also consume an allowance. Reservations persist across restart if the ledger volume persists. Corrupt/unwritable quota storage fails closed. No transcript, microphone audio or API key is logged or stored by this server.

The backend schedules a provider hangup and the client independently closes the peer/microphone at the time limit. Stopping/navigation/settings/mute/page hide also closes client resources. Server restart or failed hangup can defeat the server timer; the browser timer is not a billing guarantee. The session configuration can be changed by an authenticated browser peer. These controls reduce usage; they are NOT a hard dollar ceiling. Use a separate API project, provider-side restrictions, usage monitoring and limited prepaid credit with automatic recharge off where available. Do not expose an unlimited backend or rely on a dashboard alert alone. No automated paid retries.

Before connection the app requires opt-in to send microphone audio and up to8 recent non-example messages (500 characters each) to OpenAI. Transcripts append to the shared Talk/Chat history in memory. Reconnecting seeds bounded context; does not replay audio or start a greeting. Typed chat retains the Demo/Local AI engine; OpenAI selection here is voice-only. Existing validated visual/action tools are not connected to realtime voice yet.

## Verification
Mock provider tests cover configuration/auth/origin/quota/size guards without paid calls. Build and browser disabled-provider UI checked separately. Actual API negotiation, model access, microphone/audio, interruption, transcript ordering and billing must be tested with a configured private backend before release.

Official implementation: https://developers.openai.com/api/docs/guides/voice-webrtc
