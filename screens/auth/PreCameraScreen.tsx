import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { LegalBar } from '../../components/common';

export default function PreCameraScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
            <Text style={styles.logoText}>djangue</Text>
          </View>
        </View>

        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Text style={styles.iconEmoji}>✉</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Verifica tu identidad</Text>
        <Text style={styles.subtitle}>
          Para participar en tandas necesitamos verificar que eres tú. Te enviaremos un correo de verificación a tu email registrado.
        </Text>

        <View style={styles.steps}>
          {[
            { n: '1', text: 'Revisa tu bandeja de entrada' },
            { n: '2', text: 'Abre el correo de Djangue' },
            { n: '3', text: 'Haz clic en el enlace de verificación' },
          ].map(s => (
            <View key={s.n} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{s.n}</Text>
              </View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.replace('/(main)/home')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Entendido, verificare mi correo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.later} onPress={() => router.replace('/(main)/home')}>
          <Text style={styles.laterText}>Verificar mas tarde</Text>
        </TouchableOpacity>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.cream },
  scroll:       { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header:       { paddingTop: SPACING.md, marginBottom: SPACING.xl },
  backBtn:      { marginBottom: SPACING.lg },
  backText:     { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logoCircle:   { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot:      { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText:     { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  iconWrap:     { alignItems: 'center', marginVertical: SPACING.xxl },
  iconOuter:    { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.emerald + '15', borderWidth: 2, borderColor: COLORS.emerald + '30', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  iconInner:    { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald + '20', alignItems: 'center', justifyContent: 'center' },
  iconEmoji:    { fontSize: 36, color: COLORS.emerald },
  title:        { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.md },
  subtitle:     { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
  steps:        { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl, gap: SPACING.md, ...SHADOWS.sm },
  step:         { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  stepNum:      { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText:  { color: COLORS.cream, fontWeight: '700', fontSize: 14 },
  stepText:     { ...TYPOGRAPHY.body, color: COLORS.charcoal, flex: 1 },
  cta:          { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md, marginBottom: SPACING.md },
  ctaText:      { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 15 },
  later:        { alignItems: 'center', paddingVertical: SPACING.sm },
  laterText:    { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60', textDecorationLine: 'underline' },
});
