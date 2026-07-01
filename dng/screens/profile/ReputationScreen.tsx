import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { profileApi } from '../../services/api';
import { Card, LegalBar, ProgressBar } from '../../components/common';

export default function ReputationScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [rep, setRep] = useState<any>(null);
  useEffect(() => { profileApi.reputation(userId!).then(({ data }) => setRep(data.data)).catch(() => {}); }, [userId]);
  const score = rep?.score || 0;
  const color = score >= 80 ? COLORS.emerald : COLORS.coral;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Reputacion</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.scoreCircle, { borderColor: color }]}>
          <Text style={[styles.scoreValue, { color }]}>{score}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Factores que influyen</Text>
          {[
            { label: 'Pagos a tiempo', value: rep?.onTimePayments || 0, max: rep?.totalPayments || 1 },
            { label: 'Ciclos completados', value: rep?.cyclesCompleted || 0, max: Math.max(rep?.cyclesCompleted || 0, 1) },
            { label: 'Sin incidencias', value: rep?.cleanRecord ? 1 : 0, max: 1 },
          ].map(f => (
            <View key={f.label} style={styles.factor}>
              <View style={styles.factorRow}>
                <Text style={styles.factorLabel}>{f.label}</Text>
                <Text style={styles.factorValue}>{f.value}/{f.max}</Text>
              </View>
              <ProgressBar progress={(f.value / f.max) * 100} color={color} />
            </View>
          ))}
        </Card>
        <View style={styles.info}>
          <Text style={styles.infoText}>La puntuacion refleja tu historial en Djangue. Los pagos puntuales y ciclos completados sin incidencias la incrementan.</Text>
        </View>
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
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.xxl },
  scoreValue: { fontSize: 52, fontWeight: '700' },
  scoreLabel: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '70' },
  card: { marginBottom: SPACING.xl },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, marginBottom: SPACING.lg },
  factor: { marginBottom: SPACING.lg },
  factorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  factorLabel: { ...TYPOGRAPHY.body, color: COLORS.charcoal },
  factorValue: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', fontWeight: '600' },
  info: { backgroundColor: COLORS.charcoal + '06', borderRadius: RADIUS.md, padding: SPACING.lg },
  infoText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
});
