import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { LegalBar, ErrorBanner } from '../../components/common';

const PREFIXES = [
  { code: '+34', name: 'Espana' },
  { code: '+240', name: 'Guinea Ecuatorial' },
  { code: '+237', name: 'Camerun' },
  { code: '+234', name: 'Nigeria' },
  { code: '+33', name: 'Francia' },
  { code: '+44', name: 'Reino Unido' },
];

export default function PhoneScreen() {
  const router = useRouter();
  const { requestOTP, isLoading, error, clearError } = useAuthStore();
  const [prefix, setPrefix] = useState(PREFIXES[0]);
  const [phone, setPhone] = useState('');
  const [showPrefixes, setShowPrefixes] = useState(false);

  const handleContinue = async () => {
    clearError();
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) return;
    const fullPhone = prefix.code + phone.replace(/\D/g, '');
    try {
      await requestOTP(fullPhone);
      router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone, display: prefix.code + ' ' + phone } });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Volver</Text>
          </TouchableOpacity>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
            <Text style={styles.logoText}>djangue</Text>
          </View>
          <Text style={styles.title}>Iniciar sesion</Text>
          <Text style={styles.subtitle}>Introduce tu numero de telefono y te enviamos un codigo SMS para entrar.</Text>
        </View>

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <Text style={styles.label}>Numero de telefono</Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity style={styles.prefixBtn} onPress={() => setShowPrefixes(!showPrefixes)}>
            <Text style={styles.prefixText}>{prefix.code}</Text>
            <Text style={styles.prefixArrow}>v</Text>
          </TouchableOpacity>
          <View style={styles.phoneDivider} />
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="600 000 000"
            placeholderTextColor={COLORS.charcoal + '50'}
            keyboardType="phone-pad"
            maxLength={15}
            autoFocus
          />
        </View>

        {showPrefixes && (
          <View style={styles.prefixList}>
            {PREFIXES.map(p => (
              <TouchableOpacity
                key={p.code}
                style={[styles.prefixOption, prefix.code === p.code && styles.prefixOptionActive]}
                onPress={() => { setPrefix(p); setShowPrefixes(false); }}
              >
                <Text style={styles.prefixOptionCode}>{p.code}</Text>
                <Text style={styles.prefixOptionName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.smsInfo}>
          <Text style={styles.smsInfoText}>Te enviamos un codigo de 6 digitos por SMS.</Text>
        </View>

        <TouchableOpacity
          style={[styles.cta, (isLoading || phone.length < 7) && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={isLoading || phone.length < 7}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{isLoading ? 'Enviando...' : 'Enviar codigo SMS'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLinkText}>No tengo cuenta. Registrarme</Text>
        </TouchableOpacity>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header: { paddingTop: SPACING.md, marginBottom: SPACING.xl },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600', marginBottom: SPACING.lg },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText: { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 24 },
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', overflow: 'hidden', marginBottom: SPACING.md },
  prefixBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, gap: SPACING.xs },
  prefixText: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  prefixArrow: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', fontSize: 10 },
  phoneDivider: { width: 1, height: 24, backgroundColor: COLORS.charcoal + '20' },
  phoneInput: { flex: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal },
  prefixList: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.charcoal + '15', marginBottom: SPACING.lg, ...SHADOWS.md },
  prefixOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.charcoal + '08', gap: SPACING.sm },
  prefixOptionActive: { backgroundColor: COLORS.emerald + '0E' },
  prefixOptionCode: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700', width: 48 },
  prefixOptionName: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', flex: 1 },
  smsInfo: { backgroundColor: COLORS.charcoal + '06', borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.xl },
  smsInfoText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', textAlign: 'center' },
  cta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md, marginBottom: SPACING.md },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  registerLink: { alignItems: 'center', paddingVertical: SPACING.md },
  registerLinkText: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textDecorationLine: 'underline' },
});
