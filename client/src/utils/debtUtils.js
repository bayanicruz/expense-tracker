// Debt calculation and aggregation utilities

// Calculate members owed by aggregating event breakdown data
export const calculateMembersOwed = (eventBreakdown, userId) => {
  const debtsByMember = new Map();

  eventBreakdown.forEach(event => {
    // Only process events where user owes money and there's an owner
    if (event.amountOwed > 0 && event.eventOwner && event.eventOwner._id !== userId) {
      const ownerId = event.eventOwner._id;
      const ownerName = event.eventOwner.name;
      
      if (debtsByMember.has(ownerId)) {
        const existing = debtsByMember.get(ownerId);
        debtsByMember.set(ownerId, {
          ...existing,
          totalOwed: existing.totalOwed + event.amountOwed,
          eventCount: existing.eventCount + 1,
          events: [...existing.events, {
            eventId: event.eventId,
            eventTitle: event.eventTitle,
            eventDate: event.eventDate,
            amountOwed: event.amountOwed
          }]
        });
      } else {
        debtsByMember.set(ownerId, {
          memberId: ownerId,
          memberName: ownerName,
          totalOwed: event.amountOwed,
          eventCount: 1,
          events: [{
            eventId: event.eventId,
            eventTitle: event.eventTitle,
            eventDate: event.eventDate,
            amountOwed: event.amountOwed
          }]
        });
      }
    }
  });

  // Convert Map to array and sort by total owed (highest first)
  return Array.from(debtsByMember.values())
    .sort((a, b) => b.totalOwed - a.totalOwed);
};

// Calculate total amount owed across all members
export const calculateTotalOwed = (membersOwed) => {
  return membersOwed.reduce((total, member) => total + member.totalOwed, 0);
};

// Format currency amount
export const formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
};

// Get debt status color based on amount
export const getDebtStatusColor = (amount) => {
  if (amount === 0) return '#4caf50'; // Green for no debt
  if (amount < 10) return '#ff9800'; // Orange for small debt
  return '#f44336'; // Red for significant debt
};

// Create mock member object for avatar generation
export const createMemberForAvatar = (memberId, memberName) => ({
  _id: memberId,
  name: memberName
});

// Calculate total amount user owes to others
export const calculateTotalOwesToOthers = (eventBreakdown, userId) => {
  const membersOwed = calculateMembersOwed(eventBreakdown, userId);
  return calculateTotalOwed(membersOwed);
};

// Calculate total amount owed to user from events they own
export const calculateTotalOwedToUser = (eventBreakdown, userId) => {
  const ownedEvents = eventBreakdown.filter(event => 
    event.eventOwner && event.eventOwner._id === userId
  );
  return ownedEvents.reduce((sum, event) => sum + (event.remainingBalance || 0), 0);
};