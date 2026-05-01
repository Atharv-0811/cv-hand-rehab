'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Group, Text, Title, SimpleGrid, RingProgress, Center, ThemeIcon } from '@mantine/core';
import { useSession } from '@/context/SessionContext';
import { CameraMirror } from '@/components/CameraMirror';

// MediaPipe Landmark Indices
const THUMB_TIP = 4;
const FINGER_TIPS = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
const NOTES = [440.00, 493.88, 554.37, 587.33]; // A4, B4, C#5, D5 (Ascending Major Scale)

const PINCH_THRESHOLD = 0.04; // How close to register a pinch
const RELEASE_THRESHOLD = 0.08; // How far to register a clean release

export default function SequentialPinch({ onSessionComplete }: { onSessionComplete?: (xp: number) => void }) {
  const { setActiveExercise } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isCamReady, setIsCamReady] = useState(false);
  const [isTracked, setIsTracked] = useState(false);
  const [exerciseState, setExerciseState] = useState<'IDLE' | 'RUNNING'>('IDLE');
  const [camError, setCamError] = useState<string | null>(null);

  // State Machine for the Game Logic
  const [targetIndex, setTargetIndex] = useState(0);
  const [isReleased, setIsReleased] = useState(true); // Forces user to open hand between pinches
  const [repsCompleted, setRepsCompleted] = useState(0);

  // Dedicated Audio Context for discrete notes (bypasses the continuous sweep engine)
  const synthCtx = useRef<AudioContext | null>(null);

  const playNote = useCallback((freq: number) => {
    if (!synthCtx.current) synthCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = synthCtx.current.createOscillator();
    const gain = synthCtx.current.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, synthCtx.current.currentTime);

    gain.gain.setValueAtTime(0, synthCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, synthCtx.current.currentTime + 0.05); // Quick fade in (no pop)
    gain.gain.exponentialRampToValueAtTime(0.001, synthCtx.current.currentTime + 0.5); // Smooth decay

    osc.connect(gain);
    gain.connect(synthCtx.current.destination);
    osc.start();
    osc.stop(synthCtx.current.currentTime + 0.5);
  }, []);

  const handleStart = () => {
    if (!synthCtx.current) synthCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    synthCtx.current.resume();
    setExerciseState('RUNNING');
  };

  const handleExit = () => {
    if (repsCompleted > 0 && onSessionComplete) onSessionComplete(repsCompleted * 10);
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
          const landmarks = results.multiHandLandmarks[0];

          const calcDist3D = (p1: any, p2: any) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));

          const thumb = landmarks[THUMB_TIP];

          // Use functional state updates to ensure we have the absolute latest state
          setTargetIndex((prevTarget) => {
            setIsReleased((prevReleased) => {

              // 1. Check for Release Phase (Anti-Cheat)
              if (!prevReleased) {
                // Check if thumb is far away from ALL fingers
                const isFarFromAll = FINGER_TIPS.every(tipIdx => calcDist3D(thumb, landmarks[tipIdx]) > RELEASE_THRESHOLD);
                if (isFarFromAll) return true; // Hand is open, release locked state
                return false; // Still locked
              }

              // 2. Check for Pinch Phase
              if (prevReleased) {
                const currentTargetLandmark = FINGER_TIPS[prevTarget];
                const distToTarget = calcDist3D(thumb, landmarks[currentTargetLandmark]);

                if (distToTarget < PINCH_THRESHOLD) {
                  playNote(NOTES[prevTarget]);

                  // Advance logic
                  if (prevTarget === 3) {
                    setRepsCompleted(r => r + 1);
                    return false; // Lock release state, next frame target resets
                  }
                  return false; // Lock release state
                }
              }
              return prevReleased;
            });

            // Update Target if we just scored a pinch
            return isReleased ? prevTarget : (prevTarget === 3 ? 0 : prevTarget + 1);
          });

        } else {
          setIsTracked(false);
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
    return () => { if (handsModel) handsModel.close(); cancelAnimationFrame(animationFrameId); };
  }, [exerciseState, playNote, isReleased]); // React dependencies managed carefully

  return (
    <Box w="100%" maw={900} mx="auto" c="carbonBlack.9">
      <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: '1px solid var(--mantine-color-carbonBlack-2)' }}>
        <Title order={2} fw={600}>Sequential Finger Opposition</Title>
        <button onClick={handleExit} className="px-4 py-2 bg-carbonBlack-100 text-carbonBlack-800 rounded-md hover:bg-carbonBlack-200 transition-colors text-sm font-medium">
          Exit to Menu
        </button>
      </Group>

      {exerciseState === 'IDLE' ? (
        <Box bg="white" p="xl" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-carbonBlack-2)' }} ta="center">
          <Title order={4} mb="sm">Calibration</Title>
          <Text size="sm" c="carbonBlack.6" mb="xl">Ensure your hand is clearly visible in the camera. Pinch your thumb to each finger sequentially.</Text>
          <button onClick={handleStart} className="w-full max-w-xs rounded-md bg-primary-500 text-brandWhite px-6 py-3 font-semibold hover:bg-primary-600 transition-colors">
            Start Exercise
          </button>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Box>
            <CameraMirror
              videoRef={videoRef}
              onReady={() => setIsCamReady(true)}
              onError={(err) => setCamError(err)}
            />

            {camError ? (
              <Box mt="md" p="md" bg="dangerRed.0" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-dangerRed-2)' }}>
                <Text size="sm" fw={600} c="dangerRed.9">
                  {camError} Please check browser permissions.
                </Text>
              </Box>
            ) : (
              <Box mt="md" p="md" bg={isTracked ? 'successGreen.0' : 'dangerRed.0'} style={{ borderRadius: 'var(--mantine-radius-md)', border: `1px solid var(--mantine-color-${isTracked ? 'successGreen' : 'dangerRed'}-2)` }}>
                <Text size="sm" fw={600} c={isTracked ? 'successGreen.9' : 'dangerRed.9'}>
                  {isTracked ? 'Subject Tracked successfully' : 'Awaiting Subject...'}
                </Text>
              </Box>
            )}
          </Box>

          <Box bg="white" p="xl" style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-carbonBlack-2)' }}>
            <Title order={6} tt="uppercase" lts="0.1em" c="carbonBlack.5" mb="xl">Current Target</Title>

            <Group justify="center" gap="xl" mb="xl2">
              {['Index', 'Middle', 'Ring', 'Pinky'].map((finger, idx) => {
                const isActive = targetIndex === idx;
                const isPassed = targetIndex > idx;

                return (
                  <Box key={finger} ta="center" style={{ opacity: isActive || isPassed ? 1 : 0.3, transition: 'all 0.3s' }}>
                    <RingProgress
                      size={60}
                      thickness={6}
                      roundCaps
                      sections={[{ value: isActive ? (isReleased ? 50 : 100) : (isPassed ? 100 : 0), color: 'primary.5' }]}
                      label={
                        <Center>
                          {isPassed ? <Text fw={700} c="primary.5">✓</Text> : <Text fw={700} size="xs" c="carbonBlack.7">{idx + 1}</Text>}
                        </Center>
                      }
                    />
                    <Text size="xs" mt="xs" fw={isActive ? 600 : 400}>{finger}</Text>
                  </Box>
                );
              })}
            </Group>

            <Box p="md" bg="carbonBlack.0" style={{ borderRadius: 'var(--mantine-radius-md)' }} ta="center">
              <Text size="xs" tt="uppercase" fw={600} c="carbonBlack.5" mb="xs">Instructions</Text>
              <Text size="sm" fw={500} c={!isReleased ? 'warningAmber.8' : 'carbonBlack.9'}>
                {!isReleased ? 'Open your hand completely to reset!' : `Pinch Thumb to ${['Index', 'Middle', 'Ring', 'Pinky'][targetIndex]}`}
              </Text>
            </Box>

            <Group justify="space-between" mt="xl" pt="md" style={{ borderTop: '1px solid var(--mantine-color-carbonBlack-1)' }}>
              <Text size="sm" c="carbonBlack.6">Completed Reps:</Text>
              <Text size="xl" fw={700} c="primary.6" ff="monospace">{repsCompleted}</Text>
            </Group>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
}