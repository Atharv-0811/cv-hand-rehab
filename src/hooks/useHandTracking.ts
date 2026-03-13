import { useEffect, useRef, useState } from 'react';

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const [controlValue, setControlValue] = useState<number>(0);
    const [currentRatio, setCurrentRatio] = useState<number>(0);
    const [isTracked, setIsTracked] = useState<boolean>(false); // NEW
    const lastSeenTime = useRef<number>(0); // NEW
    const WATCHDOG_TIMEOUT = 800; // ms // NEW

    const minRatio = useRef(0.8);
    const maxRatio = useRef(2.5);

    // Two-stage filtering arrays
    const medianHistory = useRef<number[]>([]);
    const MEDIAN_WINDOW = 3; // Discards single-frame teleports

    const smoothHistory = useRef<number[]>([]);
    const SMOOTH_WINDOW = 2; // Low-latency averaging

    useEffect(() => {
        let handsModel: any = null;
        let animationFrameId: number;
        let isProcessing = false;
        let lastVideoTime = -1;
        let lastProcessTime = 0;
        const TARGET_FPS = 15;
        const frameInterval = 1000 / TARGET_FPS;

        const startHands = async () => {
            while (!(window as any).Hands) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            const Hands = (window as any).Hands;

            handsModel = new Hands({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            handsModel.setOptions({
                maxNumHands: 1,
                modelComplexity: 0,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });

            handsModel.onResults((results: any) => {
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    // Hand detected! Reset the watchdog.
                    lastSeenTime.current = performance.now();
                    if (!isTracked) setIsTracked(true);

                    const landmarks = results.multiHandLandmarks[0];

                    const wrist = landmarks[0];
                    const middleBase = landmarks[9];
                    const middleTip = landmarks[12];

                    // UPGRADE 1: 3D Euclidean Distance (Math.hypot handles 3 arguments natively)
                    const calcDist3D = (p1: any, p2: any) =>
                        Math.hypot(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);

                    let palmLength = calcDist3D(wrist, middleBase);
                    const stretchLength = calcDist3D(wrist, middleTip);

                    if (palmLength === 0) palmLength = 0.001;
                    const rawRatio = stretchLength / palmLength;

                    // UPGRADE 2: Median Filter (Sorts last 3 frames, picks the middle one)
                    medianHistory.current.push(rawRatio);
                    if (medianHistory.current.length > MEDIAN_WINDOW) {
                        medianHistory.current.shift();
                    }

                    let filteredRatio = rawRatio;
                    if (medianHistory.current.length === MEDIAN_WINDOW) {
                        const sorted = [...medianHistory.current].sort((a, b) => a - b);
                        filteredRatio = sorted[1]; // Get the median value
                    }

                    // Stage 2: Low-latency moving average
                    smoothHistory.current.push(filteredRatio);
                    if (smoothHistory.current.length > SMOOTH_WINDOW) {
                        smoothHistory.current.shift();
                    }
                    const smoothedRatio = smoothHistory.current.reduce((a, b) => a + b, 0) / smoothHistory.current.length;

                    setCurrentRatio(smoothedRatio);

                    const mapRange = (x: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
                        if (inMax === inMin) return outMin;
                        const mapped = (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
                        return Math.max(outMin, Math.min(outMax, mapped));
                    };

                    const mappedValue = mapRange(smoothedRatio, minRatio.current, maxRatio.current, 0.0, 1.0);
                    setControlValue(mappedValue);
                } else {
                    // No hand detected in this frame. Check the watchdog timer.
                    if (isTracked && performance.now() - lastSeenTime.current > WATCHDOG_TIMEOUT) {
                        setIsTracked(false);
                    }
                }
            });

            const processVideo = async () => {
                const now = performance.now();

                if (now - lastProcessTime >= frameInterval) {
                    if (videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
                        if (videoRef.current.currentTime !== lastVideoTime) {

                            isProcessing = true;
                            lastProcessTime = now;
                            lastVideoTime = videoRef.current.currentTime;

                            try {
                                await handsModel.send({ image: videoRef.current });
                            } catch (e) {
                                // Silent fail on dropped frames
                            } finally {
                                isProcessing = false;
                            }
                        }
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
    }, [videoRef]);

    const calibrateMin = () => { minRatio.current = currentRatio; };
    const calibrateMax = () => { maxRatio.current = currentRatio; };

    return { controlValue, currentRatio, calibrateMin, calibrateMax, isTracked };
};