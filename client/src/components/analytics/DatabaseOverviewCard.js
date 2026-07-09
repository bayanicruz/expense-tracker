import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid
} from '@mui/material';
import { formatBytes } from '../../utils/formatUtils';
import { DataObject as DatabaseIcon } from '@mui/icons-material';

function DatabaseOverviewCard({ analytics }) {

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatabaseIcon />
          Database Overview
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Database
            </Typography>
            <Typography variant="h6">
              {analytics.database.name}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Collections
            </Typography>
            <Typography variant="h6">
              {analytics.database.totalCollections}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Total Documents
            </Typography>
            <Typography variant="h6">
              {analytics.database.totalDocuments.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Avg Doc Size
            </Typography>
            <Typography variant="h6">
              {formatBytes(analytics.performance.avgDocumentSize)}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default DatabaseOverviewCard;