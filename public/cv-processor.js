class CVProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRatio = 0;
    this.currentRatio = 0;
    this.isTracked = false; // Start false so it's muffled initially

    this.port.onmessage = (event) => {
      if (event.data.type === 'SET_RATIO') {
        this.targetRatio = event.data.value;
      } else if (event.data.type === 'SET_TRACKING') {
        this.isTracked = event.data.value;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0]; 
    
    // Musical Slew Rates (Max change per audio sample)
    const maxRise = 0.0001;    // Fast attack when hand opens
    const maxFall = 0.00005;   // Slightly slower decay when hand closes
    const lostDecay = 0.00002; // Very slow, gentle fade-out when hand leaves the screen

    const actualTarget = this.isTracked ? this.targetRatio : 0.0;

    for (let i = 0; i < output[0].length; ++i) {
      const delta = actualTarget - this.currentRatio;

      if (this.isTracked) {
        // Normal tracking mode: Apply slew limiting to prevent zipper noise
        if (delta > 0) {
          this.currentRatio += Math.min(maxRise, delta);
        } else {
          this.currentRatio += Math.max(-maxFall, delta);
        }
      } else {
        // Watchdog mode: Hand is gone, smoothly ramp down to 0
        this.currentRatio += Math.max(-lostDecay, delta);
      }

      // Exponential frequency mapping
      const frequency = 300 * Math.pow(50, this.currentRatio);

      for (let channel = 0; channel < output.length; ++channel) {
        output[channel][i] = frequency;
      }
    }
    
    return true; 
  }
}

registerProcessor('cv-processor', CVProcessor);