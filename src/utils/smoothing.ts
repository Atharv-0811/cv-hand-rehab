export class ExponentialSmoothing {
  private previousValue: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.15) {
    this.alpha = alpha;
  }

  // Formula: St = α * Xt + (1 - α) * St-1
  smooth(newValue: number): number {
    if (this.previousValue === null) {
      this.previousValue = newValue;
      return newValue;
    }
    const smoothed = this.alpha * newValue + (1 - this.alpha) * this.previousValue;
    this.previousValue = smoothed;
    return smoothed;
  }
}