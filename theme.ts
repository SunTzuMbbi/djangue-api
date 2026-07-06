export const COLORS = {
  emerald:   '#0B6E4F',  // verde original
  coral:     '#E17055',
  navy:      '#1A2456',
  gold:      '#F4A824',
  purple:    '#6C5CE7',
  blue:      '#0984E3',
  cream:     '#FAFAF8',
  white:     '#FFFFFF',
  charcoal:  '#1A2456',
  bgLight:   '#F5F9F7',
};

export const TYPOGRAPHY = {
  h1:       { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:       { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:       { fontSize: 18, fontWeight: '600' as const },
  body:     { fontSize: 15, fontWeight: '400' as const },
  bodySmall:{ fontSize: 13, fontWeight: '400' as const },
  button:   { fontSize: 15, fontWeight: '600' as const, letterSpacing: 0.2 },
  label:    { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
  caption:  { fontSize: 12, fontWeight: '400' as const },
};

export const SPACING = {
  xs:   4, sm:  8, md:  12,
  lg:  16, xl: 20, xxl: 28, xxxl: 40,
};

export const RADIUS = {
  sm: 8, md: 12, lg: 16, xl: 24, pill: 100, full: 999,
};

export const SHADOWS = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  colored: (color: string) => ({ shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 }),
};

export const LEGAL_DISCLAIMER = 'Djangue coordina la tanda y no custodia el dinero.';
