export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getEventDollarColor = (eventName) => {
  const colors = [
    { bg: '#e3f2fd', text: '#1976d2' },
    { bg: '#f3e5f5', text: '#7b1fa2' },
    { bg: '#e8f5e8', text: '#388e3c' },
    { bg: '#fff3e0', text: '#f57c00' },
    { bg: '#ffebee', text: '#d32f2f' },
    { bg: '#e0f2f1', text: '#00796b' },
    { bg: '#fce4ec', text: '#c2185b' },
    { bg: '#e8eaf6', text: '#3f51b5' },
  ];

  let hash = 0;
  for (let i = 0; i < eventName.length; i++) {
    hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};
