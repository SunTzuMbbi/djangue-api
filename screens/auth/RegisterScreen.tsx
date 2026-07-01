import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { LegalBar, ErrorBanner } from '../../components/common';

// Prefijos de pais mas comunes
const PREFIXES = [
  { flag: 'ES', code: '+34', name: 'Espana' },
  { flag: 'GQ', code: '+240', name: 'Guinea Ecuatorial' },
  { flag: 'CM', code: '+237', name: 'Camerun' },
  { flag: 'NG', code: '+234', name: 'Nigeria' },
  { flag: 'SN', code: '+221', name: 'Senegal' },
  { flag: 'MA', code: '+212', name: 'Marruecos' },
  { flag: 'FR', code: '+33', name: 'Francia' },
  { flag: 'DE', code: '+49', name: 'Alemania' },
  { flag: 'IT', code: '+39', name: 'Italia' },
  { flag: 'GB', code: '+44', name: 'Reino Unido' },
];

interface Field {
  key: string;
  label: string;
  placeholder: string;
  keyboard?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'words';
  maxLength?: number;
}

const FIELDS: Field[] = [
  { key: 'nombre', label: 'Nombre', placeholder: 'Tu nombre', autoCapitalize: 'words' },
  { key: 'apellidos', label: 'Apellidos', placeholder: 'Tus apellidos', autoCapitalize: 'words' },
  { key: 'email', label: 'Correo electronico', placeholder: 'tu@email.com', keyboard: 'email-address', autoCapitalize: 'none' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { requestOTP, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '' });
  const [prefix, setPrefix] = useState(PREFIXES[0]);
  const [phone, setPhone] = useState('');
  const [showPrefixes, setShowPrefixes] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios.';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Introduce un email valido.';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 7) errs.phone = 'Introduce un numero valido.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = async () => {
    clearError();
    if (!validate()) return;
    const fullPhone = prefix.code + phone.replace(/\D/g, '');
    try {
      await requestOTP(fullPhone);
      router.push({
        pathname: '/(auth)/otp',
        params: {
          phone: fullPhone,
          display: prefix.code + ' ' + phone,
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim(),
          isRegister: '1',
        },
      });
    } catch (_) {}
  };

  const setField = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    if (fieldErrors[key]) setFieldErrors(e => ({ ...e, [key]: '' }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>Volver</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
              <Text style={styles.logoText}>djangue</Text>
            </View>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Completa tus datos para empezar. Solo te llevara un minuto.</Text>
          </View>

          {error && <ErrorBanner message={error} onDismiss={clearError} />}

          {/* Campos texto */}
          {FIELDS.map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={[styles.input, fieldErrors[f.key] && styles.inputError]}
                value={(form as any)[f.key]}
                onChangeText={v => setField(f.key, v)}
                placeholder={f.placeholder}
                placeholderTextColor={COLORS.charcoal + '50'}
                keyboardType={f.keyboard || 'default'}
                autoCapitalize={f.autoCapitalize || 'none'}
                maxLength={f.maxLength}
                autoCorrect={false}
              />
              {fieldErrors[f.key] ? <Text style={styles.fieldError}>{fieldErrors[f.key]}</Text> : null}
            </View>
          ))}

          {/* Telefono con prefijo */}
          <View style={styles.field}>
            <Text style={styles.label}>Numero de telefono</Text>
            <View style={[styles.phoneRow, fieldErrors.phone && styles.inputError]}>
              <TouchableOpacity style={styles.prefixBtn} onPress={() => setShowPrefixes(!showPrefixes)}>
                <Text style={styles.prefixText}>{prefix.code}</Text>
                <Text style={styles.prefixArrow}>{showPrefixes ? 'v' : '>'}</Text>
              </TouchableOpacity>
              <View style={styles.phoneDivider} />
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={v => { setPhone(v); if (fieldErrors.phone) setFieldErrors(e => ({ ...e, phone: '' })); }}
                placeholder="600 000 000"
                placeholderTextColor={COLORS.charcoal + '50'}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
          </View>

          {/* Selector de prefijos */}
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
                  {prefix.code === p.code && <View style={styles.prefixCheck} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Info SMS */}
          <View style={styles.smsInfo}>
            <Text style={styles.smsInfoText}>
              Te enviaremos un codigo de verificacion por SMS al numero que indiques.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, isLoading && styles.ctaDisabled]}
            onPress={handleContinue}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {isLoading ? 'Enviando SMS...' : 'Continuar'}
            </Text>
          </TouchableOpacity>

          {/* Ya tengo cuenta */}
          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/(auth)/phone')}>
            <Text style={styles.loginLinkText}>Ya tengo cuenta. Iniciar sesion</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header: { paddingTop: SPACING.md, marginBottom: SPACING.xl },
  backBtn: { marginBottom: SPACING.lg },
  backText: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText: { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 24 },
  field: { marginBottom: SPACING.lg },
  label: {
    ...TYPOGRAPHY.label, color: COLORS.charcoal + '80',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.charcoal + '20',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body, color: COLORS.charcoal,
  },
  inputError: { borderColor: COLORS.coral },
  fieldError: { ...TYPOGRAPHY.caption, color: COLORS.coral, marginTop: 4 },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.charcoal + '20',
    overflow: 'hidden',
  },
  prefixBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  prefixText: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  prefixArrow: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', fontSize: 10 },
  phoneDivider: { width: 1, height: 24, backgroundColor: COLORS.charcoal + '20' },
  phoneInput: {
    flex: 1, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body, color: COLORS.charcoal,
  },
  prefixList: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.charcoal + '15',
    marginBottom: SPACING.lg, ...SHADOWS.md,
    maxHeight: 280, overflow: 'hidden',
  },
  prefixOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderColor: COLORS.charcoal + '08',
    gap: SPACING.sm,
  },
  prefixOptionActive: { backgroundColor: COLORS.emerald + '0E' },
  prefixOptionCode: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700', width: 48 },
  prefixOptionName: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', flex: 1 },
  prefixCheck: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald },
  smsInfo: {
    backgroundColor: COLORS.charcoal + '06', borderRadius: RADIUS.sm,
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  smsInfoText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', lineHeight: 18, textAlign: 'center' },
  cta: {
    backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  loginLink: { alignItems: 'center', paddingVertical: SPACING.md },
  loginLinkText: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textDecorationLine: 'underline' },
});
