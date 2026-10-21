Goal: local-only onboarding without provider settings, and reliable PWA update visibility.
Scope: remove demo samples/provider chooser; inspect actual WebLLM cache, prompt once on first entry when missing, initialize cached models automatically; repair stale navigation/update UX. Global-settings scope pending user clarification.
Approach: explicit download consent, no localStorage installed flag, empty transcript; cached warm-up without install buttons; retry only on failure. Network-first online navigation and explicit update/restart notice preserve current conversations until approval.
Risks: cache eviction/incomplete files, unsupported WebGPU, reload clears in-memory words. No automatic model download or destructive automatic reload.
Verification: cache-detection tests, SW online/offline/update tests, build and browser cached path + provider-free screens.

Result: both uncached and cached startup verified in browser; demo/provider controls removed; general Settings retained. Build/cache/startup tests pass. Live remains previous upload until src/public changes are uploaded and deployed.
