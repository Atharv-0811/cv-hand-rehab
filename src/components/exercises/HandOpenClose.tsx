'use client';
import { useRef, useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CameraMirror } from '@/components/CameraMirror';
import { StretchIndicator } from '@/components/exercises/StretchIndicator';
import { useSession } from '@/context/SessionContext';

import { ExerciseTargetBanner } from './ExerciseTargetBanner';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/animations/loading.json';

type ExerciseState = 'IDLE' | 'INITIALIZING' | 'CALIBRATION' | 'RUNNING';

interface HandOpenCloseProps {
  onSessionComplete?: (xp: number) => void;
}

export default function HandOpenClose({ onSessionComplete }: HandOpenCloseProps) {
  const { setActiveExercise } = useSession();
  const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);
  const [hasAwardedXP, setHasAwardedXP] = useState(false);

  const [showTargetBanner, setShowTargetBanner] = useState(false);
  const prevTargetRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isTestRunning = exerciseState === 'RUNNING';

  const { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, setBaseline } = useHandTracking(videoRef, isTestRunning);
  const { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded } = useAudioEngine();

  useEffect(() => {
    if (exerciseState === 'RUNNING' && isAudioLoaded) {
      setTrackingStatus(isTracked);
      updateFilter(controlValue);
    }
  }, [controlValue, isTracked, exerciseState, isAudioLoaded, updateFilter, setTrackingStatus]);

  useEffect(() => {
    if (exerciseState !== 'RUNNING' || sessionTarget === null) return;

    if (prevTargetRef.current === null) {
      prevTargetRef.current = sessionTarget;
      return;
    }

    if (sessionTarget > prevTargetRef.current) {
      setShowTargetBanner(true);

      const timer = setTimeout(() => {
        setShowTargetBanner(false);
      }, 3000);

      prevTargetRef.current = sessionTarget;

      return () => clearTimeout(timer);
    }
  }, [sessionTarget, exerciseState]);

  const handleInitHardware = async () => {
    setExerciseState('INITIALIZING');
    await initAudio();
    setExerciseState('CALIBRATION');
  };

  const handleLockBaseline = () => {
    setBaseline(currentRatio);
    setExerciseState('RUNNING');
    setHasAwardedXP(false);
    playAudio();
  };

  const awardSessionXP = () => {
    if (hasAwardedXP || !onSessionComplete) return;
    const baseXP = 20;
    const targetHitBonus = sessionTarget !== null && currentRatio >= sessionTarget ? 15 : 0;
    onSessionComplete(baseXP + targetHitBonus);
    setHasAwardedXP(true);
  };

  const handleExit = () => {
    if (exerciseState === 'RUNNING') {
      awardSessionXP();
    }
    stopAudio();
    setExerciseState('IDLE');
    setActiveExercise('MENU');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full mx-auto relative">
      <ExerciseTargetBanner visible={showTargetBanner} newTarget={sessionTarget || 0} />

      {/* Page header */}
      <div className="flex justify-between w-full items-center border-b border-carbonBlack-100 pb-4 mb-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
            Hand Rehabilitation
          </span>
          <h2 className="text-2xl font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)] leading-tight">
            Hand Extension Test
          </h2>
        </div>
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-white border border-carbonBlack-200 text-carbonBlack-700 rounded-md hover:border-carbonBlack-300 hover:bg-carbonBlack-50 transition-colors text-sm font-medium font-[var(--font-work-sans)]"
        >
          Exit to Menu
        </button>
      </div>

      {/* IDLE state */}
      {exerciseState === 'IDLE' && (
        <div className="w-full max-w-lg mt-8">
          <div className="flex flex-col gap-1 mb-5">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              Step 1
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              Equipment Initialisation
            </h3>
          </div>
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-8">
            <p className="text-sm text-carbonBlack-600 leading-relaxed mb-8 font-[var(--font-work-sans)]">
              This module requires access to your webcam. Before continuing, please ensure your hand is visible and well-lit. No video is stored or transmitted.
            </p>
            <button
              onClick={handleInitHardware}
              className="w-full rounded-md bg-primary-500 text-white px-6 py-3 font-semibold hover:bg-primary-600 transition-colors text-sm font-[var(--font-work-sans)]"
            >
              Initialise Camera &amp; Audio
            </button>
          </div>
        </div>
      )}

      {/* INITIALIZING state */}
      {exerciseState === 'INITIALIZING' && (
        <div className="w-full max-w-lg mt-8">
          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-12 flex flex-col items-center justify-center gap-4">
            <Lottie animationData={loadingAnimation} loop={true} style={{ width: 120, height: 120 }} />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                Please Wait
              </span>
              <p className="font-mono text-sm text-carbonBlack-700 font-medium">
                Loading audio and vision models…
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CALIBRATION / RUNNING state */}
      {(exerciseState === 'CALIBRATION' || exerciseState === 'RUNNING') && (
        <div className="w-full flex flex-col gap-8">

          {/* Step label */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
              {exerciseState === 'CALIBRATION' ? 'Step 2' : 'Step 3'}
            </span>
            <h3 className="text-lg font-bold text-carbonBlack-900 tracking-[-0.02em] font-[var(--font-poppins)]">
              {exerciseState === 'CALIBRATION' ? 'Baseline Calibration' : 'Live Session'}
            </h3>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: camera + action */}
            <div className="flex-1 flex flex-col gap-4">
              <CameraMirror
                videoRef={videoRef}
                onReady={() => setIsCamReady(true)}
                onError={(err) => setCamError(err)}
              />

              {camError ? (
                <div className="bg-dangerRed-50 border border-dangerRed-200 text-dangerRed-700 p-4 rounded-md text-sm font-[var(--font-work-sans)] leading-relaxed">
                  {camError} Please check your browser permissions and try again.
                </div>
              ) : exerciseState === 'CALIBRATION' ? (
                <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5">
                  <p className="text-sm text-carbonBlack-700 leading-relaxed mb-5 font-[var(--font-work-sans)]">
                    <span className="font-semibold text-carbonBlack-900">Calibration phase.</span>{' '}
                    Stretch your hand open as wide as is comfortable and hold it. Audio is muted. When you are ready, click below to lock your baseline.
                  </p>
                  <button
                    onClick={handleLockBaseline}
                    disabled={!isCamReady || !isTracked}
                    className="w-full rounded-md bg-primary-500 text-white px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-[var(--font-work-sans)]"
                  >
                    Lock Baseline &amp; Begin Test
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    awardSessionXP();
                    pauseAudio();
                    stopAudio();
                    setExerciseState('IDLE');
                    setActiveExercise('MENU');
                  }}
                  className="w-full rounded-md bg-white text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 transition-colors border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-sm font-[var(--font-work-sans)]"
                >
                  End Session
                </button>
              )}
            </div>

            {/* Right: metrics panel */}
            <div className="w-full md:w-72 flex flex-col gap-4">

              {/* Tracking status */}
              <div
                className={`px-4 py-3 rounded-md border text-sm font-medium font-[var(--font-work-sans)] flex items-center gap-2 ${
                  isTracked
                    ? 'bg-successGreen-50 border-successGreen-200 text-successGreen-700'
                    : 'bg-dangerRed-50 border-dangerRed-200 text-dangerRed-700'
                }`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                    isTracked ? 'bg-successGreen-500' : 'bg-dangerRed-400'
                  }`}
                />
                {isTracked ? 'Subject in frame' : 'Awaiting subject'}
              </div>

              {/* Live telemetry */}
              <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5 flex flex-col gap-4">
                <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)] border-b border-carbonBlack-100 pb-3">
                  Live Telemetry
                </span>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Current Extension</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">{currentRatio.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Today's Target</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">
                      {sessionTarget ? sessionTarget.toFixed(2) : '—'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Audio Clarity</span>
                    <span className="font-mono text-carbonBlack-900 font-medium text-sm">
                      {exerciseState === 'RUNNING' ? `${(controlValue * 100).toFixed(0)}%` : 'Muted'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-carbonBlack-100 flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                    All-Time Best
                  </span>
                  <span className="font-mono text-2xl text-primary-600 font-bold">
                    {allTimeBest ? allTimeBest.toFixed(2) : 'No data'}
                  </span>
                </div>
              </div>

              {/* Stretch visualizer */}
              {exerciseState === 'RUNNING' && sessionTarget !== null && (
                <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5 flex flex-col gap-4">
                  <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)] border-b border-carbonBlack-100 pb-3">
                    Stretch Visualiser
                  </span>
                  <StretchIndicator currentRatio={currentRatio} sessionTarget={sessionTarget} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}