export interface CallProvider {
  initiateCall(fromName: string, agentPhone: string): Promise<{
    success: boolean;
    callId: string;
    status: string;
  }>;
}

export class MockCallProvider implements CallProvider {
  async initiateCall(fromName: string, agentPhone: string) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simulate successful call connection trigger
    return {
      success: true,
      callId: `mock_sid_${Math.random().toString(36).substring(2, 10)}`,
      status: 'ringing',
    };
  }
}
