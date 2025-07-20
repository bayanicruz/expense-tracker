import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider
} from '@mui/material';

function CollectionBreakdownCard({ analytics }) {
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Collection Breakdown
        </Typography>
        
        <List>
          {analytics.breakdown.collections.map((collection, index) => (
            <React.Fragment key={collection.collection}>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {collection.name}
                      </Typography>
                      <Chip 
                        label={`${collection.documentCount} docs`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Storage: {formatBytes(collection.storageSize)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Index: {formatBytes(collection.indexSize)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Size: {formatBytes(collection.avgDocSize)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < analytics.breakdown.collections.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default CollectionBreakdownCard;