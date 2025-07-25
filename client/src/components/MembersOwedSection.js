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
import { calculateMutualDebts } from '../utils/debtUtils';

const MutualDebtsSection = ({ 
  eventBreakdown, 
  userId, 
  expanded = true // Default to expanded for visibility
}) => {
  const mutualDebts = calculateMutualDebts(eventBreakdown, userId);

  // Don't render if no debt relationships
  if (mutualDebts.length === 0) {
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
          background: 'rgba(0,0,0,0.02)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
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
          Member Balances ({mutualDebts.length})
        </Typography>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 0 }}>
        <Stack spacing={0}>
          {mutualDebts.map((member, index) => (
            <Box key={member.memberId}>
              <MemberDebtItem
                memberId={member.memberId}
                memberName={member.memberName}
                userOwes={member.userOwes}
                owesToUser={member.owesToUser}
                netAmount={member.netAmount}
              />
              {index < mutualDebts.length - 1 && (
                <Divider sx={{ mx: 2 }} />
              )}
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default MutualDebtsSection;