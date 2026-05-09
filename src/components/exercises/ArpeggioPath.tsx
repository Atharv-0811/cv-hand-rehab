'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Text, Group, Stack, ThemeIcon } from '@mantine/core';
import { useSession } from '@/context/SessionContext';
import { ExerciseLayout, ExerciseState } from './ExerciseLayout';
import { CameraMirror } from '@/components/CameraMirror';
import { IconBulb } from '@tabler/icons-react';
import HandCanvas from '@/components/ar/HandCanvas';

const THUMB_TIP = 4;
const FINGER_TIPS = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
const FINGER_NAMES = ['INDEX', 'MIDDLE', 'RING', 'PINKY'];
const PALM_BASE = 0; // Needed for scale invariance
const MIDDLE_BASE = 9; // Needed for scale invariance
const PINCH_RATIO_THRESHOLD = 0.40; // Pinched when distance < 40% of palm length
const PATH_TOLERANCE = 0.15;

const NODES = [
  { x: 0.2, y: 0.8, note: 261.63, label: 'C' },
  { x: 0.4, y: 0.5, note: 329.63, label: 'E' },
  { x: 0.6, y: 0.3, note: 392.00, label: 'G' },
  { x: 0.8, y: 0.6, note: 493.88, label: 'B' },
];

type Landmark = { x: number; y: number; z: number };

import { useGamificationContext } from '@/context/GamificationContext';

export default function ArpeggioPath() {
  const { addXP } = useGamificationContext();
  const { setActiveExercise } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [exerciseState, setExerciseState] = useState<ExerciseState>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);
  const [isCamReady, setIsCamReady] = useState(false);
  const [isTracked, setIsTracked] = useState(false);

  // HandCanvas landmarks state
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);

  // Game state
  const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
  const cursorHistoryX = useRef<number[]>([]);
  const cursorHistoryY = useRef<number[]>([]);
  
  const [isPinched, _setIsPinched] = useState(false);
  const isPinchedRef = useRef(false);
  const setIsPinched = (val: boolean | ((prev: boolean) => boolean)) => {
    if (typeof val === 'function') {
      _setIsPinched((prev) => {
        const next = val(prev);
        isPinchedRef.current = next;
        return next;
      });
    } else {
      isPinchedRef.current = val;
      _setIsPinched(val);
    }
  };

  const [currentNode, setCurrentNode] = useState(0);

  const [score, _setScore] = useState(0);
  const scoreRef = useRef(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    if (score > prevScoreRef.current) {
      addXP(10);
      prevScoreRef.current = score;
    }
  }, [score, addXP]);

  const setScore = (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      _setScore((prev) => {
        const next = val(prev);
        scoreRef.current = next;
        return next;
      });
    } else {
      scoreRef.current = val;
      _setScore(val);
    }
  };

  // Phase 3 State
  const [activeFingerIdx, _setActiveFingerIdx] = useState(0);
  const activeFingerRef = useRef(0);
  const setActiveFingerIdx = (idx: number) => {
    activeFingerRef.current = idx;
    _setActiveFingerIdx(idx);
  };
  const [wrongFinger, setWrongFinger] = useState(false);
  
  const [currentRep, _setCurrentRep] = useState(0);
  const currentRepRef = useRef(0);
  const setCurrentRep = (val: number) => {
    currentRepRef.current = val;
    _setCurrentRep(val);
  };

  const [currentSet, _setCurrentSet] = useState(0);
  const currentSetRef = useRef(0);
  const setCurrentSet = (val: number) => {
    currentSetRef.current = val;
    _setCurrentSet(val);
  };

  const [stageOverlay, setStageOverlay] = useState<{
    title: string;
    subtitle: string;
    nextFinger: string;
  } | null>(null);
  const isPausedRef = useRef(false);
  const overlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Edge case states
  const [isTooFast, setIsTooFast] = useState(false);
  const lastFrameTime = useRef<number>(0);
  const prevCursorPos = useRef<{ x: number, y: number } | null>(null);

  const synthCtx = useRef<AudioContext | null>(null);

  const playNote = useCallback((freq: number) => {
    if (!synthCtx.current) synthCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = synthCtx.current;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime); 

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc2.connect(osc2Gain);
    osc2Gain.connect(gain);
    osc1.connect(gain);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.01); 
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); 

    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.5);
    osc2.stop(ctx.currentTime + 1.5);
  }, []);

  const handleInitHardware = () => {
    setExerciseState('INITIALIZING');
    if (!synthCtx.current) synthCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    setTimeout(() => {
      setExerciseState('CALIBRATION');
    }, 2000);
  };

  const handleExit = () => {
    setExerciseState('IDLE');
    setActiveExercise('MENU');
  };

  useEffect(() => {
    if (exerciseState !== 'RUNNING') return;

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
          setIsTracked(true);
          setLandmarks(results.multiHandLandmarks[0]);

          const landmarks = results.multiHandLandmarks[0];

          const thumb = landmarks[THUMB_TIP];

          // --- 1. THE 2D PINCH FIX ---
          const calcDist2D = (p1: any, p2: any) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

          let palmLength2D = calcDist2D(landmarks[PALM_BASE], landmarks[MIDDLE_BASE]);
          if (palmLength2D === 0) palmLength2D = 0.001;

          // --- 2. ACTIVE FINGER & ANTI-CHEAT ---
          if (isPausedRef.current) {
            setIsPinched(false);
            setWrongFinger(false);
            setCurrentNode(0);
            return;
          }

          const currentFingerIdx = activeFingerRef.current;
          let targetRatio = calcDist2D(thumb, landmarks[FINGER_TIPS[currentFingerIdx]]) / palmLength2D;

          let wrongPinched = false;
          // Only check anti-cheat if they aren't already actively dragging the path
          if (!isPinchedRef.current) {
            for (let i = 0; i < FINGER_TIPS.length; i++) {
              if (i !== currentFingerIdx) {
                const r = calcDist2D(thumb, landmarks[FINGER_TIPS[i]]) / palmLength2D;
                // Extremely relaxed anti-cheat: ONLY trigger if wrong finger is perfectly pinched and target is very far
                if (r < 0.30 && targetRatio > 0.50) {
                  wrongPinched = true;
                  break;
                }
              }
            }
          }
          setWrongFinger(wrongPinched);

          // --- 3. HYSTERESIS (Sticky Pinch) ---
          let isCurrentlyPinched = false;
          setIsPinched((wasPinched) => {
            if (wasPinched) {
              // Extremely relaxed hold threshold (1.2) - basically won't let go until hand opens completely
              isCurrentlyPinched = targetRatio < 1.2;
            } else {
              // Relaxed initial grab threshold (0.50)
              isCurrentlyPinched = targetRatio < 0.50 && !wrongPinched;
            }
            return isCurrentlyPinched;
          });

          if (wrongPinched) {
            isCurrentlyPinched = false;
            setIsPinched(false);
          }

          const targetFingerLandmark = landmarks[FINGER_TIPS[currentFingerIdx]];
          const rawMidX = (thumb.x + targetFingerLandmark.x) / 2;
          const rawMidY = (thumb.y + targetFingerLandmark.y) / 2;

          cursorHistoryX.current.push(rawMidX);
          cursorHistoryY.current.push(rawMidY);
          if (cursorHistoryX.current.length > 4) {
            cursorHistoryX.current.shift();
            cursorHistoryY.current.shift();
          }

          const smoothX = cursorHistoryX.current.reduce((a, b) => a + b, 0) / cursorHistoryX.current.length;
          const smoothY = cursorHistoryY.current.reduce((a, b) => a + b, 0) / cursorHistoryY.current.length;

          setCursorPos({ x: 1 - smoothX, y: smoothY });

          // --- 3. VELOCITY TRACKING (Speed Limit) ---
          const now = performance.now();
          if (prevCursorPos.current && lastFrameTime.current > 0) {
            const dt = now - lastFrameTime.current;
            if (dt > 0) {
              const dx = smoothX - prevCursorPos.current.x;
              const dy = smoothY - prevCursorPos.current.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const velocity = dist / dt; // pixels per millisecond

              // If moving faster than ~0.0015 units per ms, trigger warning
              setIsTooFast(velocity > 0.0015);
            }
          }
          prevCursorPos.current = { x: smoothX, y: smoothY };
          lastFrameTime.current = now;

          // --- 4. COLLISION LOGIC ---
          setCurrentNode((prevNode) => {
            if (!isCurrentlyPinched) return 0;

            if (prevNode < NODES.length) {
              const targetNode = NODES[prevNode];
              const targetMathX = 1 - targetNode.x;
              const targetMathY = targetNode.y;

              const distToTarget = Math.sqrt(Math.pow(smoothX - targetMathX, 2) + Math.pow(smoothY - targetMathY, 2));

              if (distToTarget < 0.08) {
                playNote(targetNode.note);
                if (prevNode === 3) {
                  setScore(s => s + 1);
                  
                  const nextRep = currentRepRef.current + 1;
                  if (nextRep < 4) {
                    setCurrentRep(nextRep);
                  } else {
                    const nextFingerIdx = currentFingerIdx + 1;
                    if (nextFingerIdx < 4) {
                      isPausedRef.current = true;
                      setStageOverlay({
                        title: 'Great Job!',
                        subtitle: `Finished ${FINGER_NAMES[currentFingerIdx]} finger reps.`,
                        nextFinger: FINGER_NAMES[nextFingerIdx],
                      });
                      
                      overlayTimeoutRef.current = setTimeout(() => {
                        setActiveFingerIdx(nextFingerIdx);
                        setCurrentRep(0);
                        isPausedRef.current = false;
                        setStageOverlay(null);
                      }, 2500);
                    } else {
                      const nextSet = currentSetRef.current + 1;
                      if (nextSet < 3) {
                        isPausedRef.current = true;
                        setStageOverlay({
                          title: `Set ${nextSet} Complete!`,
                          subtitle: 'Take a short rest.',
                          nextFinger: 'INDEX',
                        });
                        
                        overlayTimeoutRef.current = setTimeout(() => {
                          setActiveFingerIdx(0);
                          setCurrentRep(0);
                          setCurrentSet(nextSet);
                          isPausedRef.current = false;
                          setStageOverlay(null);
                        }, 3500);
                      } else {
                        isPausedRef.current = true;
                        setStageOverlay({
                          title: 'Session Complete!',
                          subtitle: 'Excellent work today.',
                          nextFinger: 'FINISH',
                        });
                        
                        overlayTimeoutRef.current = setTimeout(() => {
                          handleExit();
                        }, 3000);
                      }
                    }
                  }
                  return 0;
                }
                return prevNode + 1;
              }

              if (prevNode > 0) {
                const prevTarget = NODES[prevNode - 1];
                const prevMathX = 1 - prevTarget.x;
                const prevMathY = prevTarget.y;

                const l2 = Math.pow(targetMathX - prevMathX, 2) + Math.pow(targetMathY - prevMathY, 2);
                let distToSegment = 0;

                if (l2 === 0) {
                  distToSegment = Math.sqrt(Math.pow(smoothX - prevMathX, 2) + Math.pow(smoothY - prevMathY, 2));
                } else {
                  let t = ((smoothX - prevMathX) * (targetMathX - prevMathX) + (smoothY - prevMathY) * (targetMathY - prevMathY)) / l2;
                  t = Math.max(0, Math.min(1, t));
                  const projX = prevMathX + t * (targetMathX - prevMathX);
                  const projY = prevMathY + t * (targetMathY - prevMathY);
                  distToSegment = Math.sqrt(Math.pow(smoothX - projX, 2) + Math.pow(smoothY - projY, 2));
                }

                if (distToSegment > PATH_TOLERANCE) return 0;
              }
            }
            return prevNode;
          });

        } else {
          setIsTracked(false);
          setLandmarks(null);
          setIsPinched(false);
          setIsTooFast(false);
          setWrongFinger(false);
          setCurrentNode(0);
          cursorHistoryX.current = [];
          cursorHistoryY.current = [];
          prevCursorPos.current = null;
        }
      });

      const processVideo = async () => {
        if (performance.now() - lastProcessTime >= 1000 / 15 && videoRef.current && videoRef.current.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          lastProcessTime = performance.now();
          try { await handsModel.send({ image: videoRef.current }); }
          catch (e) { } finally { isProcessing = false; }
        }
        animationFrameId = requestAnimationFrame(processVideo);
      };
      processVideo();
    };

    startHands();
    return () => { 
      if (handsModel) handsModel.close(); 
      cancelAnimationFrame(animationFrameId); 
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, [exerciseState]);

  return (
    <ExerciseLayout
      title="AR Arpeggio Path"
      exerciseState={exerciseState}
      onInitHardware={handleInitHardware}
      onExit={handleExit}
      leftPanel={
        <div className="flex flex-col gap-4">
          <div className="relative w-full rounded-md overflow-hidden bg-carbonBlack-50 border border-carbonBlack-200">
            <CameraMirror videoRef={videoRef} onReady={() => setIsCamReady(true)} onError={(err) => setCamError(err)} />

            {/* HandCanvas overlay — renders the skeleton on top of the camera feed */}
            <HandCanvas
              videoRef={videoRef}
              landmarks={landmarks}
              showLiveHand={exerciseState === 'RUNNING'}
              showGhostHand={false}
              progress={0}
            />

            {exerciseState === 'CALIBRATION' && (
              <div className="absolute inset-0 bg-carbonBlack-900/40 backdrop-blur-sm z-30 flex items-center justify-center p-6">
                <Box p="lg" w="100%" style={{ 
                  maxWidth: 380,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 'var(--mantine-radius-md)', 
                  border: '1px solid var(--mantine-color-carbonBlack-2)', 
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                }}>
                  <Group align="center" mb="md" gap="sm">
                    <ThemeIcon size="lg" color="warningAmber.5" variant="light" radius="xl">
                      <IconBulb size={20} />
                    </ThemeIcon>
                    <Text fw={700} size="md" c="carbonBlack.9">
                      Before You Start
                    </Text>
                  </Group>

                  <Stack gap="sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs mt-0.5">1</div>
                      <Text size="sm" c="carbonBlack.7" lh={1.4}>
                        <span className="font-semibold text-carbonBlack-900">Lighting is key.</span> Ensure you are in a well-lit environment so the camera can accurately track your hand.
                      </Text>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs mt-0.5">2</div>
                      <Text size="sm" c="carbonBlack.7" lh={1.4}>
                        <span className="font-semibold text-carbonBlack-900">Pinch & Hold.</span> Firmly pinch your thumb and the designated target finger together to begin.
                      </Text>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xs mt-0.5">3</div>
                      <Text size="sm" c="carbonBlack.7" lh={1.4}>
                        <span className="font-semibold text-carbonBlack-900">Trace the Path.</span> Drag your pinched fingers through the air to collect all musical nodes without dropping the pinch.
                      </Text>
                    </div>
                  </Stack>
                </Box>
              </div>
            )}

            {exerciseState === 'RUNNING' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {NODES.map((node, i) => {
                  if (i === 0) return null;
                  const prev = NODES[i - 1];
                  const isActivePath = i === currentNode;
                  const isCompletedPath = i < currentNode;
                  return (
                    <line
                      key={`path-${i}`}
                      x1={`${prev.x * 100}%`} y1={`${prev.y * 100}%`}
                      x2={`${node.x * 100}%`} y2={`${node.y * 100}%`}
                      stroke={wrongFinger ? 'var(--mantine-color-dangerRed-5)' : isCompletedPath ? 'var(--mantine-color-primary-5)' : isActivePath ? 'var(--mantine-color-warningAmber-4)' : 'var(--mantine-color-carbonBlack-3)'}
                      strokeWidth={isCompletedPath || isActivePath ? 6 : 3}
                      strokeLinecap="round"
                      strokeDasharray={isCompletedPath ? "none" : "8,8"}
                      opacity={isCompletedPath || isActivePath ? 0.8 : 0.4}
                    />
                  );
                })}

                {NODES.map((node, i) => {
                  const isReached = i < currentNode;
                  const isNext = i === currentNode;
                  return (
                    <g key={`node-${i}`}>
                      <circle
                        cx={`${node.x * 100}%`} cy={`${node.y * 100}%`}
                        r={isNext ? 24 : 16}
                        fill={isReached ? 'var(--mantine-color-primary-5)' : isNext ? 'var(--mantine-color-warningAmber-5)' : 'var(--mantine-color-carbonBlack-2)'}
                        opacity={0.9}
                      />
                      <text
                        x={`${node.x * 100}%`} y={`${node.y * 100}%`}
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}

                {isTracked && cursorPos && (
                  <circle
                    cx={`${cursorPos.x * 100}%`} cy={`${cursorPos.y * 100}%`}
                    r={isPinched ? 12 : 20}
                    fill={isPinched ? 'var(--mantine-color-successGreen-5)' : 'rgba(255, 255, 255, 0.4)'}
                    stroke="var(--mantine-color-successGreen-7)"
                    strokeWidth="3"
                    style={{ transition: 'r 0.1s ease' }}
                  />
                )}
              </svg>
            )}

            {isTooFast && isPinched && !wrongFinger && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <Box px="md" py="xs" bg="dangerRed.6" style={{ borderRadius: '100px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
                  <Text fw={700} c="white" size="sm" tt="uppercase" lts="0.05em">
                    Slow Down!
                  </Text>
                </Box>
              </div>
            )}

            {wrongFinger && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <Box px="md" py="xs" bg="dangerRed.6" style={{ borderRadius: '100px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)' }}>
                  <Text fw={700} c="white" size="sm" tt="uppercase" lts="0.05em">
                    Wrong Finger!
                  </Text>
                </Box>
              </div>
            )}

            {stageOverlay && (
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-30 flex items-center justify-center">
                <style>{`
                  @keyframes slideDownSpring {
                    0% { transform: translateY(-30px) scale(0.95); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                  }
                `}</style>
                <Box p="md" w={260} style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 'var(--mantine-radius-md)', 
                  border: '1px solid var(--mantine-color-carbonBlack-2)', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
                  textAlign: 'center',
                  animation: 'slideDownSpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                }}>
                  <Text size="sm" fw={800} c="primary.6" tt="uppercase" lts="0.05em">
                    {stageOverlay.title}
                  </Text>
                  <Text size="xs" fw={500} c="carbonBlack.6" mt={4} mb="md">
                    {stageOverlay.subtitle}
                  </Text>
                  {stageOverlay.nextFinger !== 'FINISH' && (
                    <Text size="xs" fw={700} c="carbonBlack.8" mb={4}>
                      Next: {stageOverlay.nextFinger} FINGER
                    </Text>
                  )}
                </Box>
              </div>
            )}

            {camError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
                <Box p="md" bg="dangerRed.0" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-dangerRed-2)' }}>
                  <Text size="sm" fw={600} c="dangerRed.9">
                    {camError} Please check browser permissions.
                  </Text>
                </Box>
              </div>
            )}
          </div>

          {exerciseState === 'CALIBRATION' && (
            <button
              onClick={() => setExerciseState('RUNNING')}
              disabled={!isCamReady}
              className="w-full rounded-md bg-primary-500 text-white px-4 py-3 font-semibold hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-[var(--font-work-sans)]"
            >
              Start AR Session
            </button>
          )}
          {exerciseState === 'RUNNING' && (
            <button
              onClick={handleExit}
              className="w-full rounded-md bg-white text-carbonBlack-800 px-6 py-3 font-semibold hover:bg-carbonBlack-50 transition-colors border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-sm font-[var(--font-work-sans)]"
            >
              End Session
            </button>
          )}
        </div>
      }
      rightPanel={
        <>
          <div
            className={`px-4 py-3 rounded-md border text-sm font-medium font-[var(--font-work-sans)] flex items-center gap-2 ${isTracked
              ? 'bg-successGreen-50 border-successGreen-200 text-successGreen-700'
              : 'bg-dangerRed-50 border-dangerRed-200 text-dangerRed-700'
              }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isTracked ? 'bg-successGreen-500' : 'bg-dangerRed-400'
                }`}
            />
            {isTracked ? 'Subject in frame' : 'Awaiting subject'}
          </div>

          <div className="bg-white border border-carbonBlack-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-md p-5 flex flex-col gap-4">
            <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)] border-b border-carbonBlack-100 pb-3">
              AR Telemetry
            </span>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Progress</span>
                <span className="font-mono font-bold text-sm text-primary-600">
                  Set {currentSet + 1}/3
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Target</span>
                <span className="font-mono font-bold text-sm text-carbonBlack-900">
                  {FINGER_NAMES[activeFingerIdx]} ({currentRep}/4)
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Pinch Status</span>
                <span className={`font-mono font-bold text-sm ${isPinched ? 'text-successGreen-600' : 'text-dangerRed-500'}`}>
                  {isPinched ? 'PINCHED' : 'OPEN'}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-sm text-carbonBlack-600 font-[var(--font-work-sans)]">Next Node</span>
                <span className="font-mono text-carbonBlack-900 font-medium text-sm">
                  {currentNode < NODES.length ? NODES[currentNode].label : 'DONE'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-carbonBlack-100 flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-[0.11em] font-semibold text-carbonBlack-500 font-[var(--font-work-sans)]">
                Completed Paths
              </span>
              <span className="font-mono text-2xl text-primary-600 font-bold">
                {score}
              </span>
            </div>
          </div>

          <Box p="md" bg="carbonBlack.0" style={{ borderRadius: 'var(--mantine-radius-md)' }}>
            <Text size="xs" tt="uppercase" fw={600} c="carbonBlack.5" mb="xs">Instructions</Text>
            <Text size="sm" c="carbonBlack.8" lh={1.5}>
              1. Pinch your thumb and index finger together to start at node C.<br />
              2. Drag your pinched fingers along the path to each node.<br />
              3. Do not drop the pinch or stray from the path, or it will reset!
            </Text>
          </Box>
        </>
      }
    />
  );
}