// Celebration and achievement insights
import { getEventName, getUserName } from '../utils/insightUtils';
import { getSettledEvents, getTotalOutstanding } from '../utils/dataAnalysis';

export const generateCelebrationInsights = (events, users) => {
  const insights = [];
  
  // Settlement celebrations
  events.forEach(event => {
    const eventName = getEventName(event);
    const remaining = event.remainingBalance || 0;
    const total = event.totalAmount || 0;
    
    if (remaining === 0 && total > 0) {
      insights.push(`🎉 **${eventName}** is fully settled! **$${total.toLocaleString()}** total`);
    }
  });
  
  return insights;
};

export const generateProgressInsights = (events, users) => {
  const insights = [];
  const totalEvents = events.length;
  const settledEvents = getSettledEvents(events);
  const totalOwed = getTotalOutstanding(events);
  
  // Progress tracking
  if (settledEvents.length > 0) {
    const settleRate = Math.round((settledEvents.length / totalEvents) * 100);
    if (settleRate >= 80) {
      insights.push(`⭐ Excellent! You've settled **${settleRate}%** of your events - you're a settlement superstar!`);
    } else if (settleRate >= 50) {
      insights.push(`📈 Nice progress! **${settleRate}%** of events settled - you're on the right track!`);
    } else {
      insights.push(`🎯 You're building good expense habits! **${settleRate}%** settled so far`);
    }
  }
  
  // Summary insights
  if (totalOwed > 0) {
    insights.push(`📊 **$${totalOwed.toLocaleString()}** total outstanding across **${totalEvents - settledEvents.length}** events`);
  }
  
  if (settledEvents.length > 0) {
    insights.push(`✅ **${settledEvents.length}** of **${totalEvents}** events fully settled`);
  }
  
  // Milestone celebrations
  if (totalEvents >= 10) {
    insights.push(`🏆 Milestone achieved! **${totalEvents}** events tracked - you're a expense tracking champion!`);
  }
  
  return insights;
};

export const generateRecognitionInsights = (events, users) => {
  const insights = [];
  
  // Payment completion insights
  const fullyPaidParticipants = [];
  events.forEach(event => {
    if (event.participants) {
      event.participants.forEach(p => {
        if (typeof p === 'object' && p.user) {
          const amountPaid = p.amountPaid || 0;
          const totalAmount = event.totalAmount || 0;
          const share = event.participants.length > 0 ? totalAmount / event.participants.length : 0;
          if (amountPaid >= share && share > 0) {
            const userId = p.user._id || p.user;
            if (!fullyPaidParticipants.includes(userId)) {
              fullyPaidParticipants.push(userId);
            }
          }
        }
      });
    }
  });
  
  if (fullyPaidParticipants.length > 0) {
    const paidUsers = fullyPaidParticipants.map(userId => {
      const user = users.find(u => u._id === userId);
      return user ? getUserName(user) : 'Someone';
    });
    
    if (paidUsers.length === 1) {
      insights.push(`👏 Way to go **${paidUsers[0]}**! Always paying on time!`);
    } else if (paidUsers.length <= 3) {
      insights.push(`🌟 Shoutout to **${paidUsers.join(', ')}** for staying on top of payments!`);
    } else {
      insights.push(`🎊 Amazing! **${paidUsers.length}** people are keeping up with their payments!`);
    }
  }
  
  return insights;
};