/**
 * Navigation Menu Component
 * 
 * Renders the main navigation menu with support for dropdowns.
 * Collapses when sidebar is open to save space and provides
 * responsive grid layout based on device type.
 * 
 * @component
 * @example
 * ```jsx
 * <NavigationMenu 
 *   pages={navigationPages}
 *   activePage="/dashboard"
 *   handleNavigation={navigate}
 *   sideBarOpen={false}
 *   isTablet={false}
 * />
 * ```
 */

import React from 'react';
import { Box, Collapse } from '@mui/material';
import { Link } from '@inertiajs/react';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * Navigation Menu Component
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.pages - Navigation pages configuration
 * @param {string} props.activePage - Current active page path
 * @param {Function} props.handleNavigation - Navigation handler function
 * @param {boolean} props.sideBarOpen - Current sidebar state
 * @param {boolean} props.isTablet - True if device is tablet
 * @returns {JSX.Element} Rendered NavigationMenu component
 */
const NavigationMenu = ({ 
  pages, 
  activePage, 
  handleNavigation, 
  sideBarOpen, 
  isTablet 
}) => {
  /**
   * Check if any submenu item is active
   */
  const hasActiveSubmenu = (subMenu) => {
    if (!Array.isArray(subMenu)) return false;
    return subMenu.some(subPage => `/${subPage.route}` === activePage);
  };

  /**
   * Get button variant based on active state
   */
  const getButtonVariant = (isActive) => isActive ? "flat" : "light";

  /**
   * Get button color based on active state
   */
  const getButtonColor = (isActive) => isActive ? "primary" : "default";

  return (
    <Collapse in={!sideBarOpen} timeout="auto" unmountOnExit>
      <Box sx={{ flexGrow: 1, mx: 2 }}>
        <div className={`grid gap-2 ${
          isTablet ? 'grid-cols-2' : 'grid-cols-4'
        }`}>
          {pages.map((page, index) => {
            const pageKey = `${page.name}-${index}`;
            
            return (
              <div key={pageKey} className="flex justify-center">
                {page.subMenu ? (
                  // Dropdown Menu Item
                  <Dropdown
                    placement="bottom"
                    classNames={{
                      content: "bg-white/10 backdrop-blur-md border border-white/20"
                    }}
                  >
                    <DropdownTrigger>
                      <Button
                        variant={getButtonVariant(hasActiveSubmenu(page.subMenu))}
                        color={getButtonColor(hasActiveSubmenu(page.subMenu))}
                        startContent={page.icon}
                        endContent={<ChevronDownIcon className="w-4 h-4" />}
                        className="bg-transparent hover:bg-white/10"
                        size={isTablet ? "sm" : "md"}
                        aria-label={`${page.name} menu`}
                      >
                        {page.name}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label={`${page.name} submenu`}
                      variant="faded"
                    >
                      {page.subMenu.map((subPage) => {
                        const isSubPageActive = activePage === `/${subPage.route}`;
                        
                        return (
                          <DropdownItem
                            key={subPage.name}
                            startContent={subPage.icon}
                            className={isSubPageActive ? "bg-primary/20" : ""}
                            onPress={() => handleNavigation(route(subPage.route), subPage.method)}
                            aria-label={`Navigate to ${subPage.name}`}
                          >
                            {subPage.name}
                          </DropdownItem>
                        );
                      })}
                    </DropdownMenu>
                  </Dropdown>
                ) : (
                  // Regular Menu Item
                  <Button
                    as={Link}
                    href={route(page.route)}
                    method={page.method}
                    preserveState
                    preserveScroll
                    variant={getButtonVariant(activePage === `/${page.route}`)}
                    color={getButtonColor(activePage === `/${page.route}`)}
                    startContent={page.icon}
                    className="bg-transparent hover:bg-white/10"
                    size={isTablet ? "sm" : "md"}
                    aria-label={`Navigate to ${page.name}`}
                  >
                    {page.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    </Collapse>
  );
};

export default NavigationMenu;
