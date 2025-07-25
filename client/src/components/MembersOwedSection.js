import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stack,
  Divider
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import MemberDebtItem from './MemberDebtItem';
import { calculateMembersOwed, calculateTotalOwed, formatCurrency } from '../utils/debtUtils';

const MembersOwedSection = ({ 
  eventBreakdown, 
  userId, 
  expanded = true // Default to expanded for visibility
}) => {
  const membersOwed = calculateMembersOwed(eventBreakdown, userId);
  const totalOwedAmount = calculateTotalOwed(membersOwed);

  // Don't render if no debts
  if (membersOwed.length === 0) {
    return null;
  }

  return (
    <Accordion 
      defaultExpanded={expanded}
      sx={{ 
        background: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        '&:before': { display: 'none' },
        overflow: 'hidden'
      }}
    >
      <AccordionSummary 
        expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />}
        sx={{
          background: 'rgba(244, 67, 54, 0.02)', // Light red background
          borderBottom: '1px solid rgba(244, 67, 54, 0.1)',
          minHeight: '48px',
          py: 0.5,
          '&.Mui-expanded': { minHeight: '48px' },
          '& .MuiAccordionSummary-content': { my: 0.5 }
        }}
      >
        <Typography variant="body2" sx={{ 
          fontWeight: 500, 
          fontSize: '0.85rem', 
          color: 'text.primary' 
        }}>
          Members Owed ({membersOwed.length})
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 0 }}>
        <Stack spacing={0}>
          {membersOwed.map((member, index) => (
            <Box key={member.memberId}>
              <MemberDebtItem
                memberId={member.memberId}
                memberName={member.memberName}
                totalOwed={member.totalOwed}
                eventCount={member.eventCount}
              />
              {index < membersOwed.length - 1 && (
                <Divider sx={{ mx: 2 }} />
              )}
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default MembersOwedSection;