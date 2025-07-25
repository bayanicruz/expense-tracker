import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  EventNote as EventIcon,
  CloudOff as OfflineIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';

const EmptyState = ({ 
  type = 'users', 
  onAction, 
  actionLabel, 
  isConnected = true,
  onRetry
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'users':
        return {
          icon: <PersonAddIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
          title: 'No Members Yet',
          description: 'Get started by adding your first member to begin tracking shared expenses.',
          actionLabel: actionLabel || 'Add First Member',
          actionIcon: <PersonAddIcon />
        };
      
      case 'events':
        return {
          icon: <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
          title: 'No Expense Events',
          description: 'Create your first expense event to start splitting costs with your group.',
          actionLabel: actionLabel || 'Create First Event',
          actionIcon: <EventIcon />
        };
      
      case 'offline':
        return {
          icon: <OfflineIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />,
          title: 'Server Unavailable',
          description: 'The server is currently down for maintenance. Please try again later or reach out to kuruzu',
          actionLabel: null,
          actionIcon: null
        };
      
      default:
        return {
          icon: <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
          title: 'No Data Available',
          description: 'There\'s no data to display right now.',
          actionLabel: 'Refresh',
          actionIcon: <RefreshIcon />
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      px: 3,
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.02)',
      borderRadius: 2,
      border: '1px solid rgba(0,0,0,0.08)'
    }}>
      {config.icon}
      
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 1, 
        color: 'text.primary',
        fontSize: '1.1rem'
      }}>
        {config.title}
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: 'text.secondary', 
        mb: 3,
        maxWidth: '400px',
        lineHeight: 1.5,
        fontSize: '0.9rem'
      }}>
        {config.description}
      </Typography>

      {type !== 'offline' && (
        <Stack direction="row" spacing={2}>
          {onAction && (
            <Button
              variant="contained"
              startIcon={config.actionIcon}
              onClick={onAction}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                '&:hover': { backgroundColor: '#333333' },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {config.actionLabel}
            </Button>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default EmptyState;