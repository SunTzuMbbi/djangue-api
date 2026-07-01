import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { Card, SectionHeader, EmptyState, ProgressBar, Badge, LegalBar } from '../../components/common';
import type { Group } from '../../types';

const GroupCard = ({ group, onPress }: { group: Group; onPress: () => void }) => {
  const progress = (group.currentCycle / group.totalCycles) * 100;
  const spotsLeft = group.maxParticipants - group.currentParticipants;
  return (
    <Card style={styles.groupCard} onPress={onPress}>
      <View style={styles.groupCardHeader}>
        <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
        <Badge label={group.status === 'active' ? 'Activa' : 'Abierta'} color={group.status === 'active' ? COLORS.emerald : COLORS.coral} />
      </View>
      <Text style={styles.groupAmount}>{group.amount}€/mes · {group.maxParticipants} participantes</Text>
      <ProgressBar progress={progress} />
      <View style={styles.groupCardFooter}>
        <Text style={styles.groupMeta}>Ciclo {group.currentCycle} de {group.totalCycles}</Text>
        {spotsLeft > 0 && <Text style={styles.groupSpots}>{spotsLeft} plazas libres</Text>}
      </View>
    </Card>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { myGroups, fetchMyGroups, isLoading } = useGroupStore();

  useEffect(() => { fetchMyGroups(); }, []);

  const firstName = user?.displayName?.split(' ')[0] || 'hola';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyGroups} tintColor={COLORS.emerald} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName}</Text>
            <Text style={styles.subgreeting}>
              {user?.verificationStatus === 'approved' ? 'Verificado ✓' : 'Verificación pendiente'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(main)/notifications')}>
            <View style={styles.notifDot} />
            <Text style={styles.notifIcon}>○</Text>
          </TouchableOpacity>
        </View>

        {/* Banner verificación */}
        {user?.verificationStatus !== 'approved' && (
          <TouchableOpacity style={styles.verifyBanner} onPress={() => router.push('/(auth)/pre-camera')} activeOpacity={0.88}>
            <View>
              <Text style={styles.verifyBannerTitle}>Verifica tu identidad</Text>
              <Text style={styles.verifyBannerBody}>Necesitas verificarte para unirte a tandas.</Text>
            </View>
            <Text style={styles.verifyBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Mis tandas */}
        <View style={styles.section}>
          <SectionHeader title="Mis tandas" action="Ver todas" onAction={() => router.push('/(main)/explore')} />
          {myGroups.length === 0 ? (
            <EmptyState
              title="Sin tandas activas"
              body="Únete a una tanda o crea la tuya para empezar."
              cta="Explorar tandas"
              onCta={() => router.push('/(main)/explore')}
            />
          ) : (
            myGroups.map(g => (
              <GroupCard key={g.id} group={g} onPress={() => router.push({ pathname: '/(group)/[id]', params: { id: g.id } })} />
            ))
          )}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.section}>
          <SectionHeader title="Acciones rápidas" />
          <View style={styles.quickActions}>
            {[
              { label: 'Nueva tanda', color: COLORS.emerald, route: '/(group)/create' },
              { label: 'Unirme', color: COLORS.coral, route: '/(group)/join' },
              { label: 'Mi perfil', color: COLORS.charcoal, route: '/(main)/profile' },
            ].map(a => (
              <TouchableOpacity key={a.label} style={[styles.quickAction, { backgroundColor: a.color }]}
                onPress={() => router.push(a.route as any)} activeOpacity={0.85}>
                <Text style={styles.quickActionText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.xl },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  subgreeting: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '600', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm, position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.coral, zIndex: 1 },
  notifIcon: { fontSize: 20, color: COLORS.charcoal },
  verifyBanner: { backgroundColor: COLORS.coral, borderRadius: RADIUS.md, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xl, ...SHADOWS.md },
  verifyBannerTitle: { ...TYPOGRAPHY.body, color: COLORS.cream, fontWeight: '700', marginBottom: 2 },
  verifyBannerBody: { ...TYPOGRAPHY.caption, color: COLORS.cream + 'CC' },
  verifyBannerArrow: { fontSize: 28, color: COLORS.cream, fontWeight: '300' },
  section: { marginBottom: SPACING.xl },
  groupCard: { marginBottom: SPACING.md },
  groupCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  groupName: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, flex: 1, marginRight: SPACING.sm },
  groupAmount: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.md },
  groupCardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  groupMeta: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70' },
  groupSpots: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: SPACING.sm },
  quickAction: { flex: 1, borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', ...SHADOWS.sm },
  quickActionText: { ...TYPOGRAPHY.label, color: COLORS.cream, fontWeight: '700' },
});
