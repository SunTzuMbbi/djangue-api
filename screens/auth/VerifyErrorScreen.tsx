import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

export default function VerifyErrorScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const reasons: Record<string, string> = {
    blurry: 'La imagen del documento está borrosa. Asegúrate de tener buena iluminación y enfoque.',
    expired: 'El documento ha caducado. Usa un documento válido y en vigor.',
    mismatch: 'Los datos del documento no coinciden con tu selfie. Asegúrate de usar tu propio documento.',
    unreadable: 'No pudimos leer el texto del documento. Fotografíalo completo y sin reflejos.',
    default: 'La verificación no pudo completarse. Por favor, inténtalo de nuevo con mejores condiciones.',
  };
  const msg = reasons[reason || 'default'] || reasons['default'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>!</Text>
        </View>
        <Text style={styles.title}>Verificación rechazada</Text>
        <Text style={styles.body}>{msg}</Text>
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Consejos para el reintento</Text>
          {['Usa luz natural o iluminación directa.', 'Coloca el documento sobre superficie oscura.', 'Evita reflejos y sombras.', 'Para el selfie: mira directamente, sin accesorios.'].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.cta} onPress={() => router.replace('/(auth)/pre-camera')} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Intentar de nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.later} onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.laterText}>Verificar más tarde</Text>
        </TouchableOpacity>
        <Text style={styles.legal}>Djangue coordina la tanda y no custodia el dinero.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, ...SHADOWS.lg },
  iconText: { fontSize: 36, color: COLORS.cream, fontWeight: '700' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.md },
  body: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
  tips: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, width: '100%', marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.charcoal + '10' },
  tipsTitle: { ...TYPOGRAPHY.label, color: COLORS.charcoal, marginBottom: SPACING.md, fontWeight: '700' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm, gap: SPACING.sm },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.coral, marginTop: 6, flexShrink: 0 },
  tipText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', flex: 1, lineHeight: 18 },
  cta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, ...SHADOWS.md, marginBottom: SPACING.md, width: '100%', alignItems: 'center' },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
  later: { paddingVertical: SPACING.sm },
  laterText: { ...TYPOGRAPHY.bodySmall, color: COLORS.charcoal + '60', textDecorationLine: 'underline' },
  legal: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '50', fontStyle: 'italic', textAlign: 'center', marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
});
