import { useRef, useCallback, useState } from 'react';

const makeDistortionCurve = (amount = 5) => {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    // Tanh gives warm analog saturation
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
};

export const useAudioEngine = () => {
  const audioCtx = useRef<AudioContext | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);
  const cvNode = useRef<AudioWorkletNode | null>(null);
  const hpfNodeRef = useRef<BiquadFilterNode | null>(null);
  const lpfNodeRef = useRef<BiquadFilterNode | null>(null);
  
  // NEW: Refs for our Parallel Dry/Wet Mix
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);

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
      const masterGain = audioCtx.current.createGain();
      
      // Create our split paths
      const dryGain = audioCtx.current.createGain();
      const wetGain = audioCtx.current.createGain();

      const supportsWorklet = !!audioCtx.current.audioWorklet && typeof AudioWorkletNode !== 'undefined';

      hpfNodeRef.current = hpfNode;
      lpfNodeRef.current = lpfNode;
      dryGainRef.current = dryGain;
      wetGainRef.current = wetGain;

      sourceNode.current.buffer = audioBuffer;
      sourceNode.current.loop = true;
      
      // Setup Distortion
      waveShaper.curve = makeDistortionCurve(5);
      waveShaper.oversample = '4x';

      // Setup Filters
      hpfNode.type = 'highpass'; hpfNode.Q.value = 0.7071; hpfNode.frequency.value = 0;
      lpfNode.type = 'lowpass'; lpfNode.Q.value = 0.7071; lpfNode.frequency.value = 0;
      masterGain.gain.value = 0.8;

      // INITIAL ROUTING STATE: Fist is closed (0.0), so Dry is 0, Wet is active but volume reduced to match
      dryGain.gain.value = 0.0;
      wetGain.gain.value = 0.6; // Reduced from 1.0 because distortion naturally increases loudness

      // --- PARALLEL ROUTING ---
      
      // Path 1: Clean Signal -> Dry Gain -> Filters
      sourceNode.current.connect(dryGain);
      dryGain.connect(hpfNode);
      
      // Path 2: Distorted Signal -> Wet Gain -> Filters
      sourceNode.current.connect(waveShaper);
      waveShaper.connect(wetGain);
      wetGain.connect(hpfNode);

      // --- END PARALLEL ROUTING ---

      hpfNode.connect(lpfNode);
      lpfNode.connect(masterGain);
      masterGain.connect(audioCtx.current.destination);

      if (supportsWorklet) {
        await audioCtx.current.audioWorklet.addModule('/cv-processor.js');
        cvNode.current = new AudioWorkletNode(audioCtx.current, 'cv-processor', { numberOfOutputs: 2 });
        cvNode.current.connect(lpfNode.frequency, 0);
        cvNode.current.connect(hpfNode.frequency, 1);
      } else {
        lpfNode.frequency.value = 2000;
        hpfNode.frequency.value = 1000;
      }

      sourceNode.current.start();
      await audioCtx.current.suspend();
      setIsAudioLoaded(true);
    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
  }, []);

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
    // Clamp the value just to be safe
    const safeValue = Math.max(0, Math.min(1, value));

    // NEW: Handle the crossfade on the main thread
    if (audioCtx.current && dryGainRef.current && wetGainRef.current) {
      const now = audioCtx.current.currentTime;
      
      // Equal-power crossfade math. 
      // As safeValue approaches 1 (Hand Open): Dry goes to 100%, Wet goes to 0%
      const dryLevel = Math.sin(safeValue * (Math.PI / 2));
      const wetLevel = Math.cos(safeValue * (Math.PI / 2)) * 0.6; // Keep the 0.6 limiter on wet volume
      
      dryGainRef.current.gain.setTargetAtTime(dryLevel, now, 0.03);
      wetGainRef.current.gain.setTargetAtTime(wetLevel, now, 0.03);
    }

    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_RATIO', value: safeValue });
      return;
    }

    // Fallback logic
    if (!audioCtx.current || !hpfNodeRef.current || !lpfNodeRef.current) return;
    fallbackTargetRef.current = safeValue;
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
    const nowFallback = audioCtx.current.currentTime;
    lpfNodeRef.current.frequency.setTargetAtTime(lpfFreq, nowFallback, 0.03);
    hpfNodeRef.current.frequency.setTargetAtTime(hpfFreq, nowFallback, 0.03);
  }, []);

  const setTrackingStatus = useCallback((status: boolean) => {
    if (cvNode.current) {
      cvNode.current.port.postMessage({ type: 'SET_TRACKING', value: status });
      return;
    }
    fallbackTrackedRef.current = status;
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceNode.current) { try { sourceNode.current.stop(); } catch (e) { } sourceNode.current.disconnect(); }
    if (cvNode.current) cvNode.current.disconnect();
    cvNode.current = null;
    hpfNodeRef.current = null;
    lpfNodeRef.current = null;
    dryGainRef.current = null;
    wetGainRef.current = null;
    fallbackRatioRef.current = 0;
    fallbackTargetRef.current = 0;
    fallbackTrackedRef.current = false;
    if (audioCtx.current) { audioCtx.current.close(); audioCtx.current = null; }
    setIsAudioLoaded(false);
  }, []);

  return { initAudio, playAudio, pauseAudio, updateFilter, setTrackingStatus, stopAudio, isAudioLoaded };
};