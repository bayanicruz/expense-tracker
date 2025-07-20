import React from 'react';
import {
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

function AnalyticsLoading() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon />
        Loading Analytics...
      </Typography>
      <LinearProgress />
    </Box>
  );
}

export default AnalyticsLoading;