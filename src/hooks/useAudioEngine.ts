import { useRef, useCallback, useState } from 'react';

export const useAudioEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const cvNode = useRef<AudioWorkletNode | null>(null);

  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioCtx.current) return;

    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    try {
      // 1. Load the Worklet file 
      await audioCtx.current.audioWorklet.addModule('/cv-processor.js');

      // 2. Fetch and decode the loop
      const response = await fetch('/loop.mp3');
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.current.decodeAudioData(arrayBuffer);

      // 3. Create our Nodes (filterNode is now a local variable!)
      const filterNode = audioCtx.current.createBiquadFilter();
      sourceNode.current = audioCtx.current.createBufferSource();
      const gainNode = audioCtx.current.createGain();

      // Instantiate our custom CV Worklet
      cvNode.current = new AudioWorkletNode(audioCtx.current, 'cv-processor');

      // 4. Configure Audio Nodes 
      sourceNode.current.buffer = audioBuffer;
      sourceNode.current.loop = true;

      // FIXED: Removed `.current` from filterNode!
      filterNode.type = 'lowpass';
      filterNode.Q.value = 2;
      filterNode.frequency.value = 0; // The worklet takes over from 0

      gainNode.gain.value = 0.8;

      // 5. The Audio Patching
      sourceNode.current.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.current.destination);

      // 6. The CV Patching: Worklet output -> Filter frequency
      cvNode.current.connect(filterNode.frequency);

      sourceNode.current.start();
      setIsAudioLoaded(true);

    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
  }, []);

  // Now we just message the Worklet, no more main-thread math
  const updateFilter = useCallback((value: number) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_RATIO', value });
    }
  }, []);

  // ADD THIS NEW FUNCTION:
  const setTrackingStatus = useCallback((status: boolean) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_TRACKING', value: status });
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNode.current) {
      try { sourceNode.current.stop(); } catch (e) { }
      sourceNode.current.disconnect();
    }
    if (cvNode.current) {
      cvNode.current.disconnect();
    }
    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
    }
    setIsAudioLoaded(false);
  }, []);

  return { initAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded };
};