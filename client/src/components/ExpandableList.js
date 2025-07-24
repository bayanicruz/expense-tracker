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
          py: 1.5,
          px: 2.5,
          background: 'white',
          color: 'black',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.3px',
          justifyContent: 'space-between',
          minHeight: '52px',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none'
          },
          '&:hover': {
            background: 'white',
            color: 'black',
            boxShadow: '0 16px 40px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px) scale(1.02)',
            '& .chevron': {
              opacity: 1,
              transform: isOpen ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)',
            }
          },
          '&:active': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14), 0 6px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '& .MuiButton-endIcon': {
            marginLeft: 0,
            minWidth: '24px',
            '& .chevron': {
              fontSize: '1.2rem',
              opacity: 0.8,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onToggle}
        endIcon={<ExpandMore className="chevron" />}
      >
        {title}
      </Button>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {createText && (
            <ListItem sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={() => onItemClick && onItemClick('create')}
                sx={{
                  py: 1.3,
                  px: 2.5,
                  background: 'black',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none'
                  },
                  '&:hover': {
                    background: '#333333',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px) scale(1.01)',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '&:hover .MuiSvgIcon-root': {
                    transform: 'scale(1.2) rotate(90deg)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1.005)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0,0,0,0.12)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {createText.replace(/^\+\s*/, '')}
              </Button>
            </ListItem>
          )}
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