/**
 * Map Configuration Constants
 * 
 * Configuration settings for the map component following ISO standards.
 */

export const mapConfig = {
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 8,
  MAX_ZOOM: 19,
  POSITION_THRESHOLD: 0.0001,
  OFFSET_MULTIPLIER: 0.0001,
  MARKER_SIZE: [40, 40],
  POPUP_MAX_WIDTH: 300,
  UPDATE_INTERVAL: 30000 // 30 seconds
};

export const projectLocations = {
  primary: { 
    lat: 23.879132, 
    lng: 90.502617, 
    name: 'Primary Office' 
  },
  route: {
    start: { 
      lat: 23.987057, 
      lng: 90.361908, 
      name: 'Route Start' 
    },
    end: { 
      lat: 23.690618, 
      lng: 90.546729, 
      name: 'Route End' 
    }
  }
};
