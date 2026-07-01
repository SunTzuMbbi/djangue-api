import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: '1', title: 'Tu tanda,\ndigitalizada.', subtitle: 'Bienvenido a Djangue', body: 'Organiza tandas y ROSCAs con tu comunidad de forma transparente, segura y sin complicaciones.', accent: COLORS.emerald },
  { id: '2', title: 'Sin custodia\nde dinero.', subtitle: 'Coordinación, no banco', body: 'Djangue coordina la tanda y no custodia el dinero. Los pagos van directamente entre participantes vía Bizum.', accent: COLORS.coral },
  { id: '3', title: 'Sorteos\nverificables.', subtitle: 'Transparencia total', body: 'Cada sorteo genera un hash inmutable visible para todos. Nadie puede manipular el orden de cobro.', accent: COLORS.emerald },
  { id: '4', title: 'Entra con\nconfianza.', subtitle: 'Verificación de identidad', body: 'Todos los participantes verifican su identidad con DNI, NIE o pasaporte. Así sabes con quién juegas.', accent: COLORS.coral },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index ?? 0);
  }, []);

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(auth)/phone');
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(auth)/phone')}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      )}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal pagingEnabled bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.illustration, { borderColor: item.accent + '30' }]}>
              <View style={[styles.illustrationMid, { backgroundColor: item.accent + '12' }]}>
                <View style={[styles.illustrationCore, { backgroundColor: item.accent }]} />
              </View>
            </View>
            <Text style={[styles.subtitle, { color: item.accent }]}>{item.subtitle}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            {item.id === '2' && <Text style={styles.disclaimer}>Djangue coordina la tanda y no custodia el dinero.</Text>}
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const w = scrollX.interpolate({ inputRange: [(i-1)*width, i*width, (i+1)*width], outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const op = scrollX.interpolate({ inputRange: [(i-1)*width, i*width, (i+1)*width], outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: w, opacity: op, backgroundColor: SLIDES[i].accent }]} />;
          })}
        </View>
        <TouchableOpacity style={[styles.cta, { backgroundColor: isLast ? COLORS.coral : COLORS.emerald }]} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{isLast ? 'Empezar' : 'Continuar'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  skipBtn: { position: 'absolute', top: SPACING.lg, right: SPACING.xl, zIndex: 10, padding: SPACING.sm },
  skipText: { ...TYPOGRAPHY.bodySmall, color: COLORS.charcoal + '70', fontWeight: '500' },
  slide: { flex: 1, paddingHorizontal: SPACING.xl, alignItems: 'flex-start', justifyContent: 'center' },
  illustration: { width: 200, height: 200, borderRadius: 100, borderWidth: 2, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: SPACING.xxl },
  illustrationMid: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  illustrationCore: { width: 80, height: 80, borderRadius: 40 },
  subtitle: { ...TYPOGRAPHY.label, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: SPACING.sm },
  title: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, lineHeight: 44, marginBottom: SPACING.md },
  body: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'BB', lineHeight: 24 },
  disclaimer: { marginTop: SPACING.lg, ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', fontStyle: 'italic' },
  footer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl, paddingTop: SPACING.md },
  dots: { flexDirection: 'row', marginBottom: SPACING.lg },
  dot: { height: 8, borderRadius: 4, marginRight: 6 },
  cta: { borderRadius: RADIUS.lg, paddingVertical: SPACING.md, alignItems: 'center', ...SHADOWS.md },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
});
