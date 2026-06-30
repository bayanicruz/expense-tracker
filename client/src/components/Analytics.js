import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid
} from '@mui/material';

// Import analytics components
import StorageOverviewCard from './analytics/StorageOverviewCard';
import DatabaseOverviewCard from './analytics/DatabaseOverviewCard';
import CollectionBreakdownCard from './analytics/CollectionBreakdownCard';
import PerformanceInsightsCard from './analytics/PerformanceInsightsCard';
import AtlasTierCard from './analytics/AtlasTierCard';
import { API_URL } from '../config/api';
import AnalyticsLoading from './analytics/AnalyticsLoading';
import AnalyticsError from './analytics/AnalyticsError';

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/analytics`);

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDataPurged = () => {
    // Refresh analytics after data purge
    fetchAnalytics();
  };


  if (loading) {
    return <AnalyticsLoading />;
  }

  if (error) {
    return <AnalyticsError error={error} onRetry={fetchAnalytics} />;
  }

  if (!analytics) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Storage Overview */}
        <Grid item xs={12} md={6}>
          <StorageOverviewCard analytics={analytics} onDataPurged={handleDataPurged} />
        </Grid>

        {/* Database Overview */}
        <Grid item xs={12} md={6}>
          <DatabaseOverviewCard analytics={analytics} />
        </Grid>

        {/* Collection Breakdown */}
        <Grid item xs={12}>
          <CollectionBreakdownCard analytics={analytics} />
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12} md={6}>
          <PerformanceInsightsCard analytics={analytics} />
        </Grid>

        {/* Atlas Free Tier Info */}
        <Grid item xs={12} md={6}>
          <AtlasTierCard analytics={analytics} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;