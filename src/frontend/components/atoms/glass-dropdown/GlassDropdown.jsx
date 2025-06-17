/**
 * GlassDropdown Atom Component
 * 
 * A dropdown component with glass morphism styling that integrates
 * with HeroUI Dropdown component. Provides consistent glass theme
 * across all dropdown interfaces.
 * 
 * Features:
 * - Glass morphism styling
 * - Theme integration
 * - Consistent styling across app
 * - Backdrop blur effects
 * - Custom border and shadows
 * 
 * @component
 * @example
 * ```jsx
 * <GlassDropdown>
 *   <DropdownTrigger>
 *     <Button>Open Menu</Button>
 *   </DropdownTrigger>
 *   <DropdownMenu>
 *     <DropdownItem>Action 1</DropdownItem>
 *     <DropdownItem>Action 2</DropdownItem>
 *   </DropdownMenu>
 * </GlassDropdown>
 * ```
 */

import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Dropdown } from "@heroui/react";

import { GLASS_DROPDOWN_CONFIG } from './config';

const GlassDropdown = forwardRef(({ 
  children, 
  className = '',
  style = {},
  ...props 
}, ref) => {
  const theme = useTheme();
  
  const glassStyles = {
    backdropFilter: theme.glassCard.backdropFilter,
    background: theme.glassCard.background,
    border: theme.glassCard.border,
    boxShadow: GLASS_DROPDOWN_CONFIG.styling.boxShadow,
    backgroundClip: 'border-box',
    borderRadius: GLASS_DROPDOWN_CONFIG.styling.borderRadius,
    ...style
  };

  return (
    <Dropdown 
      ref={ref} 
      className={className}
      css={glassStyles}
      classNames={{
        content: GLASS_DROPDOWN_CONFIG.classNames.content,
        ...props.classNames
      }}
      {...props}
    >
      {children}
    </Dropdown>
  );
});

GlassDropdown.displayName = 'GlassDropdown';

export default GlassDropdown;
