import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Add from '@mui/icons-material/Add';

function ExpandableList({ 
  title, 
  isOpen, 
  onToggle, 
  createText, 
  items = [], 
  onItemClick,
  getItemText,
  renderItem
}) {
  return (
    <Box>
      <Button 
        variant="contained" 
        size="medium" 
        fullWidth
        sx={{ 
          py: 1.2,
          px: 2,
          background: '#1976d2',
          borderRadius: '6px',
          boxShadow: 'none',
          fontSize: '0.9rem',
          fontWeight: 500,
          textTransform: 'none',
          justifyContent: 'space-between',
          minHeight: '42px',
          border: '1px solid rgba(255,255,255,0.1)',
          '&:hover': {
            background: '#1565c0',
            boxShadow: '0 1px 4px rgba(25, 118, 210, 0.25)',
            '& .chevron': {
              opacity: 1,
            }
          },
          '& .MuiButton-endIcon': {
            marginLeft: 0,
            minWidth: '20px',
            '& .chevron': {
              fontSize: '1rem',
              opacity: 0.7,
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }
          },
          transition: 'all 0.2s ease-out',
        }}
        onClick={onToggle}
        endIcon={<ExpandMore className="chevron" />}
      >
        {title}
      </Button>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            <Button
              variant="text"
              fullWidth
              startIcon={<Add />}
              onClick={() => onItemClick && onItemClick('create')}
              sx={{
                py: 1.2,
                px: 2.5,
                borderRadius: 2,
                color: 'text.secondary',
                backgroundColor: '#f8f9fa',
                textTransform: 'none',
                fontWeight: '500',
                fontSize: '0.85rem',
                border: '1px solid #e9ecef',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  color: 'primary.main',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                  transform: 'translateY(-0.5px)',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1rem',
                  color: '#6c757d',
                  transition: 'all 0.2s ease-in-out',
                },
                '&:hover .MuiSvgIcon-root': {
                  color: 'primary.main',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {createText.replace(/^\+\s*/, '')}
            </Button>
          </ListItem>
          {items.map((item) => (
            <ListItem key={item._id}>
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => onItemClick && onItemClick(item)}
              >
                {renderItem ? renderItem(item) : (
                  <ListItemText 
                    primary={getItemText ? (
                      typeof getItemText(item) === 'object' ? 
                        getItemText(item).primary : 
                        getItemText(item)
                    ) : item._id}
                    secondary={getItemText && typeof getItemText(item) === 'object' ? 
                      getItemText(item).secondary : 
                      undefined
                    }
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Box>
  );
}

export default ExpandableList;