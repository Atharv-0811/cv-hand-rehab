"use client";

import { useRef, useState, useEffect } from "react";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { CameraMirror } from "@/components/CameraMirror";
import { StretchIndicator } from "@/components/exercises/StretchIndicator";
import { useSession } from "@/context/SessionContext";
import { ExerciseLayout, ExerciseState } from "./ExerciseLayout";
import { useGamificationContext } from "@/context/GamificationContext";

import HandCanvas from "@/components/ar/HandCanvas";
import ProgressFace from "@/components/ar/ProgressFace";
import { Landmark } from "@/types/hands";

export default function HandOpenClose() {
  const { addXP } = useGamificationContext();
  const { setActiveExercise } = useSession();

  const videoRef = useRef<HTMLVideoElement>(null);
  const prevTargetRef = useRef<number | null>(null);

  const [exerciseState, setExerciseState] = useState<ExerciseState>("IDLE");
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);

  // AR STATE
  const [ghostLandmarks, setGhostLandmarks] = useState<Landmark[] | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);

  /* -------------------------------------------------- */
  /* 🔥 CRITICAL FIX — tracking must run in calibration */
  /* -------------------------------------------------- */
  const isTrackingEnabled =
    exerciseState === "CALIBRATION" || exerciseState === "RUNNING";

  const isRunning = exerciseState === "RUNNING";

  /* HAND TRACKING */
  const {
    controlValue,
    currentRatio,
    isTracked,
    allTimeBest,
    sessionTarget,
    setBaseline,
    landmarks,
  } = useHandTracking(videoRef, isTrackingEnabled);

  /* AR PROGRESS ONLY AFTER CALIBRATION */
  const arProgress = isCalibrated && isTracked ? currentRatio : 0;

  /* AUDIO ENGINE */
  const {
    initAudio,
    playAudio,
    pauseAudio,
    updateFilter,
    setTrackingStatus,
    stopAudio,
    isAudioLoaded,
  } = useAudioEngine();

  useEffect(() => {
    if (!isRunning || !isAudioLoaded) return;
    setTrackingStatus(isTracked);
    updateFilter(controlValue);
  }, [controlValue, isTracked, isRunning, isAudioLoaded]);

  useEffect(() => {
    if (!isRunning || sessionTarget === null) return;

    if (prevTargetRef.current === null) {
      prevTargetRef.current = sessionTarget;
      return;
    }

    if (sessionTarget > prevTargetRef.current) {
      addXP(15);
      prevTargetRef.current = sessionTarget;
    }
  }, [sessionTarget, isRunning, addXP]);

  /* INIT HARDWARE */
  const handleInitHardware = async () => {
    setExerciseState("INITIALIZING");
    await initAudio();
    setExerciseState("CALIBRATION");
  };

  /* 🔥 LOCK BASELINE (NOW WORKS) */
  const handleLockBaseline = () => {
    if (!landmarks) return; // guard restored

    if (!isCalibrated) {
      setGhostLandmarks(structuredClone(landmarks));
      setIsCalibrated(true);
    }

    setBaseline(currentRatio);
    setExerciseState("RUNNING");
    playAudio();
  };

  const handleExit = () => {
    pauseAudio();
    stopAudio();
    setExerciseState("IDLE");
    setActiveExercise("MENU");
  };

  return (
    <ExerciseLayout
      title="Hand Extension Test"
      exerciseState={exerciseState}
      onInitHardware={handleInitHardware}
      onExit={handleExit}
      leftPanel={
        <>
          <div className="relative w-full h-full">
            <CameraMirror
              videoRef={videoRef}
              onReady={() => setIsCamReady(true)}
              onError={(err) => setCamError(err)}
            />

            <HandCanvas
              videoRef={videoRef}
              landmarks={landmarks}
              progress={arProgress}
              showLiveHand={isRunning}
              showGhostHand={isCalibrated}
              ghostLandmarks={ghostLandmarks}
            />

            <ProgressFace progress={arProgress} />
          </div>

          {camError && (
            <div className="bg-dangerRed-50 border border-dangerRed-200 text-dangerRed-700 p-4 rounded-md text-sm">
              {camError} Please check camera permissions and reload.
            </div>
          )}

          {exerciseState === "CALIBRATION" && !camError && (
            <div className="bg-white border border-carbonBlack-200 rounded-md p-5">
              <p className="text-sm text-carbonBlack-700 mb-5">
                <b>Calibration phase.</b> Stretch your hand fully open and hold.
                Click below to lock baseline.
              </p>

              <button
                onClick={handleLockBaseline}
                disabled={!isCamReady || !isTracked}
                className="w-full rounded-md bg-primary-500 text-white px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-40"
              >
                Lock Baseline & Begin Test
              </button>
            </div>
          )}

          {isRunning && (
            <button
              onClick={handleExit}
              className="w-full rounded-md bg-white text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 border border-carbonBlack-200"
            >
              End Session
            </button>
          )}
        </>
      }
      rightPanel={
        <>
          <div
            className={`px-4 py-3 rounded-md border text-sm font-medium flex items-center gap-2 ${
              isTracked
                ? "bg-successGreen-50 border-successGreen-200 text-successGreen-700"
                : "bg-dangerRed-50 border-dangerRed-200 text-dangerRed-700"
            }`}
          >
            {isTracked ? "Subject in frame" : "Awaiting subject"}
          </div>

          <div className="bg-white border border-carbonBlack-200 rounded-md p-5 flex flex-col gap-4">
            <div className="flex justify-between">
              <span>Current Extension</span>
              <span className="font-mono">{currentRatio.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Today's Target</span>
              <span className="font-mono">
                {sessionTarget ? sessionTarget.toFixed(2) : "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Audio Clarity</span>
              <span className="font-mono">
                {isRunning ? `${(controlValue * 100).toFixed(0)}%` : "Muted"}
              </span>
            </div>

            <div className="pt-4 border-t">
              <span className="text-[11px] uppercase tracking-widest font-semibold">
                All-Time Best
              </span>
              <span className="font-mono text-2xl text-primary-600 font-bold">
                {allTimeBest ? allTimeBest.toFixed(2) : "No data"}
              </span>
            </div>
          </div>

          {isRunning && sessionTarget !== null && (
            <div className="bg-white border border-carbonBlack-200 rounded-md p-5">
              <StretchIndicator
                currentRatio={currentRatio}
                sessionTarget={sessionTarget}
              />
            </div>
          )}
        </>
      }
    />
  );
}