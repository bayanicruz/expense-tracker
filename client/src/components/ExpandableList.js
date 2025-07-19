import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

function ExpandableList({ 
  title, 
  isOpen, 
  onToggle, 
  createText, 
  items = [], 
  onItemClick,
  getItemText 
}) {
  return (
    <Box>
      <Button 
        variant="contained" 
        size="large" 
        fullWidth
        sx={{ py: 2 }}
        onClick={onToggle}
        endIcon={isOpen ? <ExpandLess /> : <ExpandMore />}
      >
        {title}
      </Button>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem>
            <ListItemButton 
              sx={{ pl: 4 }} 
              onClick={() => onItemClick && onItemClick('create')}
            >
              <ListItemText primary={createText} sx={{ fontWeight: 'bold' }} />
            </ListItemButton>
          </ListItem>
          {items.map((item) => (
            <ListItem key={item._id}>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => onItemClick && onItemClick(item)}
              >
                <ListItemText primary={getItemText ? getItemText(item) : item._id} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

export default ExpandableList;