// Member balance and mutual debt insights
import { calculateMutualDebts } from '../utils/debtUtils';

export const generateMutualDebtInsights = (events, users) => {
  const insights = [];
  
  // Generate insights for each user's debt relationships
  users.forEach(user => {
    const userEvents = events.filter(event => 
      event.participants?.some(p => p.user?._id === user._id) ||
      event.owner === user._id
    );
    
    if (userEvents.length === 0) return;
    
    const mutualDebts = calculateMutualDebts(userEvents, user._id);
    
    // Insights about who owes the most to this user
    const topDebtor = mutualDebts
      .filter(debt => debt.owesToUser > 0)
      .sort((a, b) => b.owesToUser - a.owesToUser)[0];
      
    if (topDebtor && topDebtor.owesToUser > 0) {
      insights.push(`💰 **${topDebtor.memberName}** owes **${user.name}** the most: **$${topDebtor.owesToUser.toFixed(2)}**`);
    }
    
    // Insights about who this user owes the most to
    const topCreditor = mutualDebts
      .filter(debt => debt.userOwes > 0)
      .sort((a, b) => b.userOwes - a.userOwes)[0];
      
    if (topCreditor && topCreditor.userOwes > 0) {
      insights.push(`💳 **${user.name}** owes **${topCreditor.memberName}** the most: **$${topCreditor.userOwes.toFixed(2)}**`);
    }
    
    // Net balance insights
    const totalNetBalance = mutualDebts.reduce((sum, debt) => sum + debt.netAmount, 0);
    if (Math.abs(totalNetBalance) > 0.01) {
      if (totalNetBalance > 0) {
        insights.push(`📈 **${user.name}** is owed **$${totalNetBalance.toFixed(2)}** overall across all members`);
      } else {
        insights.push(`📉 **${user.name}** owes **$${Math.abs(totalNetBalance).toFixed(2)}** overall across all members`);
      }
    }
  });
  
  return insights;
};

export const generateBalancePatternInsights = (events, users) => {
  const insights = [];
  
  // Find members who always pay quickly
  const quickPayers = users.filter(user => {
    const userParticipations = events.flatMap(event => 
      event.participants?.filter(p => p.user?._id === user._id) || []
    );
    
    if (userParticipations.length < 2) return false;
    
    const hasAlwaysPaid = userParticipations.every(participation => {
      const event = events.find(e => e.participants?.some(p => p === participation));
      if (!event) return false;
      
      const share = event.eventTotal / event.participantCount;
      const paid = participation.amountPaid || 0;
      return paid >= share * 0.9; // 90% or more paid
    });
    
    return hasAlwaysPaid;
  });
  
  quickPayers.forEach(user => {
    insights.push(`⚡ **${user.name}** is a reliable payer - always settles their share quickly!`);
  });
  
  // Find members who frequently lend money (own many events)
  const frequentLenders = users.filter(user => {
    const ownedEvents = events.filter(event => event.owner === user._id);
    return ownedEvents.length >= 3;
  });
  
  frequentLenders.forEach(user => {
    const ownedCount = events.filter(event => event.owner === user._id).length;
    insights.push(`🏦 **${user.name}** is generous - has fronted money for **${ownedCount}** events!`);
  });
  
  // Find balanced relationships (mutual debts that are close)
  users.forEach(user => {
    const userEvents = events.filter(event => 
      event.participants?.some(p => p.user?._id === user._id) ||
      event.owner === user._id
    );
    
    const mutualDebts = calculateMutualDebts(userEvents, user._id);
    
    const balancedRelationships = mutualDebts.filter(debt => 
      debt.userOwes > 0 && debt.owesToUser > 0 && 
      Math.abs(debt.netAmount) < Math.max(debt.userOwes, debt.owesToUser) * 0.2
    );
    
    balancedRelationships.forEach(debt => {
      insights.push(`⚖️ **${user.name}** and **${debt.memberName}** have a balanced relationship - they owe each other similar amounts!`);
    });
  });
  
  return insights;
};

export const generateDebtWarningInsights = (events, users) => {
  const insights = [];
  
  users.forEach(user => {
    const userEvents = events.filter(event => 
      event.participants?.some(p => p.user?._id === user._id) ||
      event.owner === user._id
    );
    
    const mutualDebts = calculateMutualDebts(userEvents, user._id);
    
    // Warn about large debts
    const largeDebts = mutualDebts.filter(debt => debt.userOwes > 50);
    largeDebts.forEach(debt => {
      insights.push(`🚨 **${user.name}** has a significant debt: **$${debt.userOwes.toFixed(2)}** owed to **${debt.memberName}**`);
    });
    
    // Highlight when someone owes money to multiple people
    const activeDebts = mutualDebts.filter(debt => debt.userOwes > 0);
    if (activeDebts.length >= 3) {
      const totalOwed = activeDebts.reduce((sum, debt) => sum + debt.userOwes, 0);
      insights.push(`📊 **${user.name}** owes money to **${activeDebts.length}** different members (total: **$${totalOwed.toFixed(2)}**)`);
    }
    
    // Highlight when someone is owed money by multiple people
    const activeCreditees = mutualDebts.filter(debt => debt.owesToUser > 0);
    if (activeCreditees.length >= 3) {
      const totalOwed = activeCreditees.reduce((sum, debt) => sum + debt.owesToUser, 0);
      insights.push(`💼 **${user.name}** is owed money by **${activeCreditees.length}** different members (total: **$${totalOwed.toFixed(2)}**)`);
    }
  });
  
  return insights;
};