import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { Storage as StorageIcon, Delete as DeleteIcon } from '@mui/icons-material';

function StorageOverviewCard({ analytics, onDataPurged }) {
  const [showPurgeDialog, setShowPurgeDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handlePurgeClick = () => {
    setShowPurgeDialog(true);
    setPassword('');
    setError('');
    setShowConfirmation(false);
  };

  const handlePasswordSubmit = () => {
    if (password !== 'admin') {
      setError('Incorrect password');
      return;
    }
    setError('');
    setShowConfirmation(true);
  };

  const handleConfirmPurge = async () => {
    try {
      setLoading(true);
      
      // Call the purge API
      const response = await fetch('/api/analytics/purge-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'admin' })
      });

      if (response.ok) {
        setShowPurgeDialog(false);
        if (onDataPurged) {
          onDataPurged();
        }
      } else {
        setError('Failed to purge data');
      }
    } catch (error) {
      console.error('Error purging data:', error);
      setError('Error occurred while purging data');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowPurgeDialog(false);
    setPassword('');
    setError('');
    setShowConfirmation(false);
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

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handlePurgeClick}
            fullWidth
            sx={{ textTransform: 'none' }}
          >
            Purge All Data
          </Button>
        </Box>
      </CardContent>

      {/* Purge Data Dialog */}
      <Dialog open={showPurgeDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {showConfirmation ? 'Confirm Data Purge' : 'Admin Authentication Required'}
        </DialogTitle>
        <DialogContent>
          {!showConfirmation ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Enter the admin password to proceed with data purge:
              </Typography>
              <TextField
                type="password"
                label="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                error={!!error}
                helperText={error}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </Box>
          ) : (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  ⚠️ DANGER ZONE ⚠️
                </Typography>
                <Typography variant="body1">
                  This action will permanently delete ALL data from the database:
                </Typography>
                <Typography component="ul" sx={{ mt: 1, pl: 2 }}>
                  <li>All users and user data</li>
                  <li>All events and event details</li>
                  <li>All expense items</li>
                  <li>All payment records</li>
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                  This action cannot be undone!
                </Typography>
              </Alert>
              <Typography variant="body1">
                Are you absolutely sure you want to proceed?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          {!showConfirmation ? (
            <Button 
              onClick={handlePasswordSubmit}
              variant="contained"
              disabled={!password.trim()}
            >
              Authenticate
            </Button>
          ) : (
            <Button 
              onClick={handleConfirmPurge}
              variant="contained"
              color="error"
              disabled={loading}
            >
              {loading ? 'Purging...' : 'Yes, Delete Everything'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default StorageOverviewCard;