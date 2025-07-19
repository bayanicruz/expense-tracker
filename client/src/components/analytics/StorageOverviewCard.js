import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Box
} from '@mui/material';
import { Storage as StorageIcon } from '@mui/icons-material';

function StorageOverviewCard({ analytics }) {
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon />
          Storage Usage
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Used: {analytics.storage.used.mb} MB
            </Typography>
            <Typography variant="body2">
              Limit: {analytics.storage.limit.mb} MB
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(analytics.storage.usagePercentage, 100)}
            color={getUsageColor(analytics.storage.usagePercentage)}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            {analytics.storage.usagePercentage}% used
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Remaining
            </Typography>
            <Typography variant="h6" color="success.main">
              {analytics.storage.remaining.mb} MB
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Data + Index
            </Typography>
            <Typography variant="h6">
              {formatBytes(analytics.breakdown.dataSize + analytics.breakdown.indexSize)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default StorageOverviewCard;