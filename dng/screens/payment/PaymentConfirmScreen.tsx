import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { LegalBar } from '../../components/common';

export default function PaymentConfirmScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 150, useNativeDriver: true }).start();
  }, []);
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
          <Text style={styles.check}>OK</Text>
        </Animated.View>
        <Text style={styles.title}>Pago confirmado</Text>
        {amount ? <Text style={styles.amount}>{amount} EUR</Text> : null}
        <Text style={styles.body}>Tu pago ha sido registrado y notificado al cobrador del ciclo. Gracias por mantener la tanda al dia.</Text>
        <TouchableOpacity style={styles.cta} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Volver a la tanda</Text>
        </TouchableOpacity>
      </View>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  circle: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, ...SHADOWS.lg },
  check: { fontSize: 24, color: COLORS.cream, fontWeight: '700' },
  title: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.sm },
  amount: { fontSize: 48, fontWeight: '700', color: COLORS.emerald, marginBottom: SPACING.lg },
  body: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xxl },
  cta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, ...SHADOWS.md },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
});
