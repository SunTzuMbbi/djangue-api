import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

export default function WelcomePostRegisterScreen() {
  const router = useRouter();
  const { nombre } = useLocalSearchParams<{ nombre?: string }>();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale }], opacity }]}>
          <View style={styles.ring3} />
          <View style={styles.ring2} />
          <View style={styles.ring1} />
          <View style={styles.logoCircle}>
            <View style={styles.logoDotMain} />
            <View style={styles.logoDotCoral} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity, transform: [{ translateY: slideY }] }}>
          <Text style={styles.welcome}>Bienvenido{nombre ? `, ${nombre}` : ''}!</Text>
          <Text style={styles.subtitle}>Tu cuenta esta lista.</Text>
          <Text style={styles.body}>
            Ya puedes explorar tandas, unirte a grupos y coordinar con tu comunidad de forma segura y transparente.
          </Text>

          <View style={styles.pillsRow}>
            {['Tandas seguras', 'Sin custodia', 'Sorteo justo'].map(p => (
              <View key={p} style={styles.pill}>
                <Text style={styles.pillText}>{p}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.replace('/(main)/home')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Empezar a explorar</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>Djangue coordina la tanda y no custodia el dinero.</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.emerald },
  content:      { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'center', alignItems: 'center' },
  logoWrap:     { position: 'relative', width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl },
  ring1:        { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 1.5, borderColor: COLORS.cream + '40', borderStyle: 'dashed' },
  ring2:        { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: COLORS.cream + '25' },
  ring3:        { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: COLORS.cream + '15' },
  logoCircle:   { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 },
  logoDotMain:  { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.emerald },
  logoDotCoral: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.coral },
  welcome:      { fontSize: 32, fontWeight: '700', color: COLORS.cream, textAlign: 'center', marginBottom: SPACING.xs, letterSpacing: 0.5 },
  subtitle:     { ...TYPOGRAPHY.h3, color: COLORS.cream + 'CC', textAlign: 'center', marginBottom: SPACING.lg },
  body:         { ...TYPOGRAPHY.body, color: COLORS.cream + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xl },
  pillsRow:     { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.xxl, flexWrap: 'wrap' },
  pill:         { backgroundColor: COLORS.cream + '20', borderRadius: RADIUS.full || 20, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.cream + '30' },
  pillText:     { ...TYPOGRAPHY.caption, color: COLORS.cream, fontWeight: '600' },
  cta:          { backgroundColor: COLORS.cream, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.xl },
  ctaText:      { ...TYPOGRAPHY.button, color: COLORS.emerald, fontSize: 16 },
  legal:        { ...TYPOGRAPHY.caption, color: COLORS.cream + '50', fontStyle: 'italic', textAlign: 'center' },
});
