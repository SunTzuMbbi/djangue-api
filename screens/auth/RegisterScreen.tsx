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
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleRegister = async () => {
    clearError();
    setLocalError('');
    if (!nombre.trim()) return setLocalError('El nombre es obligatorio.');
    if (!email.trim()) return setLocalError('El email es obligatorio.');
    if (password.length < 6) return setLocalError('La contrasena debe tener al menos 6 caracteres.');
    if (password !== password2) return setLocalError('Las contrasenas no coinciden.');
    if (!accepted) return setLocalError('Debes aceptar la politica de privacidad.');
    try {
      await register(nombre.trim(), apellidos.trim(), email.trim().toLowerCase(), password);
      router.replace({ pathname: '/(auth)/welcome-register', params: { nombre: nombre.trim() } } as any);
    } catch (_) {}
  };

  const displayError = localError || error;
  const isDisabled = !nombre.trim() || !email.trim() || password.length < 6 || !accepted || isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header con logo */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.heroRow}>
            <View style={styles.logoCircle}>
              <View style={styles.logoDotGreen} />
              <View style={styles.logoDotCoral} />
            </View>
            <View>
              <Text style={styles.logoText}>djangue</Text>
              <Text style={styles.logoSub}>Tu tanda, coordinada.</Text>
            </View>
          </View>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Registrate y empieza a coordinar tandas con tu comunidad.</Text>
        </View>

        {displayError ? <ErrorBanner message={displayError} onDismiss={() => { clearError(); setLocalError(''); }} /> : null}

        {/* Campos */}
        <View style={styles.row}>
          <View style={[styles.fieldWrap, { flex: 1 }]}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre}
              placeholder="Tu nombre" placeholderTextColor={COLORS.charcoal + '40'}
              autoCapitalize="words" />
          </View>
          <View style={[styles.fieldWrap, { flex: 1 }]}>
            <Text style={styles.label}>Apellidos</Text>
            <TextInput style={styles.input} value={apellidos} onChangeText={setApellidos}
              placeholder="Apellidos" placeholderTextColor={COLORS.charcoal + '40'}
              autoCapitalize="words" />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail}
            placeholder="tu@email.com" placeholderTextColor={COLORS.charcoal + '40'}
            keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Contrasena *</Text>
          <View style={styles.passRow}>
            <TextInput style={styles.passInput} value={password} onChangeText={setPassword}
              placeholder="Min. 6 caracteres" placeholderTextColor={COLORS.charcoal + '40'}
              secureTextEntry={!showPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPass ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Repetir contrasena *</Text>
          <View style={styles.passRow}>
            <TextInput style={styles.passInput} value={password2} onChangeText={setPassword2}
              placeholder="Repite la contrasena" placeholderTextColor={COLORS.charcoal + '40'}
              secureTextEntry={!showPass2} />
            <TouchableOpacity onPress={() => setShowPass2(!showPass2)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPass2 ? 'Ocultar' : 'Ver'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Política de privacidad */}
        <TouchableOpacity style={styles.checkRow} onPress={() => setAccepted(!accepted)} activeOpacity={0.8}>
          <View style={[styles.check, accepted && styles.checkActive]}>
            {accepted && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.checkText}>
            Acepto la{' '}
            <Text style={styles.checkLink}>politica de privacidad</Text>
            {' '}y los{' '}
            <Text style={styles.checkLink}>terminos y condiciones</Text>
            {' '}de Djangue.
          </Text>
        </TouchableOpacity>

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
          <Text style={styles.linkText}>Ya tengo cuenta — Iniciar sesion</Text>
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
  heroRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  logoCircle:   { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 },
  logoDotGreen: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.cream },
  logoDotCoral: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.coral },
  logoText:     { fontSize: 20, fontWeight: '800', color: COLORS.emerald, letterSpacing: 1.5 },
  logoSub:      { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60' },
  title:        { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.xs },
  subtitle:     { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 22 },
  row:          { flexDirection: 'row', gap: SPACING.md },
  fieldWrap:    { marginBottom: SPACING.md },
  label:        { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, fontWeight: '600' },
  input:        { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '15', paddingHorizontal: SPACING.md, paddingVertical: 14, ...TYPOGRAPHY.body, color: COLORS.charcoal, ...SHADOWS.sm },
  passRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '15', overflow: 'hidden', ...SHADOWS.sm },
  passInput:    { flex: 1, paddingHorizontal: SPACING.md, paddingVertical: 14, ...TYPOGRAPHY.body, color: COLORS.charcoal },
  eyeBtn:       { paddingHorizontal: SPACING.md, paddingVertical: 14 },
  eyeText:      { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '700' },
  checkRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xl, marginTop: SPACING.sm },
  check:        { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.charcoal + '30', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  checkActive:  { backgroundColor: COLORS.emerald, borderColor: COLORS.emerald },
  checkMark:    { color: COLORS.cream, fontSize: 13, fontWeight: '700' },
  checkText:    { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', flex: 1, lineHeight: 18 },
  checkLink:    { color: COLORS.emerald, fontWeight: '600', textDecorationLine: 'underline' },
  cta:          { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md, marginBottom: SPACING.md },
  ctaDisabled:  { opacity: 0.4 },
  ctaText:      { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  link:         { alignItems: 'center', paddingVertical: SPACING.md },
  linkText:     { ...TYPOGRAPHY.body, color: COLORS.charcoal + '70', textDecorationLine: 'underline' },
});
