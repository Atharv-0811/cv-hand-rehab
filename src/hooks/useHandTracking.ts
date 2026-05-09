import { useEffect, useRef, useState } from 'react';
import { Landmark } from '@/types/hand';

export const useHandTracking = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isTrackingEnabled: boolean
) => {
  const [controlValue, setControlValue] = useState<number>(0);
  const [currentRatio, setCurrentRatio] = useState<number>(0);
  const [isTracked, setIsTracked] = useState<boolean>(false);
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);

  const [allTimeBest, setAllTimeBest] = useState<number | null>(null);
  const [sessionTarget, setSessionTarget] = useState<number | null>(null);
  const [hasLeveledUp, setHasLeveledUp] = useState<boolean>(false);

  const minRatio = useRef(0.8);
  const medianHistory = useRef<number[]>([]);
  const smoothHistory = useRef<number[]>([]);
  const lastSeenTime = useRef<number>(0);

  // Refs to avoid stale closures inside the effect
  const isTrackedRef = useRef(false);
  const isTrackingEnabledRef = useRef(isTrackingEnabled);
  const sessionTargetRef = useRef<number | null>(null);
  const allTimeBestRef = useRef<number | null>(null);

  // Keep refs in sync
  isTrackingEnabledRef.current = isTrackingEnabled;
  sessionTargetRef.current = sessionTarget;
  allTimeBestRef.current = allTimeBest;

  useEffect(() => {
    const savedBest = localStorage.getItem('physio_pb_hand_extension');
    if (savedBest) {
      const val = parseFloat(savedBest);
      setAllTimeBest(val);
      allTimeBestRef.current = val;
    }
  }, []);

  const setBaseline = (baseline: number) => {
    const target = baseline * 1.05;
    setSessionTarget(target);
    sessionTargetRef.current = target;
  };

  // Single effect, empty deps — MediaPipe starts once and never restarts
  useEffect(() => {
    let handsModel: any = null;
    let animationFrameId: number;
    let isProcessing = false;
    let lastProcessTime = 0;

    const startHands = async () => {
      while (!(window as any).Hands) await new Promise(r => setTimeout(r, 100));
      const Hands = (window as any).Hands;
      handsModel = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      handsModel.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      handsModel.onResults((results: any) => {
        if (!isTrackingEnabledRef.current) return;

        if (
          results.multiHandLandmarks &&
          results.multiHandLandmarks.length > 0
        ) {
          lastSeenTime.current = performance.now();

          if (!isTrackedRef.current) {
            isTrackedRef.current = true;
            setIsTracked(true);
          }

          const lms = results.multiHandLandmarks[0];
          setLandmarks(lms);

          const calcDist3D = (p1: any, p2: any) =>
            Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);

          let palmLength = calcDist3D(lms[0], lms[9]);
          if (palmLength === 0) palmLength = 0.001;
          const rawRatio = calcDist3D(lms[0], lms[12]) / palmLength;

          medianHistory.current.push(rawRatio);
          if (medianHistory.current.length > 3) medianHistory.current.shift();
          const sorted = [...medianHistory.current].sort((a, b) => a - b);
          const filteredRatio =
            sorted.length === 3 ? sorted[1] : rawRatio;

          smoothHistory.current.push(filteredRatio);
          if (smoothHistory.current.length > 2) smoothHistory.current.shift();
          const smoothedRatio =
            smoothHistory.current.reduce((a, b) => a + b, 0) /
            smoothHistory.current.length;

          setCurrentRatio(smoothedRatio);

          const activeTarget =
            sessionTargetRef.current !== null
              ? sessionTargetRef.current
              : 2.5;
          const mappedValue = Math.max(
            0.0,
            Math.min(
              1.0,
              (smoothedRatio - minRatio.current) /
                (activeTarget - minRatio.current)
            )
          );
          setControlValue(mappedValue);

          // Progressive overload — only during RUNNING
          // We use isTrackingEnabled but we need to know if it's specifically RUNNING
          // Pass a separate isRunningRef if needed, or check sessionTarget is set
          if (sessionTargetRef.current !== null && sorted.length === 3) {
            if (smoothedRatio > sessionTargetRef.current) {
              const newTarget = smoothedRatio * 1.05;
              setSessionTarget(newTarget);
              sessionTargetRef.current = newTarget;
            }

            const best = allTimeBestRef.current;
            if (best === null || smoothedRatio > best) {
              setAllTimeBest(smoothedRatio);
              allTimeBestRef.current = smoothedRatio;
              localStorage.setItem(
                'physio_pb_hand_extension',
                smoothedRatio.toString()
              );
              setHasLeveledUp(true);
              setTimeout(() => setHasLeveledUp(false), 3000);
            }
          }
        } else {
          if (
            isTrackedRef.current &&
            performance.now() - lastSeenTime.current > 800
          ) {
            isTrackedRef.current = false;
            setIsTracked(false);
            setLandmarks(null);
          }
        }
      });

      const processVideo = async () => {
        if (
          performance.now() - lastProcessTime >= 1000 / 15 &&
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          !isProcessing
        ) {
          isProcessing = true;
          lastProcessTime = performance.now();
          try {
            await handsModel.send({ image: videoRef.current });
          } catch (e) {
          } finally {
            isProcessing = false;
          }
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };

      processVideo();
    };

    startHands();

    return () => {
      if (handsModel) handsModel.close();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []); // ← empty: MediaPipe starts once, refs handle all dynamic values

  return {
    controlValue,
    currentRatio,
    isTracked,
    landmarks,
    allTimeBest,
    sessionTarget,
    hasLeveledUp,
    setBaseline,
  };
};
