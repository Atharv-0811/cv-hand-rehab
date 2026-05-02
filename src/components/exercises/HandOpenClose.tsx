'use client';
import { useRef, useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CameraMirror } from '@/components/CameraMirror';
import { StretchIndicator } from '@/components/exercises/StretchIndicator';
import { useSession } from '@/context/SessionContext';

import { ExerciseLayout, ExerciseState } from './ExerciseLayout';

import { useGamificationContext } from '@/context/GamificationContext';

export default function HandOpenClose() {
  const { addXP } = useGamificationContext();
  const { setActiveExercise } = useSession();
  const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);

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
      addXP(15);
      prevTargetRef.current = sessionTarget;
    }
  }, [sessionTarget, exerciseState, addXP]);

  const handleInitHardware = async () => {
    setExerciseState('INITIALIZING');
    await initAudio();
    setExerciseState('CALIBRATION');
  };

  const handleLockBaseline = () => {
    setBaseline(currentRatio);
    setExerciseState('RUNNING');
    playAudio();
  };

  const handleExit = () => {
    stopAudio();
    setExerciseState('IDLE');
    setActiveExercise('MENU');
  };

  return (
    <ExerciseLayout
      title="Hand Extension Test"
      exerciseState={exerciseState}
      onInitHardware={handleInitHardware}
      onExit={handleExit}
      leftPanel={
        <>
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
        </>
      }
      rightPanel={
        <>
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
        </>
      }
    />
  );
}