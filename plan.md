Goal: modernize button styling without losing readability/accessibility.
Scope: shared control hierarchy, guide actions, selectors, focus/hover/pressed/disabled states; preserve navigation and behavior.
Approach: one focused final stylesheet for control tokens; plum primary, soft glass secondary, selected chips and restrained focus halo. Improve guide action grouping with icons.
Risks: conflicting legacy specificity, narrow-screen wrapping and bedtime contrast.
Verification: production build; phone/desktop screenshots of Talk, Breathe, tools and Settings; minimum-target/overflow checks.

Result: shared control finish and guide hierarchy implemented; production build/PWA cache check pass. Mobile and desktop browser inspection completed; screenshots in docs/.

Follow-up: refined Talk/Chat icons and smooth swipe ribbon; removed OpenAI provider choice. Build/PWA/carousel/ribbon checks pass; browser swipe and local-only choices verified.
