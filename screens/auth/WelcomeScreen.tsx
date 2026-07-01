import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const ring1 = useRef(new Animated.Value(0.5)).current;
  const ring2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(ring1, { toValue: 0.9, duration: 2000, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(ring2, { toValue: 0.7, duration: 2600, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0.3, duration: 2600, useNativeDriver: true }),
      ])),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* Fondo esmeralda con anillos */}
      <View style={styles.heroBg}>
        <Animated.View style={[styles.ring, styles.ringOuter, { opacity: ring2 }]} />
        <Animated.View style={[styles.ring, styles.ringInner, { opacity: ring1 }]} />
        <View style={styles.logoCircle}>
          <View style={styles.logoDot} />
        </View>
      </View>

      {/* Contenido inferior */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.appName}>djangue</Text>
        <Text style={styles.tagline}>Tu tanda, coordinada.</Text>
        <Text style={styles.description}>
          Organiza tandas y ROSCAs con tu comunidad de forma transparente, segura y sin complicaciones.
          Los pagos van directamente entre participantes.
        </Text>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>Djangue coordina la tanda y no custodia el dinero.</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(auth)/phone')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  heroBg: {
    flex: 1,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '55%',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.cream,
  },
  ringOuter: { width: 280, height: 280 },
  ringInner: { width: 180, height: 180, borderStyle: 'dashed' },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: COLORS.cream,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  logoDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.cream },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  appName: {
    fontSize: 36, fontWeight: '700', color: COLORS.charcoal,
    letterSpacing: 2, marginBottom: SPACING.xs,
  },
  tagline: { ...TYPOGRAPHY.h3, color: COLORS.emerald, marginBottom: SPACING.md },
  description: {
    ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA',
    lineHeight: 24, marginBottom: SPACING.lg,
  },
  disclaimer: {
    backgroundColor: COLORS.emerald + '12',
    borderRadius: RADIUS.sm, borderLeftWidth: 3,
    borderLeftColor: COLORS.emerald,
    padding: SPACING.sm, marginBottom: SPACING.xl,
  },
  disclaimerText: {
    ...TYPOGRAPHY.caption, color: COLORS.emerald,
    fontStyle: 'italic', fontWeight: '600',
  },
  actions: { gap: SPACING.md },
  btnPrimary: {
    backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.md,
  },
  btnPrimaryText: { ...TYPOGRAPHY.button, color: COLORS.cream, fontSize: 16 },
  btnSecondary: {
    borderRadius: RADIUS.lg, paddingVertical: SPACING.lg,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.emerald,
  },
  btnSecondaryText: { ...TYPOGRAPHY.button, color: COLORS.emerald, fontSize: 16 },
});
