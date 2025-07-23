import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import useAutoRefreshTimer from '../hooks/useAutoRefreshTimer';

function ReminderDisplay({ users, events, eventsLoaded, isExpanded }) {
  const [reminder, setReminder] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const generateNewReminder = useCallback(async () => {
    if (!eventsLoaded || !events.length) {
      setReminder('');
      return;
    }
    
    // Start fade out transition
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Wait for fade out
    
    const pendingEvents = events.filter(e => (e.remainingBalance || 0) > 0);
    const event = (pendingEvents.length > 0 ? pendingEvents : events)[Math.floor(Math.random() * (pendingEvents.length > 0 ? pendingEvents.length : events.length))];
    const eventName = event.title || event.name || `Event ${event._id}`;
    const amount = event.remainingBalance || event.totalAmount || 0;
    
    let ownerName = 'Unknown';
    if (event.owner) {
      if (typeof event.owner === 'object') {
        ownerName = event.owner.name || event.owner.username || 'Unknown';
      } else {
        const ownerObj = users.find(u => u._id === event.owner);
        if (ownerObj) ownerName = ownerObj.name || ownerObj.username || 'Unknown';
      }
    }
    
    let participantName = null;
    if (event.participants && event.participants.length > 0) {
      const participantIds = event.participants.map(p => (typeof p === 'object' ? (p.user ? p.user._id : p._id) : p));
      const filtered = participantIds.filter(pid => pid !== (typeof event.owner === 'object' ? event.owner._id : event.owner));
      if (filtered.length > 0) {
        const randomPid = filtered[Math.floor(Math.random() * filtered.length)];
        const participantObj = users.find(u => u._id === randomPid);
        if (participantObj) participantName = participantObj.name || participantObj.username || null;
      }
    }
    if (!participantName) participantName = 'Someone';

    let paymentParticipant = null;
    let paymentParticipantName = null;
    let paymentAmountPaid = 0;
    let paymentShare = 0;
    let paymentStatus = null;
    if (event.participants && event.participants.length > 0) {
      const candidates = event.participants.filter(p => typeof p === 'object' && p.user && typeof p.amountPaid !== 'undefined');
      if (candidates.length > 0) {
        const randomP = candidates[Math.floor(Math.random() * candidates.length)];
        paymentParticipant = users.find(u => u._id === (randomP.user._id || randomP.user));
        paymentParticipantName = paymentParticipant ? (paymentParticipant.name || paymentParticipant.username || 'Someone') : 'Someone';
        paymentAmountPaid = randomP.amountPaid || 0;
        const total = event.totalAmount || 0;
        const numParts = event.participants.length;
        paymentShare = numParts > 0 ? total / numParts : 0;
        if (paymentAmountPaid === 0) paymentStatus = 'unpaid';
        else if (paymentAmountPaid > paymentShare) paymentStatus = 'overpaid';
        else if (paymentAmountPaid >= paymentShare) paymentStatus = 'paid';
        else paymentStatus = 'partial';
      }
    }

    const reminderType = Math.floor(Math.random() * 7);
    if (reminderType === 0) {
      setReminder(`💸 **${participantName}** still owes **${ownerName}** **$${amount.toLocaleString()}** for **${eventName}**.`);
    } else if (reminderType === 1) {
      const total = event.totalAmount || 0;
      setReminder(`💡 **${eventName}** cost a total of **$${total.toLocaleString()}**.`);
    } else if (reminderType === 2) {
      setReminder(`🧾 **$${amount.toLocaleString()}** left to settle for **${eventName}**.`);
    } else if (reminderType === 3) {
      if ((event.remainingBalance || 0) === 0 && (event.totalAmount || 0) > 0) {
        setReminder(`🎉 **${eventName}** is fully settled! Great job, everyone!`);
      } else {
        setReminder(`⏳ **${eventName}** isn't settled yet. Keep going!`);
      }
    } else if (reminderType === 4 && paymentStatus === 'paid') {
      setReminder(`✅ **${paymentParticipantName}** paid their share for **${eventName}**.`);
    } else if (reminderType === 5 && paymentStatus === 'overpaid') {
      setReminder(`💰 **${paymentParticipantName}** overpaid for **${eventName}**! Generous!`);
    } else if (reminderType === 6 && paymentStatus === 'partial') {
      setReminder(`🕗 **${paymentParticipantName}** has partially paid for **${eventName}**.`);
    } else {
      setReminder(`💸 **${participantName}** still owes **${ownerName}** **$${amount.toLocaleString()}** for **${eventName}**.`);
    }
    
    // Wait a bit then fade in with new content
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsTransitioning(false);
  }, [users, events, eventsLoaded]);

  const { handleManualTrigger } = useAutoRefreshTimer(
    generateNewReminder,
    10000,
    isExpanded
  );

  const renderReminder = (reminder) => {
    const parts = reminder.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? <Box key={i} component="span" sx={{ fontWeight: 'bold', display: 'inline' }}>{part}</Box>
        : part
    );
  };

  useEffect(() => {
    if (eventsLoaded && events.length > 0) {
      generateNewReminder();
    }
  }, [eventsLoaded, events, generateNewReminder]);

  return (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        cursor: 'pointer',
        userSelect: 'none',
        '&:active': {
          transform: 'scale(0.98)',
          transition: 'transform 0.1s ease'
        }
      }}
      onClick={handleManualTrigger}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ fontSize: '1.2rem', color: 'black', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
          >
            📌
          </Typography>
          <Box sx={{
            backgroundColor: '#fffde7',
            color: 'black',
            borderRadius: '8px',
            padding: '6px 10px',
            width: '100%',
            maxWidth: 'none',
            boxShadow: '0 1.5px 6px 0 rgba(0,0,0,0.07)',
            minHeight: '22px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: '"Shadows Into Light", "Comic Sans MS", "Comic Sans", cursive, sans-serif',
            fontSize: '0.97rem',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
            transition: 'opacity 0.3s ease-in-out',
            border: '1px solid #ffe082',
            opacity: isTransitioning ? 0.3 : 1,
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontSize: '0.97rem', 
                fontWeight: 500, 
                lineHeight: 1.25, 
                width: '100%',
                transition: 'opacity 0.3s ease-in-out',
                opacity: isTransitioning ? 0 : 1
              }}
            >
              {renderReminder(reminder)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Collapse>
  );
}

export default ReminderDisplay;