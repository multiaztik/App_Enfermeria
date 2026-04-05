/**
 * Sistema de colores para NurseAssess
 * Paleta clínica profesional con Dark Mode por defecto
 */

export const Colors = {
  // Primarios
  primary: '#0EA5E9',       // Sky Blue — Confianza médica
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  
  // Secundarios
  secondary: '#6366F1',     // Indigo — Profesionalismo
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',

  // Acentos
  accent: '#8B5CF6',        // Violet
  accentLight: '#A78BFA',

  // Semánticos
  success: '#22C55E',       // Verde — Sin alteraciones
  successLight: '#4ADE80',
  successDark: '#16A34A',
  successBg: 'rgba(34, 197, 94, 0.1)',

  danger: '#EF4444',        // Rojo — Alteraciones detectadas
  dangerLight: '#F87171',
  dangerDark: '#DC2626',
  dangerBg: 'rgba(239, 68, 68, 0.1)',

  warning: '#F59E0B',       // Ámbar — Precaución
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  warningBg: 'rgba(245, 158, 11, 0.1)',

  info: '#3B82F6',          // Blue — Informativo
  infoBg: 'rgba(59, 130, 246, 0.1)',

  // Fondos (Dark Mode)
  background: '#0F172A',    // Slate 900
  surface: '#1E293B',       // Slate 800
  card: '#334155',          // Slate 700
  cardHover: '#475569',     // Slate 600
  elevated: '#1E293B',

  // Bordes
  border: '#334155',
  borderLight: '#475569',
  borderFocused: '#0EA5E9',

  // Texto
  text: '#F8FAFC',          // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#64748B',     // Slate 500
  textInverse: '#0F172A',

  // Gradientes
  gradientPrimary: ['#0EA5E9', '#6366F1'] as const,
  gradientSuccess: ['#22C55E', '#10B981'] as const,
  gradientDanger: ['#EF4444', '#F97316'] as const,
  gradientDark: ['#0F172A', '#1E293B'] as const,

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Transparencias
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
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
