// Encouraging and motivational insights
import { getTotalMoney, getTotalOutstanding, getHighestCostEvent } from '../utils/dataAnalysis';
import { getEventName, getUserName } from '../utils/insightUtils';

export const generateEncouragementInsights = (events, users) => {
  const insights = [];
  const totalEvents = events.length;
  const totalMoney = getTotalMoney(events);
  const totalOwed = getTotalOutstanding(events);
  
  // Financial responsibility insights
  if (totalMoney > 0) {
    insights.push(`💪 You're managing **$${totalMoney.toLocaleString()}** responsibly across all events!`);
  }
  
  // Positive framing for debt situations
  if (totalOwed > 0) {
    insights.push(`💎 Transparency builds trust! You're keeping **$${totalOwed.toLocaleString()}** worth of expenses clear and organized`);
  }
  
  // Consistency and habit-building insights
  if (totalEvents > 0) {
    insights.push(`✨ You're building great financial habits by tracking expenses consistently!`);
  }
  
  return insights;
};

export const generateTrendInsights = (events, users) => {
  const insights = [];
  const highestCostEvent = getHighestCostEvent(events);
  const avgCost = events.length > 0 ? getTotalMoney(events) / events.length : 0;
  
  // Cost insights & trends
  if (highestCostEvent && (highestCostEvent.totalAmount || 0) > 0) {
    const eventName = getEventName(highestCostEvent);
    insights.push(`💡 **${eventName}** was your most expensive at **$${(highestCostEvent.totalAmount || 0).toLocaleString()}**`);
  }
  
  // Average cost insight
  if (avgCost > 0) {
    insights.push(`📈 Average event cost is **$${avgCost.toLocaleString()}**`);
  }
  
  return insights;
};

export const generateParticipationInsights = (events, users) => {
  const insights = [];
  
  // Most active participant insight
  const participantCounts = {};
  events.forEach(event => {
    if (event.participants) {
      event.participants.forEach(p => {
        const userId = typeof p === 'object' ? (p.user?._id || p.user) : p;
        participantCounts[userId] = (participantCounts[userId] || 0) + 1;
      });
    }
  });
  
  if (Object.keys(participantCounts).length > 0) {
    const mostActiveUserId = Object.keys(participantCounts).reduce((a, b) => 
      participantCounts[a] > participantCounts[b] ? a : b
    );
    
    if (participantCounts[mostActiveUserId] > 1) {
      const mostActiveUser = users.find(u => u._id === mostActiveUserId);
      const userName = mostActiveUser ? getUserName(mostActiveUser) : 'Someone';
      insights.push(`🏆 **${userName}** participates in **${participantCounts[mostActiveUserId]}** events`);
    }
  }
  
  return insights;
};