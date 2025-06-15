import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Collapse,
  Menu,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpenseList from './ExpenseList';

function GroupList({ groups, onAddGroup, onAddExpense, onEditGroup, onDeleteGroup }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [splitCount, setSplitCount] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroupId = Date.now();
      onAddGroup(newGroupName);
      setExpandedGroups({ ...expandedGroups, [newGroupId]: true });
      setNewGroupName('');
      setOpenDialog(false);
    }
  };

  const handleEditGroup = () => {
    if (editingGroup && editingGroup.name.trim()) {
      onEditGroup(editingGroup.id, editingGroup.name);
      setEditingGroup(null);
      setOpenDialog(false);
    }
  };

  const handleDeleteGroup = (groupId) => {
    onDeleteGroup(groupId);
    setMenuAnchor(null);
    setSelectedGroupId(null);
  };

  const calculateGroupTotal = (group) => {
    return group.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateTotalPerPerson = (group) => {
    const totalAmount = calculateGroupTotal(group);
    const peopleCount = splitCount[group.id] || 1;
    return totalAmount / peopleCount;
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups({
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId],
    });
  };

  const handleMenuOpen = (event, groupId) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedGroupId(groupId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedGroupId(null);
  };

  const handleEditClick = () => {
    const groupToEdit = groups.find(group => group.id === selectedGroupId);
    if (groupToEdit) {
      setEditingGroup(groupToEdit);
      setNewGroupName(groupToEdit.name);
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Groups</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingGroup(null);
            setNewGroupName('');
            setOpenDialog(true);
          }}
        >
          Add Group
        </Button>
      </Box>

      <List>
        {groups.map(group => (
          <React.Fragment key={group.id}>
            <ListItem
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton edge="end" onClick={() => toggleGroup(group.id)}>
                    {expandedGroups[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <IconButton onClick={(e) => handleMenuOpen(e, group.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>{group.name}</Typography>
                    <Paper elevation={0} sx={{ p: 0.5, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total: ${calculateGroupTotal(group).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Box>
                }
                secondary={`${group.expenses.length} expenses`}
              />
            </ListItem>
            <Collapse in={expandedGroups[group.id]}>
              <Card variant="outlined" sx={{ ml: 4, mb: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      type="number"
                      label="Number of people to split expenses"
                      size="small"
                      value={splitCount[group.id] || ''}
                      onChange={(e) => setSplitCount({
                        ...splitCount,
                        [group.id]: Math.max(1, parseInt(e.target.value) || 1)
                      })}
                      sx={{ width: '200px' }}
                    />
                    {group.expenses.length > 0 && (
                      <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total per person: ${calculateTotalPerPerson(group).toFixed(2)}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                  <ExpenseList
                    expenses={group.expenses}
                    onAddExpense={(expense) => onAddExpense(group.id, expense)}
                  />
                </CardContent>
              </Card>
            </Collapse>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={editingGroup ? handleEditGroup : handleAddGroup} 
            variant="contained"
          >
            {editingGroup ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={() => handleDeleteGroup(selectedGroupId)}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}

export default GroupList; 