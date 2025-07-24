import React from 'react';
import { Box, Typography } from '@mui/material';

function Avatar({ initials, backgroundColor, color, size = 40, fontSize = 14 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: `${fontSize}px`,
        border: '2px solid rgba(255,255,255,0.9)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
          borderRadius: '50%',
        }
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          position: 'relative',
          zIndex: 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {initials}
      </Typography>
    </Box>
  );
}

export default Avatar;