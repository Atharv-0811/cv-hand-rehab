'use client';
import { useRef, useState, useEffect } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { CameraMirror } from '@/components/CameraMirror';
import { useSession } from '@/context/SessionContext';

type ExerciseState = 'IDLE' | 'CALIBRATION' | 'RUNNING';

export default function HandOpenClose() {
  const { setActiveExercise } = useSession();
  const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isTestRunning = exerciseState === 'RUNNING';
  
  const { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, hasLeveledUp, setBaseline } = useHandTracking(videoRef, isTestRunning);
  const { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded } = useAudioEngine();

  useEffect(() => {
    if (exerciseState === 'RUNNING' && isAudioLoaded) {
      setTrackingStatus(isTracked);
      updateFilter(controlValue);
    }
  }, [controlValue, isTracked, exerciseState, isAudioLoaded, updateFilter, setTrackingStatus]);

  const handleInitHardware = async () => {
    setExerciseState('CALIBRATION');
    await initAudio(); // Decodes the audio, but it remains strictly paused
  };

  const handleLockBaseline = () => {
    setBaseline(currentRatio);
    setExerciseState('RUNNING');
    playAudio(); // Now the audio starts
  };

  const handleExit = () => {
    stopAudio();
    setExerciseState('IDLE');
    setActiveExercise('MENU');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto text-carbonBlack-600 relative">
      
      {/* RESTORED LEVEL UP BANNER (Clinical styling: No gradients, sharp corners) */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${
        hasLeveledUp ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="bg-background text-carbonBlack-900 font-bold text-center py-3 px-6 rounded-md shadow-lg border border-green-500 flex items-center justify-center gap-3">
          <span className="text-green-600 font-mono text-xl">↑</span>
          <span className="tracking-wide">NEW ALL-TIME BEST RECORDED</span>
          <span className="text-green-600 font-mono text-xl">↑</span>
        </div>
      </div>

      <div className="flex justify-between w-full mb-6 items-center border-b border-carbonBlack-200 pb-4">
        <h2 className="text-2xl font-semibold text-carbonBlack-900 tracking-tight">Hand Extension Test</h2>
        <button onClick={handleExit} className="px-4 py-2 bg-carbonBlack-100 text-carbonBlack-800 rounded-md hover:bg-carbonBlack-200 transition-colors text-sm font-medium">
          Exit to Menu
        </button>
      </div>
      
      {exerciseState === 'IDLE' && (
        <div className="bg-background border border-carbonBlack-200 shadow-sm p-8 rounded-md w-full max-w-lg text-center mt-12">
          <h3 className="text-lg font-medium mb-4 text-carbonBlack-900">Equipment Initialization</h3>
          <p className="text-sm text-carbonBlack-600 mb-8 leading-relaxed">
            This module requires webcam access. Please ensure your hand is visible.
          </p>
          <button onClick={handleInitHardware} className="w-full rounded-md bg-primary-500 text-brandWhite px-6 py-3 font-semibold hover:bg-primary-600 transition-colors shadow-sm">
            Initialize Hardware
          </button>
        </div>
      )}

      {exerciseState !== 'IDLE' && (
        <div className="w-full flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <CameraMirror videoRef={videoRef} onReady={() => setIsCamReady(true)} onError={(err) => setCamError(err)} />

            {camError ? (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-sm">
                {camError} Please check browser permissions.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {exerciseState === 'CALIBRATION' ? (
                  <div className="bg-background p-4 border border-carbonBlack-200 shadow-sm rounded-md">
                    <p className="text-sm text-carbonBlack-700 mb-4">
                      <strong>Calibration Phase:</strong> Stretch your hand open as far as comfortably possible. Audio is muted. Click below to lock today's baseline.
                    </p>
                    <button 
                      onClick={handleLockBaseline} 
                      disabled={!isCamReady || !isTracked}
                      className="w-full rounded-md bg-primary-500 text-brandWhite px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
                    >
                      Lock Baseline & Start Test
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { pauseAudio(); setExerciseState('IDLE'); setActiveExercise('MENU'); }} 
                    className="w-full rounded-md bg-background text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 transition-colors border border-carbonBlack-200 shadow-sm"
                  >
                    End Session
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Clinical Metrics Dashboard */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className={`p-3 rounded-md border text-sm font-medium shadow-sm ${isTracked ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {isTracked ? 'Status: Subject in Frame' : 'Status: Awaiting Subject'}
            </div>

            <div className="bg-background border border-carbonBlack-200 shadow-sm p-4 rounded-md flex flex-col gap-4 relative overflow-hidden">
              <h4 className="text-xs uppercase tracking-widest text-carbonBlack-500 font-semibold border-b border-carbonBlack-100 pb-2">Live Telemetry</h4>
              
              <div className="flex justify-between items-center z-10">
                <span className="text-sm text-carbonBlack-600">Current Extension:</span>
                <span className="font-mono text-carbonBlack-900 font-medium">{currentRatio.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center z-10">
                <span className="text-sm text-carbonBlack-600">Today's Target:</span>
                <span className="font-mono text-carbonBlack-900 font-medium">{sessionTarget ? sessionTarget.toFixed(2) : '---'}</span>
              </div>
              
              <div className="flex justify-between items-center z-10">
                <span className="text-sm text-carbonBlack-600">Audio Clarity:</span>
                <span className="font-mono text-carbonBlack-900 font-medium">{exerciseState === 'RUNNING' ? `${(controlValue * 100).toFixed(0)}%` : 'MUTED'}</span>
              </div>

              <div className="mt-2 pt-4 border-t border-carbonBlack-100 flex flex-col gap-2 z-10">
                <span className="text-xs text-carbonBlack-500 uppercase tracking-widest font-semibold">All-Time Best</span>
                <span className="font-mono text-xl text-primary-600 font-bold">{allTimeBest ? allTimeBest.toFixed(2) : 'No Data'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}