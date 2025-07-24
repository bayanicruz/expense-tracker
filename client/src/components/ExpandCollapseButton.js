import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useFeatureToggles from '../hooks/useFeatureToggles';

function ExpandCollapseButton({ isExpanded, onToggle, onCreateUser }) {
  const { enableGossip, enableReminders } = useFeatureToggles();
  
  const getButtonText = () => {
    // Only one feature can be enabled at a time
    if (enableGossip) {
      return isExpanded ? '🤭 Go chismis-free' : '👂 Maki-chismis';
    } else if (enableReminders) {
      return isExpanded ? '🚫 Hide Inisights' : '🧠 Show Insights';
    }
    // Fallback (shouldn't happen since component only renders when hasAnyFeature is true)
    return isExpanded ? '🚫 Hide' : '👁️ Show';
  };

  return (
    <Box sx={{ 
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: '12px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      backgroundColor: 'rgba(248, 248, 248, 0.8)',
      backdropFilter: 'blur(6px)',
      borderRadius: '6px',
      padding: '1px 6px',
      border: '1px solid rgba(0, 0, 0, 0.03)',
      transition: 'all 0.2s ease'
    }}>
      <Typography
        onClick={onToggle}
        variant="caption"
        sx={{ 
          color: 'rgba(0, 0, 0, 0.5)',
          fontSize: '0.6rem',
          cursor: 'pointer',
          fontWeight: 400,
          transition: 'color 0.2s ease',
          '&:hover': {
            color: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        {getButtonText()}
      </Typography>
      {onCreateUser && (
        <Typography
          onClick={onCreateUser}
          variant="caption"
          sx={{ 
            color: 'rgba(0, 0, 0, 0.5)',
            fontSize: '0.6rem',
            cursor: 'pointer',
            fontWeight: 400,
            transition: 'color 0.2s ease',
            ml: 1,
            pl: 1,
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
            '&:hover': {
              color: 'rgba(0, 0, 0, 0.7)',
            }
          }}
        >
          👤 Add User
        </Typography>
      )}
    </Box>
  );
}

export default ExpandCollapseButton;