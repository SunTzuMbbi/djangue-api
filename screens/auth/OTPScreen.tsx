import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { LegalBar } from '../../components/common';

const CODE_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const { phone, display, nombre, apellidos, email, isRegister } = useLocalSearchParams<{
    phone: string; display?: string;
    nombre?: string; apellidos?: string; email?: string;
    isRegister?: string;
  }>();
  const { verifyOTP, requestOTP, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const isReg = isRegister === '1';

  useEffect(() => {
    inputRef.current?.focus();
    const t = setInterval(() => setCountdown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (code.length === CODE_LENGTH) handleVerify();
  }, [code]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = async () => {
    clearError();
    try {
      await verifyOTP(phone!, code);
      // Navegar al home directamente
      router.replace('/(main)/home');
    } catch (_) {
      setCode('');
      shake();
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    await requestOTP(phone!);
    setCountdown(60);
  };

  const digits = code.split('').concat(Array(CODE_LENGTH - code.length).fill(''));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}><View style={styles.logoDot} /></View>
          <Text style={styles.logoText}>djangue</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>SMS</Text>
          </View>
        </View>

        <Text style={styles.title}>Codigo de verificacion</Text>
        <Text style={styles.subtitle}>
          {isReg
            ? 'Hemos enviado un SMS a ' + (display || phone) + ' para confirmar tu numero.'
            : 'Introduce el codigo de 6 digitos enviado a ' + (display || phone) + '.'}
        </Text>

        {isReg && nombre ? (
          <View style={styles.registerInfo}>
            <Text style={styles.registerInfoText}>Registrando a: {nombre} {apellidos}</Text>
          </View>
        ) : null}

        {/* Input oculto */}
        <TextInput
          ref={inputRef}
          style={styles.hidden}
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoFocus
        />

        {/* Digitos visuales */}
        <TouchableOpacity activeOpacity={1} onPress={() => inputRef.current?.focus()}>
          <Animated.View style={[styles.digits, { transform: [{ translateX: shakeAnim }] }]}>
            {digits.map((d, i) => (
              <View
                key={i}
                style={[
                  styles.digitBox,
                  code.length === i && styles.digitBoxActive,
                  error && styles.digitBoxError,
                ]}
              >
                <Text style={styles.digitText}>{d}</Text>
              </View>
            ))}
          </Animated.View>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>Codigo incorrecto. Intentalo de nuevo.</Text> : null}

        {isLoading ? (
          <ActivityIndicator color={COLORS.emerald} style={{ marginTop: SPACING.lg }} />
        ) : null}

        {/* Reenviar */}
        <TouchableOpacity
          style={[styles.resend, countdown > 0 && styles.resendDisabled]}
          onPress={resend}
          disabled={countdown > 0}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
            {countdown > 0 ? 'Reenviar en ' + countdown + 's' : 'Reenviar codigo'}
          </Text>
        </TouchableOpacity>

        {/* Cambiar numero */}
        <TouchableOpacity style={styles.changePhone} onPress={() => router.back()}>
          <Text style={styles.changePhoneText}>Cambiar numero de telefono</Text>
        </TouchableOpacity>
      </View>

      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600', marginBottom: SPACING.lg },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.cream },
  logoText: { fontSize: 22, fontWeight: '700', color: COLORS.emerald, letterSpacing: 1.5 },
  content: { flex: 1, paddingHorizontal: SPACING.xl, alignItems: 'center', paddingTop: SPACING.lg },
  iconWrap: { marginBottom: SPACING.xl },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.emerald + '15', borderWidth: 2, borderColor: COLORS.emerald + '30', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  iconText: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '700', letterSpacing: 1 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.lg },
  registerInfo: { backgroundColor: COLORS.emerald + '12', borderRadius: RADIUS.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.xl },
  registerInfoText: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '600' },
  hidden: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  digits: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  digitBox: { width: 48, height: 58, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '25', backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  digitBoxActive: { borderColor: COLORS.emerald, ...SHADOWS.md },
  digitBoxError: { borderColor: COLORS.coral },
  digitText: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  error: { ...TYPOGRAPHY.caption, color: COLORS.coral, textAlign: 'center', marginBottom: SPACING.md },
  resend: { marginTop: SPACING.xl, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  resendDisabled: { opacity: 0.5 },
  resendText: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  resendTextDisabled: { color: COLORS.charcoal + '60' },
  changePhone: { paddingVertical: SPACING.sm },
  changePhoneText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', textDecorationLine: 'underline' },
});
