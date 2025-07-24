// Utility functions for insight data analysis

export const getUserName = (user) => {
  if (!user) return 'Unknown';
  if (typeof user === 'object') {
    return user.name || user.username || 'Unknown';
  }
  return 'Unknown';
};

export const getEventName = (event) => {
  return event.title || event.name || `Event ${event._id}`;
};

export const getOwnerName = (event, users) => {
  if (!event.owner) return 'Unknown';
  
  if (typeof event.owner === 'object') {
    return getUserName(event.owner);
  }
  
  const ownerObj = users.find(u => u._id === event.owner);
  return ownerObj ? getUserName(ownerObj) : 'Unknown';
};

export const getParticipantShare = (event) => {
  const totalAmount = event.totalAmount || 0;
  const participantCount = event.participants?.length || 0;
  return participantCount > 0 ? totalAmount / participantCount : 0;
};

export const getParticipantName = (participant, users) => {
  if (typeof participant === 'object' && participant.user) {
    const userId = participant.user._id || participant.user;
    const participantObj = users.find(u => u._id === userId);
    return participantObj ? getUserName(participantObj) : 'Someone';
  }
  return 'Someone';
};

export const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};