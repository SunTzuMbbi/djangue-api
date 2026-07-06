import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { hydrate, isAuthenticated } = useAuthStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
    ]).start();

    (async () => {
      await hydrate();
      await new Promise(r => setTimeout(r, 1600));
      router.replace(isAuthenticated ? '/(main)/home' : '/(auth)/welcome');
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Tu tanda, coordinada.</Text>
      </Animated.View>
      <Text style={styles.legal}>Djangue coordina la tanda y no custodia el dinero.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy, alignItems: 'center', justifyContent: 'center' },
  content:   { alignItems: 'center' },
  logo:      { width: 240, height: 180, marginBottom: SPACING.lg },
  tagline:   { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5 },
  legal:     { position: 'absolute', bottom: 40, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 32 },
});
