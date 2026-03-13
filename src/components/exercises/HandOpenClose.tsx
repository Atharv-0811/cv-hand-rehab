'use client';
import { useRef, useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CameraMirror } from '@/components/CameraMirror';
import { useSession } from '@/context/SessionContext';

export default function HandOpenClose() {
  const { setActiveExercise } = useSession();
  const [isStarted, setIsStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Your untouched, working hooks
  const { controlValue, currentRatio, calibrateMin, calibrateMax, isTracked } = useHandTracking(videoRef);
  const { initAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded } = useAudioEngine();

  // 1. Send the tracking status to the AudioWorklet whenever it changes
  useEffect(() => {
    if (isStarted && isAudioLoaded) {
      setTrackingStatus(isTracked);
    }
  }, [isTracked, isStarted, isAudioLoaded, setTrackingStatus]);

  // 2. Keep the ratio updating as normal
  useEffect(() => {
    if (isStarted && isAudioLoaded) {
      updateFilter(controlValue);
    }
  }, [controlValue, isStarted, isAudioLoaded, updateFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c') calibrateMin();
      if (e.key === 'o') calibrateMax();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calibrateMin, calibrateMax]);

  const handleExit = () => {
    stopAudio();
    setIsStarted(false);
    setActiveExercise('MENU');
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      <div className="flex justify-between w-full max-w-2xl mb-6 items-center">
        <h2 className="text-3xl font-bold tracking-tight">Hand Extension</h2>
        <button
          onClick={handleExit}
          className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-bold"
        >
          ← Back to Menu
        </button>
      </div>

      {!isStarted ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg text-center shadow-xl">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Exercise Instructions</h3>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Position yourself so your hand is clearly visible. Open your fingers as wide as possible, then close them into a tight fist.
          </p>
          <button
            onClick={async () => { setIsStarted(true); await initAudio(); }}
            className="w-full rounded-full bg-blue-600 px-8 py-4 font-bold hover:bg-blue-500 transition-colors"
          >
            Start Tracking
          </button>
        </div>
      ) : !isAudioLoaded ? (
        <div className="mt-12 p-6 text-blue-400 font-mono animate-pulse border border-blue-900/50 rounded-xl bg-blue-950/20">
          Initializing Engine & Calibrating Video...
        </div>
      ) : (
        <div className="space-y-6 text-center w-full max-w-2xl flex flex-col items-center">

          <div className="flex gap-4 mb-2 w-full justify-center">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner w-32">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Raw Ratio</p>
              <p className="text-xl text-blue-400 font-mono">{currentRatio.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-inner w-32">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">CV Out (0-1)</p>
              <p className="text-xl text-green-400 font-mono">{controlValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Tracking Status Indicator */}
          <div className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${isTracked ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400'
              : 'bg-red-900/30 border-red-500/50 text-red-400 animate-pulse'
            }`}>
            {isTracked ? '● Tracking Active' : '⚠ Hand Lost - Please Step into Frame'}
          </div>

          <CameraMirror videoRef={videoRef} />

          <div className="flex gap-4 mt-2 w-full justify-center">
            <button onClick={calibrateMin} className="px-5 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm font-mono border border-slate-600 transition-colors">
              [C] Set Closed
            </button>
            <button onClick={calibrateMax} className="px-5 py-2.5 bg-slate-800 rounded-lg hover:bg-slate-700 text-sm font-mono border border-slate-600 transition-colors">
              [O] Set Open
            </button>
          </div>
        </div>
      )}
    </div>
  );
}