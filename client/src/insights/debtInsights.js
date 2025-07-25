// Debt and payment related insights
import { getEventName, getOwnerName, getParticipantName, getParticipantShare } from '../utils/insightUtils';
import { calculateMutualDebts, formatCurrency } from '../utils/debtUtils';

export const generateDebtInsights = (events, users) => {
  const insights = [];
  
  // Outstanding debts
  events.forEach(event => {
    const eventName = getEventName(event);
    const remaining = event.remainingBalance || 0;
    
    if (remaining > 0) {
      const ownerName = getOwnerName(event, users);
      insights.push(`💸 **$${remaining.toLocaleString()}** still owed to **${ownerName}** for **${eventName}**`);
      
      // Individual participant debts
      if (event.participants && event.participants.length > 0) {
        event.participants.forEach(participant => {
          if (typeof participant === 'object' && participant.user) {
            const participantName = getParticipantName(participant, users);
            const amountPaid = participant.amountPaid || 0;
            const share = getParticipantShare(event);
            const owes = Math.max(0, share - amountPaid);
            
            if (owes > 0 && participant.user._id !== event.owner) {
              insights.push(`💳 **${participantName}** owes **$${owes.toLocaleString()}** for **${eventName}**`);
            }
          }
        });
      }
    }
  });
  
  return insights;
};

export const generatePaymentInsights = (events, users) => {
  const insights = [];
  
  events.forEach(event => {
    const eventName = getEventName(event);
    
    if (event.participants && event.participants.length > 0) {
      event.participants.forEach(participant => {
        if (typeof participant === 'object' && participant.user) {
          const participantName = getParticipantName(participant, users);
          const amountPaid = participant.amountPaid || 0;
          const share = getParticipantShare(event);
          
          if (amountPaid > share) {
            const overpaid = amountPaid - share;
            insights.push(`💰 **${participantName}** overpaid **$${overpaid.toLocaleString()}** for **${eventName}**`);
          } else if (amountPaid > 0 && amountPaid < share) {
            const remaining = share - amountPaid;
            insights.push(`🕗 **${participantName}** still owes **$${remaining.toLocaleString()}** for **${eventName}**`);
          }
        }
      });
    }
  });
  
  return insights;
};

// New function: Generate member relationship insights
export const generateMemberRelationshipInsights = (events, users) => {
  const insights = [];
  
  // Generate insights for interesting member relationships
  users.forEach(user => {
    const userEvents = events.filter(event => 
      event.participants?.some(p => p.user?._id === user._id) ||
      event.owner === user._id
    );
    
    if (userEvents.length === 0) return;
    
    // Find the most frequent debt partner
    const debtCounts = {};
    userEvents.forEach(event => {
      if (event.owner === user._id) {
        // Count participants in events user owns
        event.participants?.forEach(p => {
          if (p.user?._id !== user._id) {
            debtCounts[p.user._id] = (debtCounts[p.user._id] || 0) + 1;
          }
        });
      } else if (event.participants?.some(p => p.user?._id === user._id)) {
        // Count events user participates in
        const ownerId = event.owner;
        if (ownerId !== user._id) {
          debtCounts[ownerId] = (debtCounts[ownerId] || 0) + 1;
        }
      }
    });
    
    const mostFrequentPartner = Object.entries(debtCounts)
      .sort(([,a], [,b]) => b - a)[0];
      
    if (mostFrequentPartner && mostFrequentPartner[1] >= 3) {
      const partnerId = mostFrequentPartner[0];
      const partnerName = users.find(u => u._id?.toString() === partnerId?.toString())?.name || 'Unknown';
      const eventCount = mostFrequentPartner[1];
      
      // Only add insight if we found the partner name
      if (partnerName !== 'Unknown') {
        insights.push(`🤝 **${user.name}** and **${partnerName}** frequently share expenses - involved in **${eventCount}** events together!`);
      }
    }
  });
  
  return insights;
};