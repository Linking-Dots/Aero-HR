import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

const TaskList = ({ tasks, onTaskStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'not-applicable':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tasks
      </Typography>
      
      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          No tasks found.
        </Typography>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              divider
              sx={{
                backgroundColor: task.status === 'completed' ? 'rgba(0, 200, 83, 0.1)' : 'inherit',
              }}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.status === 'completed'}
                  onChange={() => onTaskStatusChange && onTaskStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                  disabled={!onTaskStatusChange || task.status === 'not-applicable'}
                />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {task.task}
                    </Typography>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status)}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    {task.description && (
                      <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                        {task.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      {task.assignee && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            Assigned to: {task.assignee.name}
                          </Typography>
                        </Box>
                      )}
                      
                      {task.due_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">
                            Due: {dayjs(task.due_date).format('MMM DD, YYYY')}
                          </Typography>
                        </Box>
                      )}
                      
                      {task.completed_date && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          <Typography variant="caption" color="success.main">
                            Completed: {dayjs(task.completed_date).format('MMM DD, YYYY')}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {task.notes && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <NotesIcon fontSize="small" sx={{ mr: 0.5, mt: 0.5 }} />
                        <Typography variant="caption">
                          {task.notes}
                        </Typography>
                      </Box>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TaskList;
