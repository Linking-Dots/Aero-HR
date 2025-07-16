import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Chip,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  PlayCircleOutline as InProgressIcon,
  AccessTime as ScheduledIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import AdminLayout from '@/Layouts/AdminLayout';
import TaskList from '@/Components/HR/TaskList';
import StatusBadge from '@/Components/StatusBadge';

const OnboardingIndex = ({ auth, title, onboardings }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onboardingToDelete, setOnboardingToDelete] = useState(null);
  
  const { delete: destroyOnboarding, processing } = useForm();
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="info" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };
  
  const handleDeleteClick = (onboarding) => {
    setOnboardingToDelete(onboarding);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    destroyOnboarding(route('hr.onboarding.destroy', onboardingToDelete.id), {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setOnboardingToDelete(null);
      },
    });
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOnboardingToDelete(null);
  };

  return (
    <AdminLayout user={auth.user}>
      <Head title={title} />
      
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          
          <Button
            component={Link}
            href={route('hr.onboarding.create')}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create Onboarding
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {onboardings.data.map((onboarding) => (
            <Grid item xs={12} md={6} lg={4} key={onboarding.id}>
              <Card>
                <CardHeader
                  title={onboarding.employee.name}
                  subheader={`Start Date: ${dayjs(onboarding.start_date).format('MMM DD, YYYY')}`}
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getStatusIcon(onboarding.status)}
                    </Box>
                  }
                />
                
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Expected Completion: {dayjs(onboarding.expected_completion_date).format('MMM DD, YYYY')}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <StatusBadge status={onboarding.status} />
                  </Box>
                  
                  {onboarding.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Notes:</strong> {onboarding.notes}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                
                <CardActions>
                  <Button
                    component={Link}
                    href={route('hr.onboarding.show', onboarding.id)}
                    size="small"
                    color="primary"
                  >
                    View Details
                  </Button>
                  
                  <Button
                    component={Link}
                    href={route('hr.onboarding.edit', onboarding.id)}
                    size="small"
                    color="secondary"
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(onboarding)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {onboardings.data.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No onboarding processes found.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
        
        {/* Pagination controls would go here */}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the onboarding process for{' '}
            {onboardingToDelete?.employee?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={processing}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default OnboardingIndex;
