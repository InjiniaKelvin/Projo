/**
 * Shadow Helper Utility
 * Converts React Native shadow props to proper web boxShadow
 */
import { Platform } from 'react-native';

/**
 * Generate cross-platform shadow styles
 * @param {Object} options - Shadow configuration
 * @param {string} options.color - Shadow color (default: '#000')
 * @param {Object} options.offset - Shadow offset {width, height}
 * @param {number} options.opacity - Shadow opacity (0-1)
 * @param {number} options.radius - Shadow blur radius
 * @param {number} options.elevation - Android elevation (optional)
 * @returns {Object} Platform-specific shadow styles
 */
export const createShadow = ({
  color = '#000',
  offset = { width: 0, height: 2 },
  opacity = 0.1,
  radius = 4,
  elevation = 2
}) => {
  if (Platform.OS === 'web') {
    // Convert to web boxShadow
    const offsetX = offset.width;
    const offsetY = offset.height;
    const rgbaColor = hexToRgba(color, opacity);
    
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgbaColor}`
    };
  }
  
  // iOS shadow props
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius
    };
  }
  
  // Android elevation
  return {
    elevation: elevation
  };
};

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color code
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
function hexToRgba(hex, alpha) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Preset shadow styles
 */
export const SHADOWS = {
  small: createShadow({
    color: '#000',
    offset: { width: 0, height: 1 },
    opacity: 0.05,
    radius: 2,
    elevation: 1
  }),
  
  medium: createShadow({
    color: '#000',
    offset: { width: 0, height: 2 },
    opacity: 0.1,
    radius: 4,
    elevation: 2
  }),
  
  large: createShadow({
    color: '#000',
    offset: { width: 0, height: 4 },
    opacity: 0.15,
    radius: 8,
    elevation: 4
  }),
  
  button: createShadow({
    color: '#007AFF',
    offset: { width: 0, height: 2 },
    opacity: 0.2,
    radius: 4,
    elevation: 2
  }),
  
  none: Platform.select({
    web: { boxShadow: 'none' },
    ios: { shadowOpacity: 0 },
    android: { elevation: 0 }
  })
};

export default { createShadow, SHADOWS };
