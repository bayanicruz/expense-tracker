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

// Calculate mutual debts between user and other members
export const calculateMutualDebts = (eventBreakdown, userId) => {
  const memberDebts = new Map();

  eventBreakdown.forEach(event => {
    const eventOwnerId = event.eventOwner?._id;
    const eventOwnerName = event.eventOwner?.name;

    if (eventOwnerId === userId) {
      // User owns this event - calculate how much each participant owes them
      event.participants?.forEach(participant => {
        if (participant.user._id !== userId) {
          const participantId = participant.user._id;
          const participantName = participant.user.name;
          const participantShare = event.eventTotal / event.participantCount;
          const participantPaid = participant.amountPaid || 0;
          const participantOwes = Math.max(0, participantShare - participantPaid);

          if (participantOwes > 0) {
            const key = participantId;
            if (memberDebts.has(key)) {
              const existing = memberDebts.get(key);
              memberDebts.set(key, {
                ...existing,
                owesToUser: existing.owesToUser + participantOwes
              });
            } else {
              memberDebts.set(key, {
                memberId: participantId,
                memberName: participantName,
                userOwes: 0,
                owesToUser: participantOwes
              });
            }
          }
        }
      });
    } else if (event.amountOwed > 0 && eventOwnerId && eventOwnerId !== userId) {
      // User participates and owes money to the owner
      const key = eventOwnerId;
      if (memberDebts.has(key)) {
        const existing = memberDebts.get(key);
        memberDebts.set(key, {
          ...existing,
          userOwes: existing.userOwes + event.amountOwed
        });
      } else {
        memberDebts.set(key, {
          memberId: eventOwnerId,
          memberName: eventOwnerName,
          userOwes: event.amountOwed,
          owesToUser: 0
        });
      }
    }
  });

  // Convert to array and calculate net amounts
  return Array.from(memberDebts.values())
    .map(member => ({
      ...member,
      netAmount: member.owesToUser - member.userOwes, // Positive = they owe user, Negative = user owes them
      hasRelationship: member.userOwes > 0 || member.owesToUser > 0
    }))
    .filter(member => member.hasRelationship)
    .sort((a, b) => {
      // Sort by absolute net amount, highest first
      return Math.abs(b.netAmount) - Math.abs(a.netAmount);
    });
};