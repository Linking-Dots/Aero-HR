import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Box, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import { Link, usePage } from "@inertiajs/react";
import {
  Button,
  Accordion,
  AccordionItem,
  Divider,
  ScrollShadow,
  Chip,
  Input,
  Avatar,
  Badge,
  Tooltip
} from "@heroui/react";
import {
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  StarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import GlassCard from "@/Components/GlassCard.jsx";
import { GRADIENT_PRESETS, getTextGradientClasses, getIconGradientClasses } from '@/utils/gradientUtils.js';
import { getThemePrimaryColor, hexToRgba } from '@/theme.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../../public/assets/images/logo.png';

// Helper function to highlight search matches
const highlightSearchMatch = (text, searchTerm) => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span 
          key={index} 
          className="bg-primary/20 text-primary-300 px-1 py-0.5 rounded-md font-semibold border border-primary/30 shadow-sm"
          style={{ 
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#93C5FD',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

// Custom hook for sidebar state management
const useSidebarState = () => {
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar-open-submenus');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const saveSubMenuState = useCallback((newSubMenus) => {
    try {
      localStorage.setItem('sidebar-open-submenus', JSON.stringify(Array.from(newSubMenus)));
    } catch (error) {
      console.warn('Failed to save submenu state to localStorage:', error);
    }
  }, []);

  const clearAllState = useCallback(() => {
    try {
      localStorage.removeItem('sidebar-open-submenus');
      localStorage.removeItem('sidebar-open');
      setOpenSubMenus(new Set());
    } catch (error) {
      console.warn('Failed to clear sidebar state:', error);
    }
  }, []);

  return {
    openSubMenus,
    setOpenSubMenus,
    saveSubMenuState,
    clearAllState
  };
};

const Sidebar = React.memo(({ toggleSideBar, pages, url, sideBarOpen }) => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { auth, app } = usePage().props;
  
  const {
    openSubMenus,
    setOpenSubMenus,
    saveSubMenuState,
    clearAllState
  } = useSidebarState();

  const [activePage, setActivePage] = useState(url);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  
  // Debounce search term to improve performance
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200); // 200ms delay
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);
  
  // Stable references for theme colors
  const themeColor = useMemo(() => getThemePrimaryColor(muiTheme), [muiTheme]);
  const themeColorRgba = useMemo(() => hexToRgba(themeColor, 0.5), [themeColor]);
  
  // Stable grouped pages reference with search filtering
  const groupedPages = useMemo(() => {
    let allPages = pages;
    
    // Filter pages based on debounced search term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      
      const filterPagesRecursively = (pagesList) => {
        return pagesList.filter(page => {
          // Check if page name matches
          const nameMatches = page.name.toLowerCase().includes(searchLower);
          
          // Check if any submenu items match
          let hasMatchingSubMenu = false;
          if (page.subMenu) {
            const filteredSubMenu = filterPagesRecursively(page.subMenu);
            hasMatchingSubMenu = filteredSubMenu.length > 0;
            // Update the page with filtered submenu for display
            if (hasMatchingSubMenu) {
              page = { ...page, subMenu: filteredSubMenu };
            }
          }
          
          return nameMatches || hasMatchingSubMenu;
        });
      };
      
      allPages = filterPagesRecursively(pages);
    }
    
    const mainPages = allPages.filter(page => !page.category || page.category === 'main');
    const settingsPages = allPages.filter(page => page.category === 'settings');
    
    return { mainPages, settingsPages };
  }, [pages, debouncedSearchTerm]);

  // Auto-expand menus when searching
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      // Expand all menus that have matching items when searching
      const expandAllWithMatches = (pagesList, expandedSet = new Set()) => {
        pagesList.forEach(page => {
          if (page.subMenu) {
            const searchLower = debouncedSearchTerm.toLowerCase();
            const hasMatches = page.subMenu.some(subPage => {
              const matches = subPage.name.toLowerCase().includes(searchLower);
              if (subPage.subMenu) {
                return matches || expandAllWithMatches([subPage], expandedSet);
              }
              return matches;
            });
            
            if (hasMatches) {
              expandedSet.add(page.name);
              expandAllWithMatches(page.subMenu, expandedSet);
            }
          }
        });
        return expandedSet;
      };
      
      const newExpandedMenus = expandAllWithMatches(pages);
      setOpenSubMenus(newExpandedMenus);
    }
  }, [debouncedSearchTerm, pages]);

  // Update active page when URL changes (optimized)
  useEffect(() => {
    setActivePage(url);
    
    // Auto-expand parent menu if a submenu item is active
    const expandParentMenus = (menuItems, targetUrl, parentNames = []) => {
      for (const page of menuItems) {
        const currentParents = [...parentNames, page.name];
        
        // Check if this page matches the current URL
        if (page.route && "/" + page.route === targetUrl) {
          // Expand all parent menus
          setOpenSubMenus(prev => {
            const newSet = new Set([...prev, ...currentParents.slice(0, -1)]);
            saveSubMenuState(newSet);
            return newSet;
          });
          return true;
        }
        
        // Check submenu recursively
        if (page.subMenu) {
          if (expandParentMenus(page.subMenu, targetUrl, currentParents)) {
            return true;
          }
        }
      }
      return false;
    };
    
    expandParentMenus(pages, url);
  }, [url, pages, saveSubMenuState]);

  // Stable callback handlers
  const handleSubMenuToggle = useCallback((pageName) => {
    setOpenSubMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageName)) {
        newSet.delete(pageName);
      } else {
        newSet.add(pageName);
      }
      
      // Save to localStorage
      saveSubMenuState(newSet);
      
      return newSet;
    });
  }, [saveSubMenuState]);

  const handlePageClick = useCallback((pageName) => {
    setActivePage(pageName);
    // Clear search when navigating to a page
    setSearchTerm('');
    if (isMobile) {
      toggleSideBar();
    }
  }, [isMobile, toggleSideBar]);

  const renderCompactMenuItem = useCallback((page, isSubMenu = false, level = 0) => {
    const isActive = activePage === "/" + page.route;
    const hasActiveSubPage = page.subMenu?.some(
      subPage => {
        if (subPage.route) return "/" + subPage.route === activePage;
        if (subPage.subMenu) return subPage.subMenu.some(nestedPage => "/" + nestedPage.route === activePage);
        return false;
      }
    );
    const isExpanded = openSubMenus.has(page.name);
    const activeStyle = isActive || hasActiveSubPage ? {
      background: themeColorRgba,
      borderLeft: `3px solid ${themeColor}`,
      color: themeColor,
    } : {};
    
    // Enhanced responsive sizing
    const paddingLeft = level === 0 ? (isMobile ? 'px-3' : 'px-2') : level === 1 ? (isMobile ? 'px-4' : 'px-3') : (isMobile ? 'px-5' : 'px-4');
    const height = level === 0 ? (isMobile ? 'h-11' : 'h-10') : level === 1 ? (isMobile ? 'h-10' : 'h-9') : (isMobile ? 'h-9' : 'h-8');
    const iconSize = level === 0 ? (isMobile ? 'w-4 h-4' : 'w-3 h-3') : level === 1 ? 'w-3 h-3' : 'w-3 h-3';
    const textSize = level === 0 ? (isMobile ? 'text-sm' : 'text-sm') : level === 1 ? 'text-xs' : 'text-xs';
    
    if (page.subMenu) {
      return (
        <motion.div 
          key={`menu-item-${page.name}-${level}`} 
          className="w-full"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="light"
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={
              <div style={hasActiveSubPage ? { color: 'white' } : {}}>
                {React.cloneElement(page.icon, { className: iconSize })}
              </div>
            }
            endContent={
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ChevronRightIcon 
                  className="w-3 h-3"
                  style={isExpanded ? { color: themeColor } : {}}
                />
              </motion.div>
            }
            className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 rounded-xl mb-0.5`}
            style={activeStyle}
            onPress={() => handleSubMenuToggle(page.name)}
            size="sm"
          >
            <div className="flex items-center justify-between w-full">
              <span className={`${textSize} font-medium`} style={hasActiveSubPage ? { color: 'white' } : {}}>
                {highlightSearchMatch(page.name, searchTerm)}
              </span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Chip
                  size="sm"
                  variant="flat"
                  className={`text-xs ${isMobile ? 'h-5 min-w-5 px-1' : 'h-4 min-w-4 px-1'} transition-all duration-300`}
                  style={hasActiveSubPage ? { background: themeColorRgba, color: 'white' } : {}}
                >
                  {page.subMenu.length}
                </Chip>
              </motion.div>
            </div>
          </Button>
          {/* Enhanced Submenu with AnimatePresence */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key={`submenu-${page.name}-${level}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`${level === 0 ? (isMobile ? 'ml-8' : 'ml-6') : (isMobile ? 'ml-6' : 'ml-4')} mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3`}>
                  {page.subMenu.map((subPage, index) => (
                    <motion.div
                      key={`subitem-${page.name}-${subPage.name}-${level}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      {renderCompactMenuItem(subPage, true, level + 1)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    }
    
    // No submenu - leaf item
    if (page.route) {
      return (
        <motion.div
          key={`route-item-${page.name}-${level}`}
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            as={Link}
            href={route(page.route)}
            method={page.method}
            preserveState
            preserveScroll
            variant="light"
            startContent={
              <motion.div 
                style={isActive ? { color: 'white' } : {}}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {React.cloneElement(page.icon, { className: iconSize })}
              </motion.div>
            }
            className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 rounded-xl mb-0.5`}
            style={isActive ? { background: themeColorRgba, borderLeft: `3px solid ${themeColor}`, color: 'white' } : {}}
            onPress={() => handlePageClick(page.name)}
            size="sm"
          >
            <span className={`${textSize} font-medium`} style={isActive ? { color: 'white' } : {}}>
              {highlightSearchMatch(page.name, searchTerm)}
            </span>
          </Button>
        </motion.div>
      );
    }
    
    // Category header without route
    return (
      <motion.div 
        key={`category-item-${page.name}-${level}`} 
        className="w-full"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant="light"
          color={hasActiveSubPage ? "primary" : "default"}
          startContent={
            <div style={hasActiveSubPage ? { color: 'white' } : {}}>
              {React.cloneElement(page.icon, { className: iconSize })}
            </div>
          }
          endContent={
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ChevronRightIcon 
                className="w-3 h-3"
                style={isExpanded ? { color: 'white' } : {}}
              />
            </motion.div>
          }
          className={`w-full justify-start ${height} ${paddingLeft} bg-transparent hover:bg-white/10 transition-all duration-200 rounded-xl mb-0.5`}
          style={activeStyle}
          onPress={() => handleSubMenuToggle(page.name)}
          size="sm"
        >
          <div className="flex items-center justify-between w-full">
            <span className={`${textSize} font-medium`} style={hasActiveSubPage ? { color: 'white' } : {}}>
              {highlightSearchMatch(page.name, searchTerm)}
            </span>
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Chip
                size="sm"
                variant="flat"
                className={`text-xs ${isMobile ? 'h-5 min-w-5 px-1' : 'h-4 min-w-4 px-1'} transition-all duration-300`}
                style={hasActiveSubPage ? { background: themeColorRgba, color: 'white' } : {}}
              >
                {page.subMenu?.length || 0}
              </Chip>
            </motion.div>
          </div>
        </Button>
        {/* Enhanced Submenu with AnimatePresence */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key={`category-submenu-${page.name}-${level}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className={`${level === 0 ? (isMobile ? 'ml-8' : 'ml-6') : (isMobile ? 'ml-6' : 'ml-4')} mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3`}>
                {page.subMenu?.map((subPage, index) => (
                  <motion.div
                    key={`category-subitem-${page.name}-${subPage.name}-${level}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    {renderCompactMenuItem(subPage, true, level + 1)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick, themeColor, themeColorRgba, isMobile, searchTerm]);

  const renderMenuItem = useCallback((page, isSubMenu = false, level = 0) => {
    const isActive = page.route && activePage === "/" + page.route;
    const hasActiveSubPage = page.subMenu?.some(
      subPage => {
        if (subPage.route) return "/" + subPage.route === activePage;
        if (subPage.subMenu) return subPage.subMenu.some(nestedPage => "/" + nestedPage.route === activePage);
        return false;
      }
    );
    const isExpanded = openSubMenus.has(page.name);

    const marginLeft = level === 0 ? '' : level === 1 ? 'ml-8' : 'ml-12';
    const paddingLeft = level === 0 ? 'pl-4' : level === 1 ? 'pl-6' : 'pl-8';

    if (page.subMenu) {
      return (
        <div key={`full-menu-item-${page.name}-${level}`} className="w-full">
          <Button
            variant="light"
            color={hasActiveSubPage ? "primary" : "default"}
            startContent={
              <div>
                {page.icon}
              </div>
            }
            endContent={
              <ChevronRightIcon 
                className={`w-4 h-4 transition-all duration-300 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                style={isExpanded ? { color: themeColor } : {}}
              />
            }
            className={`w-full justify-start h-14 ${paddingLeft} pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group hover:scale-105 ${
              hasActiveSubPage 
                ? `${GRADIENT_PRESETS.accentCard} border-l-4 border-blue-500 shadow-lg` 
                : 'hover:border-l-4 hover:border-blue-500/30'
            }`}
            onPress={() => handleSubMenuToggle(page.name)}
            size="md"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-start">
                <span className={`font-semibold text-sm ${hasActiveSubPage ? 'text-white' : 'text-foreground'}`}>
                  {highlightSearchMatch(page.name, searchTerm)}
                </span>
                <span className="text-xs text-default-400 group-hover:text-default-500 transition-colors">
                  {page.subMenu.length} {level === 0 ? 'categories' : 'modules'}
                </span>
              </div>
              <Chip
                size="sm"
                variant="flat"
                className={`transition-all duration-300 ${
                  hasActiveSubPage 
                    ? `${GRADIENT_PRESETS.accentCard} text-white` 
                    : 'bg-white/10 text-default-500 group-hover:bg-white/20'
                }`}
              >
                {page.subMenu.length}
              </Chip>
            </div>
          </Button>
          
          {/* Submenu Items with Animation */}
          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className={`${marginLeft} mt-2 space-y-1 border-l-2 border-primary/20 pl-4 relative`}>
              {page.subMenu.map((subPage, index) => (
                <div
                  key={`full-submenu-${page.name}-${subPage.name}-${level}-${index}`}
                  className={`transform transition-all duration-300 delay-${index * 50} ${
                    isExpanded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
                >
                  {renderMenuItem(subPage, true, level + 1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // No submenu - either a route or category
    if (page.route) {
      return (
        <Button
          key={`full-route-item-${page.name}-${level}`}
          as={Link}
          href={route(page.route)}
          method={page.method}
          preserveState
          preserveScroll
          variant="light"
          startContent={
            <div >
              {page.icon}
            </div>
          }
          className={`w-full justify-start h-11 ${paddingLeft} pr-4 bg-transparent hover:bg-white/10 transition-all duration-300 group hover:scale-105 ${
            isActive 
              ? `${GRADIENT_PRESETS.accentCard} border-l-3 border-blue-500 text-white shadow-md` 
              : 'hover:border-l-3 hover:border-blue-500/30'
          }`}
          onPress={() => handlePageClick(page.name)}
          size="sm"
        >
          <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-foreground'}`}>
            {highlightSearchMatch(page.name, searchTerm)}
          </span>
        </Button>
      );
    }

    // Category without route - just display as header
    return (
      <div key={`full-category-item-${page.name}-${level}`} className="w-full">
        <div className={`${paddingLeft} pr-4 py-2`}>
          <div className="flex items-center gap-2">
            <div>
              {page.icon}
            </div>
            <span className="text-sm font-semibold text-foreground/80">
              {highlightSearchMatch(page.name, searchTerm)}
            </span>
          </div>
        </div>
      </div>
    );
  }, [activePage, openSubMenus, handleSubMenuToggle, handlePageClick, searchTerm]);

  const SidebarContent = useMemo(() => (
    <motion.div 
      className="flex flex-col h-full w-full overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Fixed Header - Using PageHeader theming */}
      <motion.div 
        className={`${GRADIENT_PRESETS.pageHeader} flex-shrink-0`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {/* Enhanced Logo Display */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl overflow-hidden ${GRADIENT_PRESETS.iconContainer}`}>
                  <img 
                    src={logo} 
                    alt={`${app?.name || 'Company'} Logo`} 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      // Fallback to text logo if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    className="font-black text-white text-sm absolute inset-0 flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    A
                  </Typography>
                </div>
                {/* Status Indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
              </div>
              
              {/* Brand Information */}
              <div className="flex flex-col leading-tight">
                <Typography variant="body1" className={`font-bold text-base ${GRADIENT_PRESETS.gradientText}`}>
                  {app?.name || 'Company Name'}
                </Typography>
                <Typography variant="caption" className="text-default-400 text-xs font-medium">
                  Enterprise Suite
                </Typography>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={toggleSideBar}
                className="text-foreground hover:bg-white/10 transition-all duration-200 min-w-6 w-6 h-6"
              >
                <XMarkIcon className="w-3 h-3" />
              </Button>
            </motion.div>
          </div>
          
          {/* User Info - Fixed size */}
          {auth.user && (
            <motion.div 
              className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${GRADIENT_PRESETS.accentCard}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <Avatar
                  size="sm"
                  src={auth.user.profile_image}
                  fallback={auth.user.first_name?.charAt(0)}
                  className="w-6 h-6 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Typography variant="caption" className="font-medium text-foreground truncate block">
                    {auth.user.first_name} {auth.user.last_name}
                  </Typography>
                  {auth.user.roles && auth.user.roles.length > 0 && (
                    <Typography variant="caption" className="text-default-400 text-xs truncate block">
                      {auth.user.roles[0].name}
                    </Typography>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scrollable Navigation Content */}
      <motion.div 
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <ScrollShadow className="h-full" hideScrollBar size={5}>
          <div className="p-2 space-y-2">
            
            {/* Quick Search */}
            <motion.div 
              className="px-1 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Input
                size="sm"
                placeholder="Search navigation..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<MagnifyingGlassIcon className="w-3 h-3 text-default-400" />}
                isClearable
                variant="bordered"
                className="text-xs"
                classNames={{
                  input: "text-xs",
                  inputWrapper: "h-8 min-h-8 bg-white/5 border-white/10 hover:border-white/20 focus-within:border-primary/50"
                }}
              />
            </motion.div>
            
            {/* Main Navigation - Enhanced */}
            {groupedPages.mainPages.length > 0 && (
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <HomeIcon className="w-3 h-3 text-primary" />
                  <Typography variant="caption" className="text-primary font-bold text-xs uppercase tracking-wide">
                    Main
                  </Typography>
                  <div className="flex-1 h-px bg-primary/20"></div>
                </div>
                {groupedPages.mainPages.map((page, index) => (
                  <motion.div
                    key={`main-page-${page.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.7 + (index * 0.05) }}
                  >
                    {renderCompactMenuItem(page)}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Settings Section - Enhanced */}
            {groupedPages.settingsPages.length > 0 && (
              <motion.div 
                className="space-y-1 mt-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <ShieldCheckIcon className="w-3 h-3 text-warning" />
                  <Typography variant="caption" className="text-warning font-bold text-xs uppercase tracking-wide">
                    Admin
                  </Typography>
                  <div className="flex-1 h-px bg-warning/20"></div>
                </div>
                {groupedPages.settingsPages.map((page, index) => (
                  <motion.div
                    key={`settings-page-${page.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.9 + (index * 0.05) }}
                  >
                    {renderCompactMenuItem(page)}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* All Pages fallback - Enhanced */}
            {groupedPages.mainPages.length === 0 && groupedPages.settingsPages.length === 0 && !searchTerm.trim() && (
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <StarIcon className="w-3 h-3 text-secondary" />
                  <Typography variant="caption" className="text-secondary font-bold text-xs uppercase tracking-wide">
                    Modules
                  </Typography>
                  <div className="flex-1 h-px bg-secondary/20"></div>
                </div>
                {pages.map((page, index) => (
                  <motion.div
                    key={`all-page-${page.name}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.7 + (index * 0.05) }}
                  >
                    {renderCompactMenuItem(page)}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* No search results message */}
            {searchTerm.trim() && groupedPages.mainPages.length === 0 && groupedPages.settingsPages.length === 0 && (
              <motion.div 
                className="flex flex-col items-center justify-center py-8 px-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <MagnifyingGlassIcon className="w-8 h-8 text-default-300 mb-3" />
                <Typography variant="body2" className="text-default-400 text-center text-sm font-medium mb-1">
                  No results found
                </Typography>
                <Typography variant="caption" className="text-default-300 text-center text-xs">
                  Try searching with different keywords
                </Typography>
              </motion.div>
            )}

            {/* Quick Actions - New Feature */}
            {!searchTerm.trim() && (
              <motion.div 
                className="space-y-1 mt-6 pt-4 border-t border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.0 }}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <ClockIcon className="w-3 h-3 text-success" />
                  <Typography variant="caption" className="text-success font-bold text-xs uppercase tracking-wide">
                    Quick Actions
                  </Typography>
                  <div className="flex-1 h-px bg-success/20"></div>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<ClockIcon className="w-3 h-3" />}
                    className="w-full justify-start h-8 px-4 bg-transparent hover:bg-success/10 transition-all duration-200 rounded-xl text-xs"
                  >
                    Recent Activities
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<StarIcon className="w-3 h-3" />}
                    className="w-full justify-start h-8 px-4 bg-transparent hover:bg-warning/10 transition-all duration-200 rounded-xl text-xs"
                  >
                    Favorites
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </ScrollShadow>
      </motion.div>

      {/* Fixed Footer - Using PageHeader theming */}
      <motion.div 
        className="p-2 border-t border-white/10 flex-shrink-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1.1 }}
      >
        <div className={`flex items-center justify-between p-2 rounded-md backdrop-blur-sm transition-all duration-300 ${GRADIENT_PRESETS.accentCard}`}>
          <div className="flex items-center gap-1">
            <motion.div 
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-foreground">Online</span>
          </div>
          <Typography variant="caption" className="text-default-500 text-xs">
            v2.1.0
          </Typography>
        </div>
      </motion.div>
    </motion.div>
  ), [
    auth.user, 
    groupedPages.mainPages, 
    groupedPages.settingsPages, 
    renderCompactMenuItem, 
    toggleSideBar,
    searchTerm
  ]);
  // Unified Sidebar for both Mobile and Desktop
  return (
    <Box sx={{ 
      p: isMobile ? 0 : 1, 
      height: '100vh', // Fix to viewport height
      width: 'fit-content',
      minWidth: isMobile ? '260px' : '240px',
      maxWidth: isMobile ? '280px' : '280px',
      overflow: 'hidden', // Prevent container scrolling
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="h-full flex flex-col">
        <GlassCard className="h-full flex flex-col overflow-hidden">
          {SidebarContent}
        </GlassCard>
      </div>
    </Box>
  );
});

export default Sidebar;
