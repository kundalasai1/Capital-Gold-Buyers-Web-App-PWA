export interface RateProvider {
  fetchRates(): Promise<{
    gold24k: number;
    gold22k: number;
    gold18k: number;
    silver: number;
  }>;
}

export class MockRateProvider implements RateProvider {
  async fetchRates() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Base market rates with minor random fluctuations (+/- ₹25 per gram)
    const variance = (Math.random() - 0.5) * 50;
    return {
      gold24k: +(7250 + variance).toFixed(2),
      gold22k: +(6680 + variance * 0.916).toFixed(2),
      gold18k: +(5440 + variance * 0.75).toFixed(2),
      silver: +(95 + variance * 0.01).toFixed(2),
    };
  }
}
