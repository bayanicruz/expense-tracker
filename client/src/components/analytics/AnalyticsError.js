import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';
import { Assessment as AssessmentIcon, Refresh as RefreshIcon } from '@mui/icons-material';

function AnalyticsError({ error, onRetry }) {
  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <AssessmentIcon />
        Storage Insights
      </Typography>
      <Typography variant="body1" color="error" sx={{ mb: 2 }}>
        Error loading analytics: {error}
      </Typography>
      <Button 
        onClick={onRetry}
        variant="contained"
        startIcon={<RefreshIcon />}
        sx={{ mt: 1 }}
      >
        Retry
      </Button>
    </Box>
  );
}

export default AnalyticsError;