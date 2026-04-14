/**
 * Sistema de colores para BitCare / NurseAssess
 * Paleta clínica limpia: blanco, negro y grises — inspirada en el wireframe
 */

export const Colors = {
  // Primarios
  primary: '#111111',       // Negro principal
  primaryLight: '#444444',
  primaryDark: '#000000',

  // Secundarios
  secondary: '#555555',     // Gris medio
  secondaryLight: '#888888',
  secondaryDark: '#333333',

  // Acentos
  accent: '#111111',
  accentLight: '#444444',

  // Semánticos
  success: '#22C55E',
  successLight: '#4ADE80',
  successDark: '#16A34A',
  successBg: 'rgba(34, 197, 94, 0.1)',

  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  dangerBg: 'rgba(239, 68, 68, 0.08)',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningBg: 'rgba(245, 158, 11, 0.08)',

  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.08)',

  // Fondos (Light mode - según wireframe)
  background: '#F5F5F5',    // Gris muy claro
  surface: '#FFFFFF',       // Blanco puro
  card: '#F0F0F0',          // Gris claro
  cardHover: '#E8E8E8',
  elevated: '#FFFFFF',

  // Bordes
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderFocused: '#111111',

  // Texto
  text: '#111111',          // Negro
  textSecondary: '#666666', // Gris oscuro
  textMuted: '#999999',     // Gris claro
  textInverse: '#FFFFFF',

  // Gradientes (para compatibilidad)
  gradientPrimary: ['#111111', '#444444'] as const,
  gradientSuccess: ['#22C55E', '#10B981'] as const,
  gradientDanger: ['#EF4444', '#F97316'] as const,
  gradientDark: ['#111111', '#333333'] as const,

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',

  // Transparencias
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  }),
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 36,
} as const;
