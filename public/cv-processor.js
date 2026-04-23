class CVProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.targetRatio = 0;
    this.currentRatio = 0;
    this.isTracked = false;

    this.port.onmessage = (event) => {
      if (event.data.type === 'SET_RATIO') this.targetRatio = event.data.value;
      else if (event.data.type === 'SET_TRACKING') this.isTracked = event.data.value;
    };
  }

  process(inputs, outputs) {
    // We will use Output 0 for the Low-Pass CV, and Output 1 for the High-Pass CV
    const outLPF = outputs[0];
    const outHPF = outputs[1];

    const maxRise = 0.0001;  
    const maxFall = 0.00005; 
    const lostDecay = 0.00002;

    const actualTarget = this.isTracked ? this.targetRatio : 0.0;

    for (let i = 0; i < outLPF[0].length; ++i) {
      const delta = actualTarget - this.currentRatio;

      if (this.isTracked) {
        if (delta > 0) this.currentRatio += Math.min(maxRise, delta);
        else this.currentRatio += Math.max(-maxFall, delta);
      } else {
        this.currentRatio += Math.max(-lostDecay, delta);
      }

      // Map CV to Frequencies
      // LPF: Opens upwards from 2000Hz to 20000Hz exponentially
      const lpfFreq = 2000 * Math.pow(10, this.currentRatio); 
      // HPF: Opens downwards from 1000Hz down to 20Hz exponentially
      const hpfFreq = 1000 * Math.pow(0.02, this.currentRatio); 

      // Send to all channels of their respective outputs
      for (let c = 0; c < outLPF.length; ++c) outLPF[c][i] = lpfFreq;
      if (outHPF) {
        for (let c = 0; c < outHPF.length; ++c) outHPF[c][i] = hpfFreq;
      }
    }
    return true; 
  }
}
registerProcessor('cv-processor', CVProcessor);