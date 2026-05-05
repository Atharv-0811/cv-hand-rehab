# Physio-CV: Project Context & Architectural Guidelines

## 1. Project Overview & Mission
Physio-CV is a web-based, zero-latency telerehabilitation platform designed for clinical-grade hand and wrist therapy. 
The core innovation lies in its entirely **client-side architecture**: it utilizes WebAssembly-compiled **MediaPipe Hands** for real-time computer vision, directly pipelining the kinematic data into custom **Web Audio API** Digital Signal Processing (DSP) engines. This creates a zero-latency, gamified auditory biofeedback loop that guides patients through physical therapy exercises without any server-side processing delays.

---

## 2. Tech Stack & Strict UI/UX Guidelines

### Core Stack
*   **Framework:** Next.js (App Router), React, TypeScript.
*   **UI Library:** Mantine UI v7.
*   **Machine Learning:** `@mediapipe/hands` (WASM).
*   **Audio Engine:** Native Web Audio API (including `AudioWorklet` for DSP).

### STRICT DESIGN RULES (The "Clinical Zinc" Aesthetic)
Any future UI enhancements **must** strictly adhere to the following design constraints defined in `src/app/providers.tsx`:

*   **Vibe:** Minimalist, highly professional, clinical. Prioritize whitespace and clean typography.
*   **Forbidden Styles:** NO gradients, NO heavy drop shadows, NO visual clutter, NO default blue colors.
*   **Typography:** 
    *   Headings: `Poppins` (`--font-poppins`), fontWeight 600-700.
    *   Body/UI text: `Work Sans` (`--font-work-sans`), fontWeight 400-600.
*   **Border Radius:** Strict adherence to `var(--mantine-radius-md)` (subtle 4-8px rounding). Avoid fully rounded pill shapes unless it is a small badge.
*   **Custom Theme Colors (DO NOT USE MANTINE DEFAULTS):**
    *   `primary`: A muted, professional slate/indigo (`#a6b1e1` is the main shade).
    *   `carbonBlack`: The foundation for all text and borders (`#252422` is the main shade, use `.0` to `.2` for borders/backgrounds).
    *   `successGreen`: Used exclusively for "Tracked" or positive feedback (`#2CB962`).
    *   `dangerRed`: Used for anti-cheat warnings, errors, and lost tracking (`#DF3434`).
    *   `warningAmber`: Used for active UI states or secondary highlights (`#FFAE26`).

---

## 3. Core Architectural Patterns
These are the heavily optimized patterns that drive the zero-latency experience. **Do not refactor these without explicit cause.**

### The Frame Governor
React renders at 60 FPS, but running MediaPipe at 60 FPS melts client devices. We use a custom `requestAnimationFrame` governor to cap computer vision processing strictly at **15 FPS**:
```typescript
if (performance.now() - lastProcessTime >= 1000 / 15 && !isProcessing) {
  isProcessing = true;
  await handsModel.send({ image: videoRef.current });
}
```

### Thread Isolation (Audio DSP)
For continuous exercises (like Hand Extension), binding audio filter frequencies directly to the 15 FPS React state causes "zipper noise" (audible stepping). We utilize an `AudioWorkletNode` (`cv-processor.js`) running on a separate audio thread to interpolate CV data at the audio sample rate (44.1kHz), ensuring buttery-smooth filter sweeps.

### Spatial Math (Scale Invariance)
Users sit at varying distances from their webcams. To make physical thresholds scale-invariant, all spatial math is converted into a **2D Ratio** against the user's current Palm Length:
```typescript
let palmLength2D = calcDist2D(landmarks[PALM_BASE], landmarks[MIDDLE_BASE]);
let targetRatio = calcDist2D(thumbTip, indexTip) / palmLength2D;
```

### Hysteresis & Smoothing
*   **Sticky Pinch Hysteresis:** We use asymmetrical thresholds to prevent a pinch from rapidly toggling (flickering) due to camera noise. Example: The user must close their fingers tightly (`< 0.50` ratio) to *start* a pinch, but they can drift apart significantly (`< 1.2` ratio) while holding it before the engine considers it "dropped".
*   **Median Filtering:** To prevent sudden UI jumps when the CV model glitches for a single frame, we maintain a rolling history array (length 3 or 4) and output the mathematical average or median.

---

## 4. Component Architecture (The Layout System)

### `ExerciseLayout.tsx` (The Slot Pattern)
To ensure every exercise looks uniform, the complex MediaPipe state is decoupled from the UI layout. Exercises wrap their logic inside `<ExerciseLayout>`, injecting UI into two slots:
*   `leftPanel`: Contains the `CameraMirror`, SVG overlays, and instructional modals.
*   `rightPanel`: Contains the live telemetry, scores, and progress trackers.

### Standardized State Machine
Every exercise implements the exact same state progression:
1.  `IDLE`: Waiting for the user to initiate.
2.  `INITIALIZING`: Fetching the WebAssembly ML models and initializing the AudioContext.
3.  `CALIBRATION`: The camera is live, but the game has not started. Overlays display strict clinical instructions to the user.
4.  `RUNNING`: The main `requestAnimationFrame` loop is actively scoring the user.

### `CameraMirror.tsx`
A pure visual component that safely requests `getUserMedia`, applies a CSS `scaleX(-1)` to act as a mirror, and handles cross-browser initialization edge-cases.

---

## 5. Exercise Dictionary & Game Logic

### 1. Hand Extension (`HandOpenClose.tsx`)
*   **Physical Goal:** Stretch the hand open as wide as possible.
*   **Anti-Cheat / Progression:** Tracks the all-time personal best (`localStorage`). The "Today's Target" is set at 105% of their initial calibration stretch (Progressive Overload).
*   **Audio Feedback:** A continuous distorted loop crossfaded between a dry/wet signal, mapped to a Lowpass/Highpass biquad filter.

### 2. Sequential Pinch (`SequentialPinch.tsx`)
*   **Physical Goal:** Pinch the thumb to the Index, Middle, Ring, and Pinky sequentially.
*   **Anti-Cheat Logic:** The engine enforces a strict `RELEASE_THRESHOLD`. The user *must* open their hand completely (thumb far from all fingers) before the engine will allow the next pinch to score.
*   **Audio Feedback:** Discrete sine-wave oscillators triggered on a successful pinch (playing an ascending major scale).

### 3. AR Arpeggio Path (`ArpeggioPath.tsx`)
*   **Physical Goal:** Pinch a specific finger and drag it through the air along a defined SVG path.
*   **Progression Loop (4x4 Matrix):** Users must complete 4 consecutive paths (Reps) with a specific finger, then transition to the next finger. Completing all 4 fingers constitutes 1 Set. The session ends after 3 Sets.
*   **Anti-Cheat Logic:**
    1.  **Velocity Limit:** If `pixels/ms > 0.0015`, a "Slow Down!" warning fires.
    2.  **Wrong Finger Detection:** Verifies that adjacent fingers aren't being used to trick the 2D plane.
    3.  **Path Tolerance:** Uses vector projection (`distToSegment`) to calculate how far the cursor has strayed from the ideal path line. If tolerance is exceeded, the path resets to Node 0.

---

## 6. Known Missing Features / UI Polish TODOs
*   **Wrist Rotation:** The `/page.tsx` dashboard lists "Wrist Rotation" as an upcoming exercise. This module needs to be created.
*   **Audio Hook Refactoring:** While `HandOpenClose` uses the global `useAudioEngine.ts` hook, the newer `SequentialPinch` and `ArpeggioPath` modules instantiate their own localized `AudioContext` for discrete tones. These should ideally be unified or abstracted.
*   **Error Boundaries:** If webcam access is completely blocked at the OS level, the error state in `CameraMirror` could be polished with a more descriptive Mantine modal.

---

## 7. Recent Collaborator Updates (May 2026)

### Supabase Infrastructure & Authentication
*   **Dependencies:** `@supabase/ssr` and `@supabase/supabase-js` were added to the project.
*   **Database Utilities:** Added dedicated client, server, and middleware utilities (`src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`) for robust database and authentication routing.
*   **Authentication Flow:** Implemented route protection using Next.js middleware (`src/middleware.ts`) and created a dedicated login page (`src/app/login/page.tsx`) driven by server actions (`src/app/login/actions.ts`).

### Analytics Dashboard
*   **Visual Tracking:** Created an `AnalyticsDashboard.tsx` component to provide user data visualizations.
*   **Data Hook:** Added a custom `useUserAnalytics.ts` hook for querying user progress metrics from the database.

### Gamification & XP Refactoring
*   **Global Level System:** Replaced the generic `SessionContext` with a dedicated `GamificationContext.tsx`. Level XP is now tracked globally.
*   **Unified Banners:** Refactored `LevelBanner.tsx` into `GlobalCelebrationBanner.tsx` to handle cross-exercise level-ups and milestones.
*   **Exercise Updates:** Modified `ArpeggioPath.tsx`, `HandOpenClose.tsx`, and `SequentialPinch.tsx` to natively pipe XP completions into the new `GamificationContext`.

---

## 8. Confirmed Feature List
*(Note: Only verified and confirmed features are added to this list)*

**Core AR Tracking:**
- [x] Client-side MediaPipe Hands (15 FPS Frame Governor)
- [x] Web Audio API DSP synthesis (Continuous & Discrete oscillators)
- [x] Scale-invariant tracking logic (2D Ratios against Palm Length)

**Exercises:**
- [x] Hand Extension (Progressive Overload baseline tracking)
- [x] Sequential Pinch (Anti-cheat strict open-hand phase)
- [x] AR Arpeggio Path (4x4 Matrix, Velocity limits, Path tolerance)

**Gamification & Progress:**
- [x] Global Level System & XP Unified Context
- [x] Global Celebration Banners
- [x] Daily Streak Counter
- [x] Weekly Performance Graph & Analytics Dashboard

**Infrastructure & Core UI:**
- [x] Supabase Core Utilities (Client/Server/Middleware)
- [x] Email & Password Authentication (Login/Signup via Server Actions)
- [x] Google OAuth Provider Integration
- [x] Extracted Modular `Navbar` Component
- [x] Top-Nav Settings Dropdown with Server Action Sign-Out
- [x] Robust Camera Hardware Lifecycle Cleanup (MediaStream explicitly halted on unmount)
