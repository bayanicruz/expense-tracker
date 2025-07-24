// Avatar generation utilities

// Predefined color palette for avatars
const avatarColors = [
  { bg: '#FF6B6B', text: '#FFFFFF' }, // Red
  { bg: '#4ECDC4', text: '#FFFFFF' }, // Teal
  { bg: '#45B7D1', text: '#FFFFFF' }, // Blue
  { bg: '#96CEB4', text: '#FFFFFF' }, // Green
  { bg: '#FECA57', text: '#FFFFFF' }, // Yellow
  { bg: '#FF9FF3', text: '#FFFFFF' }, // Pink
  { bg: '#54A0FF', text: '#FFFFFF' }, // Light Blue
  { bg: '#5F27CD', text: '#FFFFFF' }, // Purple
  { bg: '#00D2D3', text: '#FFFFFF' }, // Cyan
  { bg: '#FF9F43', text: '#FFFFFF' }, // Orange
  { bg: '#10AC84', text: '#FFFFFF' }, // Emerald
  { bg: '#EE5A24', text: '#FFFFFF' }, // Dark Orange
  { bg: '#0ABDE3', text: '#FFFFFF' }, // Sky Blue
  { bg: '#006BA6', text: '#FFFFFF' }, // Dark Blue
  { bg: '#E74C3C', text: '#FFFFFF' }, // Crimson
];

// Generate consistent hash from string
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Get consistent avatar color for user/event
export const getAvatarColor = (id, name) => {
  const hash = hashString(id + (name || ''));
  return avatarColors[hash % avatarColors.length];
};

// Generate user avatar props
export const getUserAvatar = (user) => {
  const initials = getInitials(user.name);
  const colors = getAvatarColor(user._id, user.name);
  
  return {
    initials,
    backgroundColor: colors.bg,
    color: colors.text,
    id: user._id
  };
};

// Generate event avatar props
export const getEventAvatar = (event) => {
  const eventName = event.title || event.name || 'Event';
  const initials = getInitials(eventName);
  const colors = getAvatarColor(event._id, eventName);
  
  return {
    initials,
    backgroundColor: colors.bg,
    color: colors.text,
    id: event._id
  };
};