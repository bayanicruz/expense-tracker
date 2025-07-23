import React from 'react';
import { Box, CircularProgress, Backdrop } from '@mui/material';

function LoadingOverlay({ loading, children }) {
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
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1000,
          borderRadius: 'inherit',
        }}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>
    </Box>
  );
}

export default LoadingOverlay;