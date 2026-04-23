import { useEffect, useRef, useState } from 'react';
import { ExponentialSmoothing } from '../utils/smoothing';

export const usePoseDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [yCoord, setYCoord] = useState<number>(0);
  const smoother = useRef(new ExponentialSmoothing(0.15));

  useEffect(() => {
    let pose: any = null;
    let animationFrameId: number;
    let isProcessing = false; // The lock to prevent Promise crashing

    const startPose = async () => {
      // Wait for the CDN script to attach to the window object
      while (!(window as any).Pose) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const Pose = (window as any).Pose;

      pose = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1, 
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: any) => {
        if (results.poseLandmarks && results.poseLandmarks[16]) {
          // Landmark 16 is Right Wrist. Invert so moving hand UP = higher number.
          const rawY = 1 - results.poseLandmarks[16].y;
          setYCoord(smoother.current.smooth(rawY));
        }
      });

      const processVideo = async () => {
        // Only send a frame if the previous frame is completely finished
        if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          try {
            await pose.send({ image: videoRef.current });
          } catch (e) {
            console.warn("MediaPipe loading frame skipped...");
          }
          isProcessing = false;
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };

      processVideo();
    };

    startPose();

    return () => {
      if (pose) pose.close();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [videoRef]);

  return yCoord;
};