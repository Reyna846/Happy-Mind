# Room art additions
Original code-authored SVG/CSS assets, no external visual dependencies or raster generation.
- `CatCompanion.tsx`: 360x310 cream/lilac cat. Rounded silhouette, shaded fur, independent head/body/tail/eyes/hearts. Idle, scratch and settled states. Scratch input is pointer-captured with keyboard button equivalent. Global reduced motion retains static affectionate face/heart feedback. Synthetic low filtered noise and 26 Hz amplitude-modulated rumble, faded on exit; no recording claimed.
- `WaterPond.tsx`: 400x330 blue water composition, sky reflections, tiled caustic strokes, reflected sky and water hues. Decorative, no pointer interception. Existing interaction rings sit above it. No centre text.
- `RoomCreations.tsx`: bounded, session-only garden/stars/feeling compositions; authored SVG primitives varied by title, model-provided plain-text captions and palette. No executable generated assets.
Local visual review required before any publication; no deployment authorized.

## Refinements
Car replaces the Cat tab label/icon; synthetic formant meow requests a treat, feeding produces thank-you/hearts/purr. Captions are short playful feedback. Glow replaces the orbit track with a bounded, touch-painted light garden; sand's Add button is removed, with an Enter/Space drawing alternative retained on the surface. Water is now a larger rounded rectangular surface with hues/reflections and no lily pad, reeds or bank props. Home uses circular choices and a layered SVG wave transition. Wind down uses an original shaded moon. All added ambient motion obeys reduced motion.

Wind-down guidance: https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/how-to-fall-asleep-faster-and-sleep-better/ and https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/tackling-your-worries/ . Short optional thought listing and settling cues, not a sleep treatment or promise. Notes are cleared by Let go and never saved.
Browser speech inventory/updates: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event . Installed voice availability and subjective quality vary; Samantha was present in desktop QA.

## Interactive Home sculpture
`MindSculpture.tsx`: original procedural Three.js 0.186.1 meshes, not a raster or imported model. Two layers of rounded white petals fold inward as overlapping brain hemispheres emerge; surface-projected curved grooves and a short stem define the stylized brain. Soft hemisphere/key/rim lights; no texture downloads. Shared yaw/pitch, pointer capture, gentle release damping, keyboard arrows/Space/Home, two form controls and reset. Automatic transition pauses after direct interaction; reset resumes it. Reduced motion permits direct manipulation but disables automatic/inertial/idle motion. Lazy 3D chunk is about 137KB gzipped; SVG entry art stays independent. Renderer size/DPR are bounded, pauses offscreen/hidden and disposes resources on exit. Failed WebGL uses the existing CSS/SVG art; module-load failure also preserves the home screen.

## Living room navigation and companion
Original procedural SVG flower, waves and orbital glow in `CompanionMark.tsx`; no external assets or faces. Carousel trails and room-entry ripples use CSS/SVG and pointer coordinates. Hearing feedback uses a local microphone analyser without audio output; tracks/context stop on hidden/unmount/end of listening. Motion preferences suppress ambient motion and trails.

## Soft rituals
Brain geometry uses reduced surface displacement, a blush-pink PBR material and lower-contrast grooves; white flower retained. Release drag coasts with exponential damping and a small damped spring bounce. Wind-down crescent/craters/stars are original inline SVG/CSS, no external assets. Motion preferences disable idle bounce/drift and breathing scale motion; phase/count text remains available.

## Material polish
Brain now uses distinct hemispheres with irregular raised winding gyri and lower cerebellar forms; original procedural geometry, stylized rather than a clinical model. Sand uses warm gradients, deterministic SVG fractal grain, ridge/groove strokes and a clipping sweep. Water pointer trails only affect local rings and reflection offset. Original treat-cookie and cat/play icons; no added external assets.

## Rebuilt moon and imported brain
Rejected procedural brain replaced with local `models/brain-anatomy.glb`: Innerscene CC0 brain with cerebral/cerebellar hemispheres, brainstem and embedded metadata. Source/license recorded in `public/models/CREDITS.md`. Optimized to 315KB by removing unused colour textures; all 7,353 vertices retained; local fetch is abortable, textures/geometry disposed including late completion. Retains real 3D dragging and pink tint.
Moon: generated original transparent five-expression strip in `art/moon/sleepy-moon-strip.png` (awake, drowsy, yawn, sleep, deeper sleep). CSS frame windows preserve alignment, crossfade rather than morph tiny line paths, slow drift per stage; reduced motion uses static expressions. Generated via built-in imagegen, not a third-party image.
