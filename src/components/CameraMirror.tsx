'use client';
import { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/animations/loading.json';

interface CameraMirrorProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onReady: () => void;
  onError: (err: string) => void;
}

export const CameraMirror = ({ videoRef, onReady, onError }: CameraMirrorProps) => {
  const [camStatus, setCamStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const isInitialized = useRef(false); // Prevents rapid re-triggering

  useEffect(() => {
    async function setupCamera() {
      if (isInitialized.current) return;
      isInitialized.current = true;

      try {
        if (!navigator.mediaDevices) throw new Error("Browser does not support camera.");
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCamStatus('ready');
            onReady(); 
          };
        }
      } catch (err: any) {
        setCamStatus('error');
        if (err.name === 'NotAllowedError') onError("Camera access denied.");
        else onError("Camera blocked or currently in use.");
      }
    }
    setupCamera();
  }, []); // <-- EMPTY ARRAY STOPS THE SEIZURE FLICKER

  return (
    <div className="relative w-full bg-carbonBlack-900 border border-carbonBlack-200 shadow-sm rounded-md overflow-hidden aspect-video flex items-center justify-center">
      {camStatus === 'loading' && (
        <div className="absolute z-10 flex flex-col items-center justify-center">
          <Lottie animationData={loadingAnimation} loop={true} style={{ width: 150, height: 150 }} />
          <p className="text-carbonBlack-400 font-mono mt-2 text-sm">Initializing Hardware...</p>
        </div>
      )}
      {camStatus === 'error' && <p className="text-red-500 font-mono absolute z-10 text-center">⚠ Camera Error</p>}
      
      <video
        ref={videoRef}
        className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${camStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
        muted
        playsInline
      />
    </div>
  );
};