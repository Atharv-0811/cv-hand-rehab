import { useRef, useCallback, useState } from 'react';

const makeDistortionCurve = (amount = 20) => {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

export const useAudioEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const cvNode = useRef<AudioWorkletNode | null>(null);
  const hpfNodeRef = useRef<BiquadFilterNode | null>(null);
  const lpfNodeRef = useRef<BiquadFilterNode | null>(null);
  const fallbackRatioRef = useRef(0);
  const fallbackTargetRef = useRef(0);
  const fallbackTrackedRef = useRef(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioCtx.current) return;
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      const response = await fetch('/loop.mp3'); 
      const audioBuffer = await audioCtx.current.decodeAudioData(await response.arrayBuffer());

      sourceNode.current = audioCtx.current.createBufferSource();
      const waveShaper = audioCtx.current.createWaveShaper();
      const hpfNode = audioCtx.current.createBiquadFilter();
      const lpfNode = audioCtx.current.createBiquadFilter();
      const gainNode = audioCtx.current.createGain();
      const supportsWorklet = !!audioCtx.current.audioWorklet && typeof AudioWorkletNode !== 'undefined';

      hpfNodeRef.current = hpfNode;
      lpfNodeRef.current = lpfNode;

      sourceNode.current.buffer = audioBuffer;
      sourceNode.current.loop = true;
      waveShaper.curve = makeDistortionCurve(10); 
      waveShaper.oversample = '2x';
      
      hpfNode.type = 'highpass'; hpfNode.Q.value = 1; hpfNode.frequency.value = 0; 
      lpfNode.type = 'lowpass'; lpfNode.Q.value = 1; lpfNode.frequency.value = 0; 
      gainNode.gain.value = 0.8; 

      sourceNode.current.connect(waveShaper);
      waveShaper.connect(hpfNode);
      hpfNode.connect(lpfNode);
      lpfNode.connect(gainNode);
      gainNode.connect(audioCtx.current.destination);

      if (supportsWorklet) {
        await audioCtx.current.audioWorklet.addModule('/cv-processor.js');
        cvNode.current = new AudioWorkletNode(audioCtx.current, 'cv-processor', { numberOfOutputs: 2 });
        cvNode.current.connect(lpfNode.frequency, 0);
        cvNode.current.connect(hpfNode.frequency, 1);
      } else {
        // Fallback for browsers without AudioWorklet support.
        lpfNode.frequency.value = 2000;
        hpfNode.frequency.value = 1000;
      }

      sourceNode.current.start(); 
      // NEW: Immediately pause the audio context so it waits for the user
      await audioCtx.current.suspend();
      setIsAudioLoaded(true);
    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
  }, []);

  // NEW: Explicit Play/Pause controls
  const playAudio = useCallback(async () => {
    if (audioCtx.current && audioCtx.current.state === 'suspended') {
      await audioCtx.current.resume();
    }
  }, []);

  const pauseAudio = useCallback(async () => {
    if (audioCtx.current && audioCtx.current.state === 'running') {
      await audioCtx.current.suspend();
    }
  }, []);

  const updateFilter = useCallback((value: number) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_RATIO', value });
      return;
    }

    if (!audioCtx.current || !hpfNodeRef.current || !lpfNodeRef.current) return;
    fallbackTargetRef.current = Math.max(0, Math.min(1, value));
    const delta = fallbackTargetRef.current - fallbackRatioRef.current;
    const maxRise = 0.04;
    const maxFall = 0.02;
    const lostDecay = 0.01;

    if (fallbackTrackedRef.current) {
      fallbackRatioRef.current += delta > 0 ? Math.min(maxRise, delta) : Math.max(-maxFall, delta);
    } else {
      fallbackRatioRef.current += Math.max(-lostDecay, delta);
    }

    const lpfFreq = 2000 * Math.pow(10, fallbackRatioRef.current);
    const hpfFreq = 1000 * Math.pow(0.02, fallbackRatioRef.current);
    const now = audioCtx.current.currentTime;
    lpfNodeRef.current.frequency.setTargetAtTime(lpfFreq, now, 0.03);
    hpfNodeRef.current.frequency.setTargetAtTime(hpfFreq, now, 0.03);
  }, []);

  const setTrackingStatus = useCallback((status: boolean) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_TRACKING', value: status });
      return;
    }
    fallbackTrackedRef.current = status;
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNode.current) { try { sourceNode.current.stop(); } catch(e) {} sourceNode.current.disconnect(); }
    if (cvNode.current) cvNode.current.disconnect();
    cvNode.current = null;
    hpfNodeRef.current = null;
    lpfNodeRef.current = null;
    fallbackRatioRef.current = 0;
    fallbackTargetRef.current = 0;
    fallbackTrackedRef.current = false;
    if (audioCtx.current) { audioCtx.current.close(); audioCtx.current = null; }
    setIsAudioLoaded(false);
  }, []);

  return { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded };
};