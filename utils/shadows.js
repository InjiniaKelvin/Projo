// Shadow utilities for consistent styling across the app
import { Platform } from 'react-native';

/**
 * Convert hex color to rgba
 * @param {string} hex - Hex color code (e.g. '#000000')
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} rgba color string
 */
function hexToRgba(hex, alpha) {
  const clean = (hex || '').replace('#', '');
  const r = parseInt(clean.substring(0, 2) || '0', 16);
  const g = parseInt(clean.substring(2, 4) || '0', 16);
  const b = parseInt(clean.substring(4, 6) || '0', 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Create a cross-platform shadow style.
 * On web it returns a boxShadow. On native it returns shadow props + elevation.
 */
export function createShadow({
  color = '#000',
  offset = { width: 0, height: 2 },
  opacity = 0.1,
  radius = 4,
  elevation = 2,
} = {}) {
  if (Platform.OS === 'web') {
    const offsetX = offset.width || 0;
    const offsetY = offset.height || 0;
    const rgba = hexToRgba(color, opacity);
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${rgba}`,
    };
  }

  // iOS / Android
  return {
    shadowColor: color,
    shadowOffset: { width: offset.width || 0, height: offset.height || 0 },
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: elevation,
  };
}

// Preset shadow styles
export const SHADOWS = {
  small: createShadow({ offset: { width: 0, height: 1 }, opacity: 0.05, radius: 2, elevation: 1 }),
  medium: createShadow({ offset: { width: 0, height: 2 }, opacity: 0.1, radius: 4, elevation: 2 }),
  large: createShadow({ offset: { width: 0, height: 4 }, opacity: 0.15, radius: 8, elevation: 4 }),
  button: createShadow({ color: '#007AFF', offset: { width: 0, height: 2 }, opacity: 0.12, radius: 4, elevation: 2 }),
  none: Platform.select({ web: { boxShadow: 'none' }, ios: { shadowOpacity: 0 }, android: { elevation: 0 } }),
};

export default { createShadow, SHADOWS };
