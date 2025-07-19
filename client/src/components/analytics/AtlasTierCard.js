import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box
} from '@mui/material';

function AtlasTierCard({ analytics }) {
  return (
    <Card sx={{ 
      background: analytics.storage.usagePercentage > 80 ? 
        'linear-gradient(45deg, #ffebee, #ffcdd2)' : 
        'linear-gradient(45deg, #e8f5e8, #c8e6c9)'
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          MongoDB Atlas Free Tier
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          You're using the free tier with a 512 MB storage limit.
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Usage Status
          </Typography>
          {analytics.storage.usagePercentage > 90 ? (
            <Chip label="Critical - Near Limit" color="error" size="small" />
          ) : analytics.storage.usagePercentage > 70 ? (
            <Chip label="Warning - High Usage" color="warning" size="small" />
          ) : (
            <Chip label="Healthy Usage" color="success" size="small" />
          )}
        </Box>

        {analytics.storage.usagePercentage > 80 && (
          <Typography variant="caption" color="error">
            Consider cleaning up old data or upgrading to a paid tier.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default AtlasTierCard;