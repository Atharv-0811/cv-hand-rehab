Listed directory physio-cv-poc
Listed directory src
Listed directory public
Viewed package.json:1-33
Listed directory app
Listed directory components
Listed directory context
Listed directory hooks
Listed directory utils
Listed directory exercises
Viewed useHandTracking.ts:1-111
Viewed HandOpenClose.tsx:1-149
Viewed cv-processor.js:1-50
Viewed useAudioEngine.ts:1-94
Viewed CameraMirror.tsx:1-57

```markdown
# Physio-CV: Architecture & Context

## 1. Project Overview & Tech Stack
**Project Description**: Zero-latency browser-based telerehabilitation using MediaPipe for computer vision tracking and the Web Audio API for continuous biofeedback.

**Core Dependencies**:
- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **Tailwind CSS**: v4
- **@mediapipe/hands**: v0.4.1675469240 (CV modeling)
- **Web Audio API / AudioWorklets**: Native browser implementation for DSP.
- **TensorFlow.js Core/WebGL**: v4.22.0 (Underlying backend for Mediapipe arrays).

## 2. File Tree & Component Hierarchy
```text
/
├── public/
│   ├── loop.mp3            # Native audio source for biofeedback
│   └── cv-processor.js     # AudioWorkletProcessor script (DSP Engine)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Global app layout
│   │   └── page.tsx        # Next.js entrypoint route
│   ├── components/
│   │   ├── CameraMirror.tsx               # Renders & flips standard <video> and handles permissions securely
│   │   └── exercises/HandOpenClose.tsx    # Core exercise feature, clinical clinical flow & UI metrics
│   ├── context/
│   │   └── SessionContext.tsx             # Context for app navigation (e.g. Menu vs. Exercises)
│   ├── hooks/
│   │   ├── useAudioEngine.ts              # Web Audio Graph configuration, AudioNode routing
│   │   ├── useHandTracking.ts             # Mediapipe bootstrapping & 3D computational geometry
│   │   └── usePoseDetection.ts            # Pose detection pipeline
│   └── utils/
│       └── smoothing.ts                   # Math utilities for signal stabilization
```

### Component Responsibilities:
- **`useHandTracking.ts`**: Runs the mathematical heavy lifting for MediaPipe. Manages temporal tracking, 3D vector length filtering, and Progressive Overload state generation.
- **`useAudioEngine.ts`**: Safely builds and connects the Audio Nodes and handles play/suspension states strictly across the hardware permission barriers.
- **`HandOpenClose.tsx`**: Orchestrates the overarching state machine of the exercise, passing UI callbacks to hardware boundaries, rendering clinical telemetry dashboards, and handling "Level Up" transitions visually.
- **`cv-processor.js`**: Runs off the main Javascript thread in an AudioWorklet entirely dedicated to mapping float inputs (0-1) to logarithmic filters at exact sample rates without jank.

## 3. State Machines & Data Flow
### The Clinical Flow (`HandOpenClose.tsx`)
The exercise undergoes a strict progression through an `exerciseState` variable of type `ExerciseState` (`IDLE` -> `CALIBRATION` -> `RUNNING`).

1. **`IDLE`**: Awaiting initialization. Hardware is asleep. Audio has not been retrieved.
2. **`CALIBRATION`**: `handleInitHardware()` invoked. Camera streams open via `CameraMirror`, and Web Audio context fetches and decodes the audio in the background (`initAudio()`), but playback is forcefully suspended to prevent unprompted noise. The user stretches their hand open.
3. **`RUNNING`**: User clicks "Lock Baseline". The `setBaseline(currentRatio)` is fired, and `playAudio()` resumes the Audio Context. The session operates and audio mapping becomes live against the newly calibrated metric goalpost (`sessionTarget`).
4. **Exit/Menu** (PRACTICE implicitly): Hitting "End Session" stops hardware bounds immediately via `pauseAudio()` and moves to a menu mode via SessionContext `setActiveExercise('MENU')`.

### The Data Pipeline
1. **Webcam**: Raw frames fed from `<video>` element on `requestAnimationFrame` polling rate.
2. **MediaPipe**: Uses `handsModel.send({ image })` to locate vectors.
3. **3D Vector Math**: Evaluates palm width (Landmark 0 to 9) vs. extension (Landmark 0 to 12). Maps a `rawRatio`.
4. **Moving Median Filter**: Runs over the last 3 captures into `medianHistory` and then via a moving average into `smoothHistory`. Outputs `smoothedRatio`.
5. **React State (`useHandTracking`)**: Normalizes `smoothedRatio` to `controlValue` bound between `[0.0, 1.0]`.
6. **PostMessage**: `useEffect` passing `controlValue` to `updateFilter()` which `postMessage({type: 'SET_RATIO'})` to the AudioWorklet.
7. **AudioWorklet (`cv-processor.js`)**: Modifies frequency responses parameter array instantly.
8. **Dual Biquad Filters**: Signals audibly alter.

### Progressive Overload Logic
The ratio calculates audio against today's `sessionTarget` rather than all time limits.
- The `sessionTarget` equals `baseline * 1.05`.
- If a user pushes `smoothedRatio > sessionTarget`, the target updates automatically: `setSessionTarget(smoothedRatio * 1.05)`.
- If `smoothedRatio > allTimeBest`, it persists to `localStorage` as `physio_pb_hand_extension` and temporarily sets `hasLeveledUp` to `true` (3000ms delay) to pop the Level Up aesthetic banner.

## 4. Digital Signal Processing (DSP) Engine

### Within `public/cv-processor.js`
Uses independent thread math to avoid React re-render lag.
- **Slew Rate Limiting**: Ensures the audio sweep does NOT snap instantaneously, preventing auditory clicks. It limits the float changes by `maxRise` (`0.0001`) and `maxFall` (`0.00005`).
- **Watchdog Decay Envelope**: When tracking is lost (`isTracked = false`), smoothly decays the target ratio to 0 using `lostDecay` (`0.00002`).
- **Frequency Mapping**: Uses logarithmic/exponential tuning mapping:
  - LowPass (LPF) maps upward from 2000Hz -> 20000Hz `(2000 * Math.pow(10, currentRatio))`.
  - HighPass (HPF) maps downward from 1000Hz -> 20Hz `(1000 * Math.pow(0.02, currentRatio))`.

### Web Audio Graph (`useAudioEngine.ts`)
- **BufferSource**: `sourceNode` playing `loop.mp3`.
- **WaveShaper (Saturation)**: `makeDistortionCurve(10)` creates a soft harmonic distortion allowing lower frequencies to remain warm. Set to `2x` oversample.
- **HighPass Biquad (`hpfNode`)**: Modulated by `cvNode.current` Output 1.
- **LowPass Biquad (`lpfNode`)**: Modulated by `cvNode.current` Output 0.
- **Gain (`gainNode`)**: Static 0.8 volume buffer layer connected to `destination`.

## 5. UI/UX Design System Constraints (STRICT)

**System Identity**: "Clinical Zinc" Design System.
When styling new components, adhere *strictly* to the following design laws:

1. **Monochrome Zinc Focus**: No bright primary colors. Backgrounds use `bg-zinc-900`, borders use `bg-zinc-800`, text uses `text-zinc-100`/`text-zinc-300`/`text-zinc-400`.
2. **Minimalist Shapes**: ONLY use slightly rounded corners (`rounded-md` which maps to ~6px). Do not use pill shapes or large border radiuses (`rounded-xl` or `rounded-full`).
3. **No Gradients**: Elements must utilize flat colors or extremely sheer opacity overlays. Avoid gradient text or gradient buttons completely.
4. **Semantic Color Highlighting Only**: Bright primary colors are reserved exclusively for critical hardware/telemetry status metrics.
   - *Hardware Warnings/Dropouts*: `bg-red-950/50` borders with `border-red-900` text to indicate permission denied, or amber outlines (`border-amber-900`) and amber text when tracking drops "Status: Awaiting Subject".
   - *Target Hits/Level Ups*: `text-emerald-500` or `text-emerald-600` specifically on new records (Level up banner), combined with `bg-zinc-100` inverted bright blocks.
5. **Typography & Structure**: Use uppercase monospacing or strict `tracking-widest` spacing for clinical readouts (`font-mono`). Keep borders crisp (`border-b border-zinc-800`).

## 6. Edge Cases Handled

The baseline handles a few vital mechanical workarounds to stabilize latency and react lifecycle errors:
- **`CameraMirror` Seizure Flicker**: Uses an explicitly empty dependency array (`[]`) accompanied by `useRef` `isInitialized.current` check to safely bootstrap `navigator.mediaDevices.getUserMedia` once without allowing Next.js strict mode / fast refresh lifecycle glitches to recursively kill and reopen the stream buffer loop.
- **3D Euclidean Math Depth Mapping**: Uses `Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z)` to compute relative distance tracking including the `.z` property explicitly, solving 2d plane-rotational distortions naturally apparent when a patient twists their wrist slightly off-axis from the 2D lens plane.
- **Audio Context Permission Autoplay**: Ensures the AudioEngine performs an `await audioCtx.current.suspend()` immediately after context instantiation. Browsers heavily penalize auto-playing buffers that happen outside direct user input (click handlers). Pausing lets decoding happen on `handleInitHardware`, but the noise plays correctly on `handleLockBaseline`.
```

I will also give a summary of the project in next prompt please wait