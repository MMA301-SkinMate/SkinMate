const COLORS = {
  // Stitch brand palette. Keep existing semantic keys for current screens.
  pink: '#F6E2E9',
  sage: '#B8CFB3',
  olive: '#84A282',

  primary: '#0f766e',
  primaryDark: '#0d5e56',
  primaryLight: '#2dd4bf',

  // Backgrounds & Surfaces
  background: '#FFFF',
  surface: '#f8fafc',
  card: '#ffffff',

  // Text Colors
  textMain: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textLight: '#ffffff',

  // Borders & Dividers
  border: '#f1f5f9',
  borderDark: '#e2e8f0',

  overlay: 'rgba(15, 23, 42, 0.62)',
  // Status & Feedback
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Shadows & Overlays
  shadow: '#000000',
  transparent: "transparent",
};

// Derive translucent layers from the shared palette, without defining another hue.
const withOpacity = (color, opacity) => {
  const hex = color.slice(1);
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, opacity))})`;
};

module.exports = { COLORS, withOpacity };
