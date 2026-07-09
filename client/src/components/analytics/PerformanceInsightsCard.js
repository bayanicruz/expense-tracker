import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';

import { formatBytes } from '../../utils/formatUtils';

function PerformanceInsightsCard({ analytics }) {

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Performance Insights
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Index to Data Ratio
          </Typography>
          <Typography variant="h6">
            {analytics.performance.indexToDataRatio}%
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Lower is generally better for storage efficiency
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="textSecondary">
            Storage Breakdown
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="body2">Data</Typography>
              <Typography variant="h6" color="primary.main">
                {formatBytes(analytics.breakdown.dataSize)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2">Indexes</Typography>
              <Typography variant="h6" color="secondary.main">
                {formatBytes(analytics.breakdown.indexSize)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default PerformanceInsightsCard;