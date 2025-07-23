import React, { useState, useEffect } from 'react';
import { Box, LinearProgress, CircularProgress, Backdrop, Typography, Stack } from '@mui/material';

function LoadingOverlay({ loading, children }) {
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0);

  useEffect(() => {
    let startTime;
    let intervalId;

    if (loading) {
      startTime = Date.now();
      setLoadingDuration(0);
      setShowColdStartMessage(false);

      // Update duration every 500ms
      intervalId = setInterval(() => {
        const duration = Date.now() - startTime;
        setLoadingDuration(duration);

        // Show cold start message after 3 seconds
        if (duration > 3000) {
          setShowColdStartMessage(true);
        }
      }, 500);
    } else {
      setShowColdStartMessage(false);
      setLoadingDuration(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loading]);

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Backdrop
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          borderRadius: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open={loading}
      >
        <Stack spacing={3} alignItems="center">
          
          {/* Show spinner for normal loading, progress bar for cold start */}
          {!showColdStartMessage && (
            <CircularProgress size={48} thickness={4} />
          )}
          
          {/* Cold Start Information Box with integrated progress bar */}
          {showColdStartMessage && (
            <Box sx={{ 
              textAlign: 'center', 
              maxWidth: 400,
              backgroundColor: '#e3f2fd',
              borderRadius: 2,
              p: 3,
              border: '1px solid #1976d2'
            }}>
              <Typography variant="h6" sx={{ 
                color: 'primary.main', 
                fontWeight: 600,
                mb: 2
              }}>
                🚀 Starting Server
              </Typography>
              
              {/* Linear Progress Bar - only shows during cold start */}
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#bbdefb',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: '#1976d2'
                    }
                  }} 
                />
              </Box>
              
              <Typography variant="body2" sx={{ 
                color: 'text.primary', 
                mb: 2,
                fontWeight: 500
              }}>
                The server is waking up from sleep mode
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                display: 'block',
                backgroundColor: '#f5f5f5',
                padding: '8px 12px',
                borderRadius: 1,
                fontStyle: 'italic'
              }}>
                ⏱️ This may take up to 30 seconds on first load
              </Typography>
            </Box>
          )}

          {/* Additional encouragement message for long loads */}
          {loadingDuration > 15000 && (
            <Box sx={{
              textAlign: 'center',
              backgroundColor: '#fff3e0',
              borderRadius: 2,
              p: 2,
              border: '1px solid #ff9800',
              maxWidth: 350
            }}>
              <Typography variant="body2" sx={{ 
                color: 'warning.dark',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 1
              }}>
                ⚡ Almost Ready!
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'warning.main',
                fontStyle: 'italic',
                display: 'block'
              }}>
                Server is warming up, just a few more seconds...
              </Typography>
            </Box>
          )}
        </Stack>
      </Backdrop>
    </Box>
  );
}

export default LoadingOverlay;