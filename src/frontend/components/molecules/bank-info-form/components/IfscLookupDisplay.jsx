import React, { memo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Grid,
  Skeleton,
  Alert,
  useTheme
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * IfscLookupDisplay Component
 * 
 * Displays IFSC code lookup results with:
 * - Bank and branch information
 * - Location details
 * - Verification status
 * - Error handling
 * - Glass morphism design
 * 
 * @param {Object} props Component props
 * @param {Object} props.branchDetails - Branch information from IFSC lookup
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error information
 */
const IfscLookupDisplay = memo(({
  branchDetails = null,
  loading = false,
  error = null
}) => {
  const theme = useTheme();

  // Show loading skeleton
  if (loading) {
    return (
      <Card sx={{
        ...theme.glassCard,
        backdropFilter: 'blur(8px) saturate(180%)',
        mt: 1
      }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={120} height={20} />
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="80%" height={14} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="90%" height={14} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        icon={<ErrorIcon />}
        sx={{
          ...theme.glassCard,
          backdropFilter: 'blur(8px) saturate(180%)',
          mt: 1,
          border: `1px solid ${theme.palette.error.main}40`
        }}
      >
        <Typography variant="body2">
          {error.message || 'Unable to verify IFSC code'}
        </Typography>
      </Alert>
    );
  }

  // Show branch details
  if (branchDetails) {
    return (
      <Card sx={{
        ...theme.glassCard,
        backdropFilter: 'blur(8px) saturate(180%)',
        mt: 1,
        border: `1px solid ${theme.palette.success.main}40`
      }}>
        <CardContent sx={{ py: 2 }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BankIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight="medium">
                IFSC Verification
              </Typography>
            </Box>
            
            <Chip
              icon={<CheckIcon />}
              label="Verified"
              size="small"
              color="success"
              variant="outlined"
              sx={{
                backdropFilter: 'blur(4px)',
                backgroundColor: 'rgba(76, 175, 80, 0.1)'
              }}
            />
          </Box>

          {/* Bank and Branch Information */}
          <Grid container spacing={2}>
            {/* Bank Details */}
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Bank Name
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {branchDetails.bankName || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Branch Name
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {branchDetails.branchName || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            {/* Location Details */}
            {(branchDetails.city || branchDetails.district || branchDetails.state) && (
              <>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    mt: 1,
                    mb: 1
                  }}>
                    <LocationIcon fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      Location Details
                    </Typography>
                  </Box>
                </Grid>

                {branchDetails.city && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        City
                      </Typography>
                      <Typography variant="body2">
                        {branchDetails.city}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {branchDetails.district && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        District
                      </Typography>
                      <Typography variant="body2">
                        {branchDetails.district}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {branchDetails.state && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        State
                      </Typography>
                      <Typography variant="body2">
                        {branchDetails.state}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>

          {/* Additional Information */}
          {branchDetails.address && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Branch Address
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {branchDetails.address}
              </Typography>
            </Box>
          )}

          {/* Verification Notice */}
          <Box sx={{ 
            mt: 2, 
            p: 1.5, 
            backgroundColor: 'rgba(33, 150, 243, 0.08)',
            borderRadius: 1,
            border: '1px solid rgba(33, 150, 243, 0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon fontSize="small" color="info" />
              <Typography variant="caption" color="info.main">
                This IFSC code has been verified with the bank database
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // No data to show
  return null;
});

IfscLookupDisplay.displayName = 'IfscLookupDisplay';

export default IfscLookupDisplay;
