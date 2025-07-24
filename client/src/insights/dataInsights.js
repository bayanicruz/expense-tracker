// Data-driven personalized insights
import { 
  getAverageEventFrequency, 
  categorizeEvents, 
  getAverageGroupSize, 
  getQuickPayers, 
  calculateFairnessScore,
  getRecentEvents,
  getAverageCost,
  getSettledEvents
} from '../utils/dataAnalysis';

export const generateFrequencyInsights = (events, users) => {
  const insights = [];
  const totalEvents = events.length;
  
  if (totalEvents >= 3) {
    const avgDaysApart = getAverageEventFrequency(events);
    if (avgDaysApart <= 7) {
      insights.push(`🔥 You're on fire! Creating events every **${Math.round(avgDaysApart)}** days on average!`);
    } else if (avgDaysApart <= 30) {
      insights.push(`📅 Great consistency! You create new events every **${Math.round(avgDaysApart)}** days!`);
    }
  }
  
  return insights;
};

export const generateCategoryInsights = (events, users) => {
  const insights = [];
  const eventCategories = categorizeEvents(events);
  
  if (eventCategories.dining >= 2) {
    insights.push(`🍽️ You're a social dining expert with **${eventCategories.dining}** restaurant events tracked!`);
  }
  if (eventCategories.shopping >= 2) {
    insights.push(`🛍️ Shopping smart! You've organized **${eventCategories.shopping}** shopping expenses!`);
  }
  if (eventCategories.travel >= 1) {
    insights.push(`✈️ Adventure organizer! You're tracking travel expenses like a pro!`);
  }
  
  return insights;
};

export const generateGroupInsights = (events, users) => {
  const insights = [];
  const avgGroupSize = getAverageGroupSize(events);
  const totalUsers = users.length;
  
  // Group size insights
  if (avgGroupSize >= 4) {
    insights.push(`👫 Big group coordinator! You manage expenses for **${Math.round(avgGroupSize)}** people on average!`);
  } else if (avgGroupSize >= 2) {
    insights.push(`🤝 Perfect pair coordination! You and your **${Math.round(avgGroupSize - 1)}** friend(s) have great expense sharing!`);
  }
  
  // Teamwork insights
  if (totalUsers > 1) {
    insights.push(`👥 Great teamwork! You're managing expenses with **${totalUsers}** people`);
  }
  
  // Group dynamics insights
  const ownerCounts = {};
  events.forEach(event => {
    const ownerId = typeof event.owner === 'object' ? event.owner._id : event.owner;
    ownerCounts[ownerId] = (ownerCounts[ownerId] || 0) + 1;
  });
  
  if (Object.keys(ownerCounts).length > 1) {
    insights.push(`🤝 Everyone's contributing! Multiple people are hosting events - true teamwork!`);
  }
  
  return insights;
};

export const generatePerformanceInsights = (events, users) => {
  const insights = [];
  const quickPayers = getQuickPayers(events, users);
  const fairnessScore = calculateFairnessScore(events);
  const avgCost = getAverageCost(events);
  
  // Payment speed insights
  if (quickPayers.length > 0) {
    insights.push(`⚡ Lightning fast! **${quickPayers.join(', ')}** settle expenses quickly!`);
  }
  
  // Fairness insights
  if (fairnessScore >= 0.8) {
    insights.push(`⚖️ Fairness champion! Your expense splits are **${Math.round(fairnessScore * 100)}%** equitable!`);
  }
  
  // Event value insights
  if (avgCost >= 100) {
    insights.push(`💎 High-value event manager! You coordinate **$${Math.round(avgCost)}** average expenses confidently!`);
  } else if (avgCost >= 25) {
    insights.push(`💰 Smart budgeting! Your **$${Math.round(avgCost)}** average events are perfectly sized!`);
  }
  
  return insights;
};

export const generateActivityInsights = (events, users) => {
  const insights = [];
  const recentEvents = getRecentEvents(events);
  const totalEvents = events.length;
  
  // Recent activity momentum
  if (recentEvents.length >= 2) {
    insights.push(`🚀 You're building momentum with **${recentEvents.length}** events this week!`);
  }
  
  if (recentEvents.length > 0) {
    insights.push(`🕒 **${recentEvents.length}** event${recentEvents.length !== 1 ? 's' : ''} created this week`);
  }
  
  // Settlement efficiency
  const settledRecently = events.filter(e => {
    const isSettled = (e.remainingBalance || 0) === 0;
    const isRecent = new Date(e.updatedAt || e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return isSettled && isRecent;
  }).length;
  
  if (settledRecently > 0) {
    insights.push(`✨ Settlement superstar! **${settledRecently}** event${settledRecently !== 1 ? 's' : ''} settled this week!`);
  }
  
  // Organization insights
  if (totalEvents >= 5) {
    insights.push(`🎉 Impressive organization! You're tracking **${totalEvents}** events like a pro!`);
  } else if (totalEvents >= 2) {
    insights.push(`📋 You're staying organized with **${totalEvents}** events tracked!`);
  }
  
  return insights;
};