import { useEffect, useRef, useState } from 'react';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>, isTestRunning: boolean) => {
  const [controlValue, setControlValue] = useState<number>(0);
  const [currentRatio, setCurrentRatio] = useState<number>(0); 
  const [isTracked, setIsTracked] = useState<boolean>(false);
  
  // Split the logic: Today's goal vs Historical Best
  const [allTimeBest, setAllTimeBest] = useState<number | null>(null); 
  const [sessionTarget, setSessionTarget] = useState<number | null>(null);
  const [hasLeveledUp, setHasLeveledUp] = useState<boolean>(false);

  const minRatio = useRef(0.8); 

  const medianHistory = useRef<number[]>([]);
  const smoothHistory = useRef<number[]>([]);
  const lastSeenTime = useRef<number>(0);

  // Load historical best on mount
  useEffect(() => {
    const savedBest = localStorage.getItem('physio_pb_hand_extension');
    if (savedBest) setAllTimeBest(parseFloat(savedBest));
  }, []);

  // Set today's specific baseline (Silent Calibration Phase)
  const setBaseline = (baseline: number) => {
    setSessionTarget(baseline * 1.05); // Today's target is 5% harder than today's stretch
  };

  useEffect(() => {
    let handsModel: any = null;
    let animationFrameId: number;
    let isProcessing = false;
    let lastProcessTime = 0;

    const startHands = async () => {
      while (!(window as any).Hands) await new Promise(r => setTimeout(r, 100));
      const Hands = (window as any).Hands;
      handsModel = new Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
      handsModel.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

      handsModel.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          lastSeenTime.current = performance.now();
          if (!isTracked) setIsTracked(true);

          const landmarks = results.multiHandLandmarks[0];
          const calcDist3D = (p1: any, p2: any) => Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
          
          let palmLength = calcDist3D(landmarks[0], landmarks[9]);
          if (palmLength === 0) palmLength = 0.001;
          const rawRatio = calcDist3D(landmarks[0], landmarks[12]) / palmLength;

          medianHistory.current.push(rawRatio);
          if (medianHistory.current.length > 3) medianHistory.current.shift();
          const sorted = [...medianHistory.current].sort((a, b) => a - b);
          const filteredRatio = sorted.length === 3 ? sorted[1] : rawRatio;

          smoothHistory.current.push(filteredRatio);
          if (smoothHistory.current.length > 2) smoothHistory.current.shift();
          const smoothedRatio = smoothHistory.current.reduce((a, b) => a + b, 0) / smoothHistory.current.length;
          
          setCurrentRatio(smoothedRatio);

          // Calculate audio map based on TODAY'S target, not all-time best
          const activeTarget = sessionTarget !== null ? sessionTarget : 2.5;
          const mappedValue = Math.max(0.0, Math.min(1.0, 
            (smoothedRatio - minRatio.current) / (activeTarget - minRatio.current)
          ));
          setControlValue(mappedValue);

          // Progressive Overload Logic (Only runs during the actual test)
          if (isTestRunning && sessionTarget !== null && sorted.length === 3) {
            
            // 1. Push today's goalpost if they beat it
            if (smoothedRatio > sessionTarget) {
              setSessionTarget(smoothedRatio * 1.05); 
            }

            // 2. Did they beat their ALL-TIME historical best?
            if (allTimeBest === null || smoothedRatio > allTimeBest) {
              setAllTimeBest(smoothedRatio);
              localStorage.setItem('physio_pb_hand_extension', smoothedRatio.toString());
              setHasLeveledUp(true);
              setTimeout(() => setHasLeveledUp(false), 3000);
            }
          }

        } else {
          if (isTracked && performance.now() - lastSeenTime.current > 800) setIsTracked(false);
        }
      });

      const processVideo = async () => {
        if (performance.now() - lastProcessTime >= 1000/15 && videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          lastProcessTime = performance.now();
          try { await handsModel.send({ image: videoRef.current }); } 
          catch (e) {} finally { isProcessing = false; }
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };
      processVideo();
    };

    startHands();
    return () => { if (handsModel) handsModel.close(); if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [videoRef, isTracked, isTestRunning, sessionTarget, allTimeBest]); 

  return { controlValue, currentRatio, isTracked, allTimeBest, sessionTarget, hasLeveledUp, setBaseline };
};