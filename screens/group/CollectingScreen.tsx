import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Card, ProgressBar, Avatar, LegalBar, Button, Badge } from '../../components/common';

export default function CollectingScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { activeGroup, fetchGroup } = useGroupStore();

  useEffect(() => { if (groupId) fetchGroup(groupId); }, [groupId]);

  if (!activeGroup) return null;
  const g = activeGroup;
  const paidCount = g.participants.filter(p => p.depositPaid).length;
  const progress = (paidCount / g.currentParticipants) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Recaudación en curso</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Ciclo {g.currentCycle} · Recaudado</Text>
          <Text style={styles.summaryAmount}>{paidCount * g.amount}€ de {g.currentParticipants * g.amount}€</Text>
          <ProgressBar progress={progress} />
          <Text style={styles.progressLabel}>{paidCount}/{g.currentParticipants} participantes han confirmado</Text>
        </View>
        <Text style={styles.sectionTitle}>Estado de pagos</Text>
        {g.participants.map(p => (
          <Card key={p.id} style={styles.participantCard}>
            <View style={styles.participantRow}>
              <Avatar name={p.user?.displayName || '?'} size={36} color={p.depositPaid ? COLORS.emerald : COLORS.coral} />
              <Text style={styles.participantName}>{p.user?.displayName}</Text>
              <Badge label={p.depositPaid ? 'Pagado' : 'Pendiente'} color={p.depositPaid ? COLORS.emerald : COLORS.coral} />
            </View>
          </Card>
        ))}
        <Button label="Confirmar mi pago" onPress={() => router.push({ pathname: '/(group)/payment', params: { groupId: g.id } })} style={{ marginTop: SPACING.lg }} />
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
  summary: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.md, padding: SPACING.xl, marginBottom: SPACING.xl },
  summaryLabel: { ...TYPOGRAPHY.caption, color: COLORS.cream + 'CC', marginBottom: SPACING.xs },
  summaryAmount: { ...TYPOGRAPHY.h1, color: COLORS.cream, marginBottom: SPACING.lg },
  progressLabel: { ...TYPOGRAPHY.caption, color: COLORS.cream + 'CC', marginTop: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, marginBottom: SPACING.md },
  participantCard: { marginBottom: SPACING.sm },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  participantName: { ...TYPOGRAPHY.body, color: COLORS.charcoal, flex: 1, fontWeight: '600' },
});
