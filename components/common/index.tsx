import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, LEGAL_DISCLAIMER } from '../../theme';

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}
export const Button = ({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, style,
}: ButtonProps) => {
  const bg = {
    primary: COLORS.emerald, secondary: COLORS.cream,
    ghost: 'transparent', danger: COLORS.coral,
  }[variant];
  const fg = {
    primary: COLORS.cream, secondary: COLORS.emerald,
    ghost: COLORS.emerald, danger: COLORS.cream,
  }[variant];
  const border = variant === 'secondary'
    ? { borderWidth: 1.5, borderColor: COLORS.emerald }
    : variant === 'ghost'
    ? { borderWidth: 1.5, borderColor: COLORS.charcoal + '25' }
    : {};
  const py = size === 'sm' ? SPACING.sm : size === 'lg' ? SPACING.lg : SPACING.md;
  return (
    <TouchableOpacity
      style={[
        styles.btn, { backgroundColor: bg, paddingVertical: py },
        border, (disabled || loading) && styles.btnDisabled, style,
      ]}
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={fg} size="small" />
        : <Text style={[styles.btnText, { color: fg }]}>{label}</Text>}
    </TouchableOpacity>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; }
export const Card = ({ children, style, onPress }: CardProps) =>
  onPress ? (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps { name: string; size?: number; color?: string; }
export const Avatar = ({ name, size = 40, color = COLORS.emerald }: AvatarProps) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', borderColor: color + '40' }]}>
      <Text style={[styles.avatarText, { color, fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { label: string; color?: string; }
export const Badge = ({ label, color = COLORS.emerald }: BadgeProps) => (
  <View style={[styles.badge, { backgroundColor: color + '18', borderColor: color + '35' }]}>
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

// ─── LegalBar ────────────────────────────────────────────────────────────────
export const LegalBar = () => (
  <View style={styles.legalBar}>
    <Text style={styles.legalBarText}>{LEGAL_DISCLAIMER}</Text>
  </View>
);

// ─── SectionHeader ───────────────────────────────────────────────────────────
interface SectionHeaderProps { title: string; action?: string; onAction?: () => void; }
export const SectionHeader = ({ title, action, onAction }: SectionHeaderProps) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── EmptyState ──────────────────────────────────────────────────────────────
interface EmptyStateProps { title: string; body: string; cta?: string; onCta?: () => void; }
export const EmptyState = ({ title, body, cta, onCta }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyDot} />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyBody}>{body}</Text>
    {cta && <Button label={cta} onPress={onCta!} size="sm" style={{ marginTop: SPACING.lg }} />}
  </View>
);

// ─── ErrorBanner ─────────────────────────────────────────────────────────────
interface ErrorBannerProps { message: string; onDismiss?: () => void; }
export const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorBannerText}>{message}</Text>
    {onDismiss && (
      <TouchableOpacity onPress={onDismiss} style={styles.errorDismiss}>
        <Text style={styles.errorDismissText}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = ({ style }: { style?: ViewStyle }) => (
  <View style={[styles.divider, style]} />
);

// ─── AmountDisplay ───────────────────────────────────────────────────────────
interface AmountDisplayProps { amount: number; size?: 'sm' | 'md' | 'lg'; color?: string; }
export const AmountDisplay = ({ amount, size = 'md', color = COLORS.charcoal }: AmountDisplayProps) => {
  const fs = size === 'sm' ? 18 : size === 'lg' ? 40 : 28;
  return (
    <Text style={{ fontSize: fs, fontWeight: '700', color, letterSpacing: -1 }}>
      {amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
    </Text>
  );
};

// ─── ProgressBar ─────────────────────────────────────────────────────────────
interface ProgressBarProps { progress: number; color?: string; }
export const ProgressBar = ({ progress, color = COLORS.emerald }: ProgressBarProps) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
  </View>
);

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btn: { borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, ...SHADOWS.sm },
  btnText: { ...TYPOGRAPHY.button },
  btnDisabled: { opacity: 0.45 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.charcoal + '0E' },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { fontWeight: '700' },
  badge: { borderRadius: RADIUS.pill, paddingVertical: 3, paddingHorizontal: SPACING.sm, borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { ...TYPOGRAPHY.caption, fontWeight: '600' },
  legalBar: { backgroundColor: COLORS.charcoal + '08', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl, alignItems: 'center' },
  legalBarText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60', fontStyle: 'italic', textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  sectionAction: { ...TYPOGRAPHY.bodySmall, color: COLORS.emerald, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl, paddingHorizontal: SPACING.xxl },
  emptyDot: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.emerald + '15', borderWidth: 2, borderColor: COLORS.emerald + '25', borderStyle: 'dashed', marginBottom: SPACING.xl },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.sm },
  emptyBody: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textAlign: 'center', lineHeight: 22 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.coral + '12', borderRadius: RADIUS.md, padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.coral, marginBottom: SPACING.md },
  errorBannerText: { ...TYPOGRAPHY.bodySmall, color: COLORS.coral, flex: 1, lineHeight: 18 },
  errorDismiss: { paddingLeft: SPACING.sm },
  errorDismissText: { color: COLORS.coral, fontSize: 14, fontWeight: '700' },
  divider: { height: 1, backgroundColor: COLORS.charcoal + '10', marginVertical: SPACING.md },
  progressTrack: { height: 6, backgroundColor: COLORS.charcoal + '12', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
