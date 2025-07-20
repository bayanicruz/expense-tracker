import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const API_URL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${API_URL}/api/export/csv`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'expense-tracker-export.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Get the CSV content
      const csvContent = await response.text();
      
      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setSnackbar({
          open: true,
          message: 'Data exported successfully!',
          severity: 'success'
        });
      } else {
        throw new Error('Browser does not support file downloads');
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: `Export failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        onClick={handleExport}
        disabled={loading}
        sx={{
          textTransform: 'none',
          borderRadius: 2
        }}
      >
        {loading ? 'Exporting...' : 'Export Data as CSV'}
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ExportButton;