import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { hydrate, isAuthenticated } = useAuthStore();
  const ring1 = useRef(new Animated.Value(0.6)).current;
  const ring2 = useRef(new Animated.Value(0.3)).current;
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.loop(Animated.sequence([
        Animated.timing(ring1, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(ring2, { toValue: 0.7, duration: 2200, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
      ])),
    ]).start();

    const init = async () => {
      await hydrate();
      await new Promise(r => setTimeout(r, 1800));
      if (isAuthenticated) {
        router.replace('/(main)/home');
      } else {
        router.replace('/(auth)/welcome');
      }
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.ring2, { opacity: ring2 }]} />
      <Animated.View style={[styles.ring1, { opacity: ring1 }]} />
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <View style={styles.logoCircle}>
          <View style={styles.logoDot} />
        </View>
        <Text style={styles.logoText}>djangue</Text>
        <Text style={styles.tagline}>Tu tanda, coordinada.</Text>
      </Animated.View>
      <Text style={styles.legal}>Djangue coordina la tanda y no custodia el dinero.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center' },
  ring1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, borderWidth: 1.5, borderColor: COLORS.cream, borderStyle: 'dashed' },
  ring2: { position: 'absolute', width: 380, height: 380, borderRadius: 190, borderWidth: 1, borderColor: COLORS.cream },
  logoWrap: { alignItems: 'center' },
  logoCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, borderColor: COLORS.cream, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  logoDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.cream },
  logoText: { ...TYPOGRAPHY.h1, color: COLORS.cream, letterSpacing: 2, marginBottom: SPACING.xs },
  tagline: { ...TYPOGRAPHY.body, color: COLORS.cream + 'CC' },
  legal: { position: 'absolute', bottom: SPACING.xxxl, ...TYPOGRAPHY.caption, color: COLORS.cream + '60', fontStyle: 'italic', textAlign: 'center', paddingHorizontal: SPACING.xxl },
});
