// Debt and payment related insights
import { getEventName, getOwnerName, getParticipantName, getParticipantShare } from '../utils/insightUtils';

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