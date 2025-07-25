import React from 'react';
import { Box, Typography } from '@mui/material';
import Avatar from './Avatar';
import { getUserAvatar } from '../utils/avatarUtils';
import { formatCurrency, createMemberForAvatar } from '../utils/debtUtils';

const MemberDebtItem = ({ 
  memberId, 
  memberName, 
  totalOwed, 
  eventCount, 
  showEventCount = true 
}) => {
  const memberForAvatar = createMemberForAvatar(memberId, memberName);
  const avatarProps = getUserAvatar(memberForAvatar);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        px: 2
      }}
    >
      {/* Left side - Avatar and Member Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
        <Avatar
          {...avatarProps}
          size={32}
          fontSize={12}
        />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
            {memberName}
          </Typography>
          {showEventCount && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side - Amount */}
      <Typography variant="body2" sx={{ 
        fontWeight: 600, 
        fontSize: '0.9rem',
        color: '#f44336'
      }}>
        {formatCurrency(totalOwed)}
      </Typography>
    </Box>
  );
};

export default MemberDebtItem;