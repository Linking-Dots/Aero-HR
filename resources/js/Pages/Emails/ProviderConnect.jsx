import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  useTheme,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  CardActions,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  Apple as AppleIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Email as EmailIcon,
  Dns as DnsIcon,
} from '@mui/icons-material';
import { useEmail } from '../../contexts/EmailContext';
import GlassCard from '../../Components/GlassCard';

const PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: <GoogleIcon />,
    color: '#DB4437',
    description: 'Connect with your Google account',
    type: 'oauth',
  },
  {
    id: 'outlook',
    name: 'Outlook / Office 365',
    icon: <MicrosoftIcon />,
    color: '#0078D4',
    description: 'Connect with your Microsoft account',
    type: 'oauth',
  },
  {
    id: 'icloud',
    name: 'iCloud',
    icon: <AppleIcon />,
    color: '#000000',
    description: 'Connect with your Apple ID',
    type: 'oauth',
  },
  {
    id: 'imap',
    name: 'IMAP / SMTP',
    icon: <DnsIcon />,
    color: '#4CAF50',
    description: 'Connect any email provider with IMAP',
    type: 'imap',
  },
];

const ProviderConnect = () => {
  const theme = useTheme();
  const { connectProvider } = useEmail();
  const [activeTab, setActiveTab] = useState('oauth');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    provider: 'imap', // 'gmail', 'outlook', 'icloud', 'imap'
    imapHost: 'imap.example.com',
    imapPort: '993',
    imapEncryption: 'ssl',
    smtpHost: 'smtp.example.com',
    smtpPort: '465',
    smtpEncryption: 'ssl',
    saveCredentials: true,
  });
  const [errors, setErrors] = useState({});

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (formData.provider === 'imap') {
      if (!formData.imapHost) newErrors.imapHost = 'IMAP host is required';
      if (!formData.imapPort) newErrors.imapPort = 'IMAP port is required';
      if (!formData.smtpHost) newErrors.smtpHost = 'SMTP host is required';
      if (!formData.smtpPort) newErrors.smtpPort = 'SMTP port is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOAuthConnect = async (provider) => {
    try {
      setIsConnecting(true);
      // In a real app, this would redirect to the OAuth provider
      // or open a popup for authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful connection
      await connectProvider({
        type: 'oauth',
        provider,
        email: `${provider}@example.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      });
      
    } catch (error) {
      console.error('OAuth connection failed:', error);
      // Show error message
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImapConnect = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsConnecting(true);
      
      // In a real app, this would validate the IMAP/SMTP connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await connectProvider({
        type: 'imap',
        email: formData.email,
        imap: {
          host: formData.imapHost,
          port: parseInt(formData.imapPort, 10),
          secure: formData.imapEncryption === 'ssl',
          tls: formData.imapEncryption === 'tls',
          auth: {
            user: formData.email,
            pass: formData.password,
          },
        },
        smtp: {
          host: formData.smtpHost,
          port: parseInt(formData.smtpPort, 10),
          secure: formData.smtpEncryption === 'ssl',
          tls: formData.smtpEncryption === 'tls',
          auth: {
            user: formData.email,
            pass: formData.password,
          },
        },
        saveCredentials: formData.saveCredentials,
      });
      
    } catch (error) {
      console.error('IMAP connection failed:', error);
      // Show error message
      setErrors(prev => ({
        ...prev,
        form: 'Failed to connect. Please check your credentials and try again.',
      }));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <GlassCard
        sx={{
          width: '100%',
          maxWidth: 900,
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: theme.shadows[10],
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LockIcon sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Connect Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose your email provider to get started
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 4,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 3,
              },
            }}
          >
            <Tab
              value="oauth"
              label="Quick Connect"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <Tab
              value="imap"
              label="Manual Setup"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          </Tabs>

          {activeTab === 'oauth' ? (
            <Grid container spacing={3} justifyContent="center">
              {PROVIDERS.filter(p => p.type === 'oauth').map((provider) => (
                <Grid item xs={12} sm={6} md={4} key={provider.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleOAuthConnect(provider.id)}
                      disabled={isConnecting}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: `${provider.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            color: provider.color,
                            fontSize: 32,
                            display: 'flex',
                          }}
                        >
                          {provider.icon}
                        </Box>
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {provider.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {provider.description}
                      </Typography>
                      {isConnecting && provider.id === formData.provider && (
                        <CircularProgress size={24} sx={{ mt: 1 }} />
                      )}
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box component="form" onSubmit={handleImapConnect}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Server Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="IMAP Host"
                        name="imapHost"
                        value={formData.imapHost}
                        onChange={handleInputChange}
                        error={!!errors.imapHost}
                        helperText={errors.imapHost}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="IMAP Port"
                        name="imapPort"
                        type="number"
                        value={formData.imapPort}
                        onChange={handleInputChange}
                        error={!!errors.imapPort}
                        helperText={errors.imapPort}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>IMAP Encryption</InputLabel>
                        <Select
                          name="imapEncryption"
                          value={formData.imapEncryption}
                          onChange={handleInputChange}
                          label="IMAP Encryption"
                        >
                          <MenuItem value="ssl">SSL/TLS</MenuItem>
                          <MenuItem value="tls">STARTTLS</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        name="smtpHost"
                        value={formData.smtpHost}
                        onChange={handleInputChange}
                        error={!!errors.smtpHost}
                        helperText={errors.smtpHost}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        name="smtpPort"
                        type="number"
                        value={formData.smtpPort}
                        onChange={handleInputChange}
                        error={!!errors.smtpPort}
                        helperText={errors.smtpPort}
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>SMTP Encryption</InputLabel>
                        <Select
                          name="smtpEncryption"
                          value={formData.smtpEncryption}
                          onChange={handleInputChange}
                          label="SMTP Encryption"
                        >
                          <MenuItem value="ssl">SSL/TLS</MenuItem>
                          <MenuItem value="tls">STARTTLS</MenuItem>
                          <MenuItem value="none">None</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isConnecting}
                  startIcon={isConnecting ? <CircularProgress size={20} /> : null}
                  sx={{
                    minWidth: 150,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
                    '&:hover': {
                      boxShadow: '0 6px 20px 0 rgba(0, 118, 255, 0.5)',
                    },
                  }}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Account'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="saveCredentials"
                    name="saveCredentials"
                    checked={formData.saveCredentials}
                    onChange={handleInputChange}
                    style={{
                      marginRight: 8,
                      width: 18,
                      height: 18,
                      cursor: 'pointer',
                    }}
                  />
                  <label htmlFor="saveCredentials" style={{ cursor: 'pointer' }}>
                    <Typography variant="body2" color="text.secondary">
                      Save credentials securely
                    </Typography>
                  </label>
                </Box>
              </Box>

              {errors.form && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box component="span" sx={{ mr: 1 }}>⚠️</Box>
                  <Typography variant="body2">{errors.form}</Typography>
                </Box>
              )}

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Need help with your email settings?{' '}
                  <a
                    href="#"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    View setup guides
                  </a>
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </GlassCard>
    </Box>
  );
};

export default ProviderConnect;
