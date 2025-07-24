// Data analysis functions for insights

export const getAverageEventFrequency = (events) => {
  if (events.length < 2) return 0;
  const dates = events.map(e => new Date(e.createdAt || e.date)).sort((a, b) => a - b);
  const totalDays = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24);
  return totalDays / (events.length - 1);
};

export const categorizeEvents = (events) => {
  const categories = { dining: 0, shopping: 0, travel: 0, entertainment: 0, other: 0 };
  
  events.forEach(event => {
    const name = (event.title || event.name || '').toLowerCase();
    if (name.includes('restaurant') || name.includes('dinner') || name.includes('lunch') || 
        name.includes('food') || name.includes('cafe') || name.includes('pizza')) {
      categories.dining++;
    } else if (name.includes('shop') || name.includes('store') || name.includes('mall') || 
               name.includes('grocery')) {
      categories.shopping++;
    } else if (name.includes('travel') || name.includes('trip') || name.includes('flight') || 
               name.includes('hotel') || name.includes('vacation')) {
      categories.travel++;
    } else if (name.includes('movie') || name.includes('concert') || name.includes('game') || 
               name.includes('party')) {
      categories.entertainment++;
    } else {
      categories.other++;
    }
  });
  
  return categories;
};

export const getAverageGroupSize = (events) => {
  if (events.length === 0) return 0;
  const total = events.reduce((sum, event) => sum + (event.participants?.length || 0), 0);
  return total / events.length;
};

export const getQuickPayers = (events, users) => {
  const quickPayerIds = new Set();
  
  events.forEach(event => {
    if (event.participants) {
      event.participants.forEach(p => {
        if (typeof p === 'object' && p.user) {
          const amountPaid = p.amountPaid || 0;
          const totalAmount = event.totalAmount || 0;
          const share = event.participants.length > 0 ? totalAmount / event.participants.length : 0;
          
          if (amountPaid >= share && share > 0) {
            quickPayerIds.add(p.user._id || p.user);
          }
        }
      });
    }
  });
  
  return Array.from(quickPayerIds).map(userId => {
    const user = users.find(u => u._id === userId);
    return user ? (user.name || user.username || 'Someone') : 'Someone';
  }).slice(0, 3);
};

export const calculateFairnessScore = (events) => {
  if (events.length === 0) return 0;
  
  let totalFairness = 0;
  let validEvents = 0;
  
  events.forEach(event => {
    if (event.participants && event.participants.length > 1) {
      const totalAmount = event.totalAmount || 0;
      const expectedShare = totalAmount / event.participants.length;
      const payments = event.participants.map(p => p.amountPaid || 0);
      
      const deviations = payments.map(payment => Math.abs(payment - expectedShare));
      const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
      const fairness = Math.max(0, 1 - (avgDeviation / expectedShare));
      
      totalFairness += fairness;
      validEvents++;
    }
  });
  
  return validEvents > 0 ? totalFairness / validEvents : 0;
};

export const getRecentEvents = (events, daysBack = 7) => {
  return events.filter(e => {
    const eventDate = new Date(e.createdAt || e.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return eventDate > cutoffDate;
  });
};

export const getSettledEvents = (events) => {
  return events.filter(e => (e.remainingBalance || 0) === 0);
};

export const getTotalOutstanding = (events) => {
  return events.reduce((sum, e) => sum + (e.remainingBalance || 0), 0);
};

export const getTotalMoney = (events) => {
  return events.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
};

export const getAverageCost = (events) => {
  if (events.length === 0) return 0;
  return getTotalMoney(events) / events.length;
};

export const getHighestCostEvent = (events) => {
  return events.reduce((max, event) => {
    const cost = event.totalAmount || 0;
    return cost > (max.totalAmount || 0) ? event : max;
  }, events[0]);
};