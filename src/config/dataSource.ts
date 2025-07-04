// Configuration for data source
// Set USE_MOCK_DATA to true to use fake data, false to use real Supabase data
export const USE_MOCK_DATA = false;

// Mock data generator for development/testing
export const generateMockData = () => {
  const mockLoans = [];
  const startDate = new Date(2023, 0, 1);
  const endDate = new Date();
  
  // Generate realistic decisions for mock data
  const decisions = ['accept', 'refuse'];
  
  for (let i = 0; i < 500; i++) {
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const defaultScore = Math.random();
    const refusalScore = Math.random();
    
    // Generate realistic historical decisions based on some logic
    const shouldRefuse = defaultScore > 0.7 || refusalScore > 0.6;
    const historicalDecision = Math.random() > 0.1 ? (shouldRefuse ? 'refuse' : 'accept') : decisions[Math.floor(Math.random() * decisions.length)];
    
    mockLoans.push({
      id: `loan-${i}`,
      created_at: randomDate.toISOString(),
      default_score: defaultScore,
      refusal_score: refusalScore,
      historical_decision: historicalDecision
    });
  }
  
  return mockLoans;
};