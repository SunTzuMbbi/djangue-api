import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { Button, LegalBar } from '../../components/common';
import type { PaymentMethod } from '../../types';

const METHODS = [
  { id: 'bizum' as PaymentMethod, name: 'Bizum', desc: 'Instantaneo. Solo Espana. Limite 500 EUR.', badge: 'Recomendado' },
  { id: 'sepa' as PaymentMethod, name: 'Transferencia SEPA', desc: '1-2 dias habiles. Internacional.', badge: null },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [selected, setSelected] = useState<PaymentMethod>('bizum');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Metodo de pago</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Los pagos van directamente entre participantes. Djangue no interviene en la transaccion.</Text>
        {METHODS.map(m => (
          <TouchableOpacity key={m.id} style={[styles.card, selected === m.id && styles.cardActive]} onPress={() => setSelected(m.id)} activeOpacity={0.85}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardName, selected === m.id && styles.cardNameActive]}>{m.name}</Text>
              {m.badge && <View style={styles.badge}><Text style={styles.badgeText}>{m.badge}</Text></View>}
            </View>
            <Text style={styles.cardDesc}>{m.desc}</Text>
            {selected === m.id && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
        <Button label="Continuar" onPress={() => router.push({ pathname: '/(group)/payment', params: { groupId } })} style={{ marginTop: SPACING.xl }} />
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  sub: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', lineHeight: 22, marginBottom: SPACING.xl },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', padding: SPACING.lg, marginBottom: SPACING.md, position: 'relative' },
  cardActive: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald + '06' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  cardName: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  cardNameActive: { color: COLORS.emerald },
  cardDesc: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80' },
  badge: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.pill, paddingVertical: 2, paddingHorizontal: SPACING.sm },
  badgeText: { ...TYPOGRAPHY.caption, color: COLORS.cream, fontWeight: '700', fontSize: 10 },
  dot: { position: 'absolute', top: SPACING.lg, right: SPACING.lg, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.emerald },
});
