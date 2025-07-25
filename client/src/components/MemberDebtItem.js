import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { ArrowRightAlt as ArrowIcon } from '@mui/icons-material';
import Avatar from './Avatar';
import { getUserAvatar } from '../utils/avatarUtils';
import { formatCurrency, createMemberForAvatar } from '../utils/debtUtils';

const MemberDebtItem = ({ 
  memberId, 
  memberName, 
  userOwes = 0,
  owesToUser = 0,
  netAmount = 0,
  // Legacy props for backward compatibility
  totalOwed,
  eventCount, 
  showEventCount = true 
}) => {
  const memberForAvatar = createMemberForAvatar(memberId, memberName);
  const avatarProps = getUserAvatar(memberForAvatar);

  // Use legacy data if new mutual debt props aren't provided
  const displayUserOwes = totalOwed || userOwes;
  const displayOwesToUser = owesToUser;
  const displayNetAmount = netAmount;

  const showMutualInfo = displayOwesToUser > 0 || displayUserOwes > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2,
        minHeight: '60px'
      }}
    >
      {/* Left side - Avatar and Member Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
        <Avatar
          {...avatarProps}
          size={32}
          fontSize={12}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem', mb: 0.25 }}>
            {memberName}
          </Typography>
          
          {/* Mutual debt info with clear labels */}
          {showMutualInfo ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {displayUserOwes > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.7rem', 
                    color: 'text.secondary',
                    minWidth: '35px'
                  }}>
                    Pay:
                  </Typography>
                  <Chip
                    label={formatCurrency(displayUserOwes)}
                    size="small"
                    sx={{
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      fontSize: '0.7rem',
                      height: '18px',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.75 }
                    }}
                  />
                </Box>
              )}
              
              {displayOwesToUser > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ 
                    fontSize: '0.7rem', 
                    color: 'text.secondary',
                    minWidth: '35px'
                  }}>
                    Collect:
                  </Typography>
                  <Chip
                    label={formatCurrency(displayOwesToUser)}
                    size="small"
                    sx={{
                      backgroundColor: '#e8f5e8',
                      color: '#2e7d32',
                      fontSize: '0.7rem',
                      height: '18px',
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.75 }
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : showEventCount && eventCount && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side - Subtle Net Balance */}
      <Box sx={{ textAlign: 'right' }}>
        {showMutualInfo && Math.abs(displayNetAmount) > 0.01 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="caption" sx={{ 
              fontSize: '0.65rem', 
              color: 'text.disabled',
              lineHeight: 1
            }}>
              balance
            </Typography>
            <Typography variant="caption" sx={{ 
              fontWeight: 600, 
              fontSize: '0.8rem',
              color: displayNetAmount > 0 ? '#4caf50' : '#f44336'
            }}>
              {displayNetAmount > 0 ? '+' : ''}{formatCurrency(displayNetAmount)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ 
            fontWeight: 600, 
            fontSize: '0.9rem',
            color: '#f44336'
          }}>
            {formatCurrency(displayUserOwes)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MemberDebtItem;