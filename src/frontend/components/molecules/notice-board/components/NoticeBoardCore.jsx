/**
 * Notice Board Core Component
 * 
 * The main UI component for the notice board display and management.
 */

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  CardContent,
  Dialog,
  TextField,
  Grow,
  IconButton,
  Fade
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Announcement as AnnouncementIcon
} from '@mui/icons-material';
import { Alert, AlertTitle } from "@mui/lab";

import { GlassCard } from '../../../atoms/glass-card';
import { NoticeItem, AddNoticeDialog } from './index';

export const NoticeBoardCore = ({
  notices,
  dialogOpen,
  newNotice,
  allowAdd,
  allowDelete,
  onAddNotice,
  onDeleteNotice,
  onDialogOpen,
  onDialogClose,
  onInputChange,
  isFormValid,
  theme,
  className,
  style,
  config
}) => {
  return (
    <Box 
      sx={{ display: 'flex', justifyContent: 'center', p: 2 }}
      className={className}
      style={style}
      component="section"
      aria-label={config.accessibility.boardLabel}
    >
      <Grow in timeout={800}>
        <GlassCard>
          <CardContent>
            {/* Header */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AnnouncementIcon 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontSize: 28
                  }} 
                />
                <Typography variant="h5" component="h2" fontWeight="600">
                  {config.labels.title}
                </Typography>
              </Box>
              
              {allowAdd && (
                <Button
                  variant={config.ui.buttonVariant}
                  color={config.styling.buttonColor}
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={onDialogOpen}
                  aria-label={config.accessibility.addButtonLabel}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {config.labels.addButton}
                </Button>
              )}
            </Box>

            {/* Notices Grid */}
            {notices.length > 0 ? (
              <Grid container spacing={config.ui.gridSpacing}>
                {notices.map((notice, index) => (
                  <Grid item xs={12} md={6} key={notice.id}>
                    <Fade 
                      in 
                      timeout={800} 
                      style={{ 
                        transitionDelay: `${index * config.animation.staggerDelay}ms` 
                      }}
                    >
                      <div>
                        <NoticeItem
                          notice={notice}
                          allowDelete={allowDelete}
                          onDelete={() => onDeleteNotice(notice.id)}
                          config={config}
                        />
                      </div>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  opacity: 0.7
                }}
              >
                <AnnouncementIcon 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.text.secondary,
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" color="text.secondary">
                  {config.labels.emptyState}
                </Typography>
              </Box>
            )}

            {/* Add Notice Dialog */}
            <AddNoticeDialog
              open={dialogOpen}
              newNotice={newNotice}
              onClose={onDialogClose}
              onInputChange={onInputChange}
              onSubmit={onAddNotice}
              isFormValid={isFormValid}
              config={config}
            />
          </CardContent>
        </GlassCard>
      </Grow>
    </Box>
  );
};
