// ─── Djangue Design System ────────────────────────────────────────────────────
// Paleta: esmeralda #0B6E4F · coral #E8744C · crema #FAF6F0 · carbón #1A1F1B

export const COLORS = {
  emerald:     '#0B6E4F',
  emeraldLight:'#12916A',
  emeraldDark: '#084F38',
  coral:       '#E8744C',
  coralLight:  '#EF9070',
  coralDark:   '#C95A34',
  cream:       '#FAF6F0',
  creamDark:   '#F0EAE0',
  charcoal:    '#1A1F1B',
  charcoalMid: '#3D4540',
  white:       '#FFFFFF',
  // Semánticos
  success:     '#0B6E4F',
  warning:     '#E8A84C',
  error:       '#E84C4C',
  info:        '#4C7BE8',
  // Escala de grises
  gray100:     '#F5F5F5',
  gray200:     '#EEEEEE',
  gray300:     '#DDDDDD',
  gray400:     '#BBBBBB',
  gray500:     '#999999',
  gray600:     '#666666',
};

export const TYPOGRAPHY = {
  h1:        { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:        { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:        { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.2 },
  body:      { fontSize: 15, fontWeight: '400' as const, letterSpacing: 0 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0 },
  label:     { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.5 },
  caption:   { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.2 },
  button:    { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.3 },
  mono:      { fontSize: 13, fontWeight: '500' as const, fontFamily: 'monospace' as const },
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  xxxl: 40,
};

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  pill: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#1A1F1B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1F1B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1F1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const LEGAL_DISCLAIMER = 'Djangue coordina la tanda y no custodia el dinero.';
