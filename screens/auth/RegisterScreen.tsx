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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    clearError();
    setLocalError('');
    if (!nombre.trim()) return setLocalError('El nombre es obligatorio.');
    if (!email.trim()) return setLocalError('El email es obligatorio.');
    if (password.length < 6) return setLocalError('La contrasena debe tener al menos 6 caracteres.');
    if (password !== password2) return setLocalError('Las contrasenas no coinciden.');
    try {
      await register(nombre.trim(), apellidos.trim(), email.trim().toLowerCase(), password);
      router.replace('/(main)/home');
    } catch (_) {}
  };

  const displayError = localError || error;
  const isDisabled = !nombre.trim() || !email.trim() || password.length < 6 || isLoading;

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
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Registrate para empezar a coordinar tandas con tu comunidad.</Text>
        </View>

        {displayError ? <ErrorBanner message={displayError} onDismiss={() => { clearError(); setLocalError(''); }} /> : null}

        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre}
          placeholder="Tu nombre" placeholderTextColor={COLORS.charcoal + '50'}
          autoCapitalize="words" />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput style={styles.input} value={apellidos} onChangeText={setApellidos}
          placeholder="Tus apellidos" placeholderTextColor={COLORS.charcoal + '50'}
          autoCapitalize="words" />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail}
          placeholder="tu@email.com" placeholderTextColor={COLORS.charcoal + '50'}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

        <Text style={styles.label}>Contrasena *</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword}
          placeholder="Minimo 6 caracteres" placeholderTextColor={COLORS.charcoal + '50'}
          secureTextEntry />

        <Text style={styles.label}>Repetir contrasena *</Text>
        <TextInput style={styles.input} value={password2} onChangeText={setPassword2}
          placeholder="Repite la contrasena" placeholderTextColor={COLORS.charcoal + '50'}
          secureTextEntry />

        <TouchableOpacity
          style={[styles.cta, isDisabled && styles.ctaDisabled]}
          onPress={handleRegister}
          disabled={isDisabled}
          activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={COLORS.cream} />
            : <Text style={styles.ctaText}>Crear cuenta</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>Ya tengo cuenta. Iniciar sesion</Text>
        </TouchableOpacity>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.cream },
  scroll:     { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header:     { paddingTop: SPACING.md, marginBottom: SPACING.xl },
  back:       { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600', marginBottom: SPACING.lg },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot:    { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText:   { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  title:      { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.sm },
  subtitle:   { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 24 },
  label:      { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  input:      { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal },
  cta:        { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md, marginTop: SPACING.xl, marginBottom: SPACING.md },
  ctaDisabled:{ opacity: 0.5 },
  ctaText:    { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  link:       { alignItems: 'center', paddingVertical: SPACING.md },
  linkText:   { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textDecorationLine: 'underline' },
});
