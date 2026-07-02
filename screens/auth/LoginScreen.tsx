import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { LegalBar, ErrorBanner } from '../../components/common';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    clearError();
    if (!email.trim() || !password) return;
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(main)/home');
    } catch (_) {}
  };

  const isDisabled = !email.trim() || password.length < 6 || isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
            <Text style={styles.logoText}>djangue</Text>
          </View>
          <Text style={styles.title}>Iniciar sesion</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta con tu email y contrasena.</Text>
        </View>

        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com"
          placeholderTextColor={COLORS.charcoal + '50'}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>Contrasena</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Minimo 6 caracteres"
          placeholderTextColor={COLORS.charcoal + '50'}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.cta, isDisabled && styles.ctaDisabled]}
          onPress={handleLogin}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.cream} />
            : <Text style={styles.ctaText}>Entrar</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>No tengo cuenta. Registrarme</Text>
        </TouchableOpacity>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.cream },
  scroll:     { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header:     { paddingTop: SPACING.xl, marginBottom: SPACING.xl },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot:    { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText:   { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  title:      { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.sm },
  subtitle:   { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 24 },
  label:      { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  input:      { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal, marginBottom: SPACING.sm },
  cta:        { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md, marginTop: SPACING.xl, marginBottom: SPACING.md },
  ctaDisabled:{ opacity: 0.5 },
  ctaText:    { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  link:       { alignItems: 'center', paddingVertical: SPACING.md },
  linkText:   { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textDecorationLine: 'underline' },
});
