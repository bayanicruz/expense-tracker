// Main insight orchestrator - combines all insight types
import { generateDebtInsights, generatePaymentInsights, generateMemberRelationshipInsights } from './debtInsights';
import { generateMutualDebtInsights, generateBalancePatternInsights, generateDebtWarningInsights } from './memberBalanceInsights';
import { generateCelebrationInsights, generateProgressInsights, generateRecognitionInsights } from './celebrationInsights';
import { generateFrequencyInsights, generateCategoryInsights, generateGroupInsights, generatePerformanceInsights, generateActivityInsights } from './dataInsights';
import { generateEncouragementInsights, generateTrendInsights, generateParticipationInsights } from './encouragementInsights';
import { shuffleArray } from '../utils/insightUtils';

export const generateAllInsights = (events, users) => {
  const insights = [];
  
  // Collect insights from all generators
  insights.push(...generateDebtInsights(events, users));
  insights.push(...generatePaymentInsights(events, users));
  insights.push(...generateMemberRelationshipInsights(events, users));
  
  // New member balance insights
  insights.push(...generateMutualDebtInsights(events, users));
  insights.push(...generateBalancePatternInsights(events, users));
  insights.push(...generateDebtWarningInsights(events, users));
  
  insights.push(...generateCelebrationInsights(events, users));
  insights.push(...generateProgressInsights(events, users));
  insights.push(...generateRecognitionInsights(events, users));
  insights.push(...generateFrequencyInsights(events, users));
  insights.push(...generateCategoryInsights(events, users));
  insights.push(...generateGroupInsights(events, users));
  insights.push(...generatePerformanceInsights(events, users));
  insights.push(...generateActivityInsights(events, users));
  insights.push(...generateEncouragementInsights(events, users));
  insights.push(...generateTrendInsights(events, users));
  insights.push(...generateParticipationInsights(events, users));
  
  // Shuffle for variety
  return shuffleArray(insights);
};