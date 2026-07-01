import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { Card, Badge, ProgressBar, Avatar, LegalBar, Divider, AmountDisplay } from '../../components/common';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGroup, fetchGroup, isLoading } = useGroupStore();
  const { user } = useAuthStore();

  useEffect(() => { if (id) fetchGroup(id); }, [id]);

  if (!activeGroup) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.loading}>Cargando tanda...</Text>
    </SafeAreaView>
  );

  const g = activeGroup;
  const isLeader = g.leaderId === user?.id;
  const myParticipant = g.participants.find(p => p.userId === user?.id);
  const progress = (g.currentCycle / g.totalCycles) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchGroup(id!)} tintColor={COLORS.emerald} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>‹ Volver</Text>
          </TouchableOpacity>
          {isLeader && <Badge label="Eres líder" color={COLORS.coral} />}
        </View>

        {/* Resumen */}
        <View style={styles.summary}>
          <Text style={styles.groupName}>{g.name}</Text>
          <View style={styles.amountRow}>
            <AmountDisplay amount={g.amount} size="lg" color={COLORS.emerald} />
            <Text style={styles.amountLabel}>/mes por participante</Text>
          </View>
          <ProgressBar progress={progress} />
          <Text style={styles.cycleInfo}>Ciclo {g.currentCycle} de {g.totalCycles} · {g.currentParticipants}/{g.maxParticipants} participantes</Text>
        </View>

        {/* Acciones principales */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.emerald }]}
            onPress={() => router.push({ pathname: '/(group)/payment', params: { groupId: g.id } })}>
            <Text style={styles.actionBtnText}>Pagar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.coral }]}
            onPress={() => router.push({ pathname: '/(group)/calendar', params: { groupId: g.id } })}>
            <Text style={styles.actionBtnText}>Calendario</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.charcoal }]}
            onPress={() => router.push({ pathname: '/(group)/history', params: { groupId: g.id } })}>
            <Text style={styles.actionBtnText}>Historial</Text>
          </TouchableOpacity>
          {isLeader && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.emeraldDark ?? COLORS.emerald }]}
              onPress={() => router.push({ pathname: '/(group)/lottery', params: { groupId: g.id } })}>
              <Text style={styles.actionBtnText}>Sorteo</Text>
            </TouchableOpacity>
          )}
        </View>

        <Divider />

        {/* Hash del sorteo */}
        {g.lotteryHash && (
          <Card style={styles.hashCard}>
            <Text style={styles.hashTitle}>Hash del sorteo</Text>
            <Text style={styles.hashValue} numberOfLines={2}>{g.lotteryHash}</Text>
            <Text style={styles.hashHint}>Inmutable y verificable por todos los participantes.</Text>
          </Card>
        )}

        {/* Participantes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participantes ({g.participants.length})</Text>
          {g.participants.map((p, i) => (
            <View key={p.id} style={styles.participantRow}>
              <Avatar name={p.user?.displayName || '?'} size={36} color={p.status === 'phantom' ? COLORS.coral : COLORS.emerald} />
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{p.user?.displayName}</Text>
                <Text style={styles.participantMeta}>
                  Posición {p.cyclePosition} · {p.depositPaid ? 'Fianza pagada' : 'Fianza pendiente'}
                </Text>
              </View>
              {p.status === 'phantom' && <Badge label="Fantasma" color={COLORS.coral} />}
              {p.userId === g.leaderId && <Badge label="Líder" color={COLORS.emerald} />}
            </View>
          ))}
        </View>

        <Divider />

        {/* Fianza */}
        {!myParticipant?.depositPaid && (
          <TouchableOpacity style={styles.depositBanner}
            onPress={() => router.push({ pathname: '/(group)/deposit', params: { groupId: g.id } })}>
            <Text style={styles.depositBannerTitle}>Fianza pendiente</Text>
            <Text style={styles.depositBannerBody}>Debes pagar {g.depositAmount}€ al líder vía Bizum para confirmar tu plaza.</Text>
            <Text style={styles.depositBannerCta}>Pagar fianza ›</Text>
          </TouchableOpacity>
        )}

        {/* Disputa / Denuncia */}
        <TouchableOpacity style={styles.disputeLink}
          onPress={() => router.push({ pathname: '/(group)/dispute', params: { groupId: g.id } })}>
          <Text style={styles.disputeLinkText}>Reportar un problema en esta tanda</Text>
        </TouchableOpacity>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  loading: { ...TYPOGRAPHY.body, color: COLORS.charcoal, textAlign: 'center', marginTop: SPACING.xxxl },
  scroll: { paddingBottom: SPACING.xxxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  summary: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  groupName: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.md },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.sm, marginBottom: SPACING.lg },
  amountLabel: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80' },
  cycleInfo: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginTop: SPACING.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  actionBtn: { borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, ...SHADOWS.sm },
  actionBtnText: { ...TYPOGRAPHY.label, color: COLORS.cream, fontWeight: '700' },
  hashCard: { marginHorizontal: SPACING.xl, marginBottom: SPACING.lg, backgroundColor: COLORS.charcoal + '06' },
  hashTitle: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', marginBottom: SPACING.xs },
  hashValue: { ...TYPOGRAPHY.mono, color: COLORS.charcoal, marginBottom: SPACING.xs, fontSize: 11 },
  hashHint: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60', fontStyle: 'italic' },
  section: { paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, marginBottom: SPACING.md },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  participantInfo: { flex: 1 },
  participantName: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  participantMeta: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70' },
  depositBanner: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.coral + '12', borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.coral, padding: SPACING.lg, marginBottom: SPACING.lg },
  depositBannerTitle: { ...TYPOGRAPHY.body, color: COLORS.coral, fontWeight: '700', marginBottom: 2 },
  depositBannerBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', marginBottom: SPACING.sm, lineHeight: 18 },
  depositBannerCta: { ...TYPOGRAPHY.label, color: COLORS.coral, fontWeight: '700' },
  disputeLink: { alignItems: 'center', paddingVertical: SPACING.md },
  disputeLinkText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60', textDecorationLine: 'underline' },
});
