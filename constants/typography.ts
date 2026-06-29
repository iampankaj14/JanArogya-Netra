import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      mono: 'Courier',
    },
    android: {
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      bold: 'sans-serif-bold',
      mono: 'monospace',
    },
    default: {
      regular: 'sans-serif',
      medium: 'sans-serif-medium',
      bold: 'sans-serif-bold',
      mono: 'monospace',
    },
  }),
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    heading: 36,
  },
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 36,
    heading: 44,
  },
};

export default typography;
