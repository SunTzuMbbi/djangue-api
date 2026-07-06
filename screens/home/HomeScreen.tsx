import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Modal, Image, AppState,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { SectionHeader, EmptyState, ProgressBar, LegalBar, Avatar } from '../../components/common';
import type { Group } from '../../types';

const STATUS_LABELS: Record<string, string> = { active: 'Activo', open: 'Abierto', completed: 'Completado' };
const STATUS_COLORS: Record<string, string> = { active: COLORS.emerald, open: COLORS.blue, completed: COLORS.purple };

const DjangueCard = ({ group, onPress }: { group: Group; onPress: () => void }) => {
  const progress = group.totalCycles ? (group.currentCycle / group.totalCycles) * 100 : 0;
  const color = STATUS_COLORS[group.status] || COLORS.emerald;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.cardBar, { backgroundColor: color }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{group.name}</Text>
          <View style={[styles.cardStatus, { backgroundColor: color + '18' }]}>
            <Text style={[styles.cardStatusText, { color }]}>{STATUS_LABELS[group.status] || group.status}</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>{group.amount}€/mes · {group.maxParticipants} participantes</Text>
        <ProgressBar progress={progress} color={color} />
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>Ciclo {group.currentCycle}/{group.totalCycles}</Text>
          <Text style={[styles.cardMeta, { color }]}>
            {group.maxParticipants - group.currentParticipants} plazas libres
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, refreshVerification } = useAuthStore();
  const { myGroups, fetchMyGroups, isLoading } = useGroupStore();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => { fetchMyGroups(); }, []);

  // Recarga verificación cuando la app vuelve al primer plano
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshVerification();
    });
    return () => sub.remove();
  }, []);

  const firstName = user?.nombre || user?.displayName?.split(' ')[0] || '';
  const totalAmount = myGroups.reduce((s, g) => s + (parseFloat(String(g.amount)) || 0), 0);
  const isVerified = user?.emailVerified;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyGroups} tintColor={COLORS.emerald} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.navy, '#253070']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerSub}>Bienvenido</Text>
              <Text style={styles.headerName}>{firstName}</Text>
            </View>
            <TouchableOpacity onPress={() => setProfileOpen(true)} style={styles.avatarWrap}>
              <Avatar name={user?.displayName || 'U'} size={42} color={COLORS.gold} />
              {!isVerified && <View style={styles.avatarBadge} />}
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{myGroups.length}</Text>
              <Text style={styles.statLab}>Djangues</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{totalAmount}€</Text>
              <Text style={styles.statLab}>Total/mes</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: isVerified ? COLORS.gold : COLORS.coral }]}>
                {isVerified ? 'Activo' : 'Pendiente'}
              </Text>
              <Text style={styles.statLab}>Estado</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Alerta verificacion */}
        {!isVerified && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => refreshVerification()} activeOpacity={0.88}>
            <View style={styles.alertIcon}><Text style={styles.alertIconText}>!</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Correo pendiente de verificacion</Text>
              <Text style={styles.alertBody}>Pulsa aqui para comprobar si ya verificaste tu correo.</Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Acciones */}
        <View style={styles.actionsGrid}>
          {[
            { label: 'Crear Djangue', color: COLORS.emerald, route: '/(group)/create' },
            { label: 'Unirme',        color: COLORS.coral,   route: '/(group)/join' },
            { label: 'Explorar',      color: COLORS.blue,    route: '/(main)/explore' },
            { label: 'Mi perfil',     color: COLORS.purple,  route: '/(main)/profile' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={[styles.actionBtn, { borderLeftColor: a.color }]}
              onPress={() => router.push(a.route as any)} activeOpacity={0.85}>
              <View style={[styles.actionDot, { backgroundColor: a.color }]} />
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mis Djangues */}
        <View style={styles.section}>
          <SectionHeader title="Mis Djangues" action="Ver todos" onAction={() => router.push('/(main)/explore')} />
          {myGroups.length === 0 ? (
            <EmptyState
              title="Sin Djangues activos"
              body="Crea tu primer Djangue o unete a uno existente para empezar a ahorrar en grupo."
              cta="Explorar Djangues"
              onCta={() => router.push('/(main)/explore')}
            />
          ) : (
            myGroups.map(g => (
              <DjangueCard key={g.id} group={g}
                onPress={() => router.push({ pathname: '/(group)/[id]', params: { id: g.id } })} />
            ))
          )}
        </View>
      </ScrollView>
      <LegalBar />

      {/* Dropdown perfil */}
      <Modal visible={profileOpen} transparent animationType="fade" onRequestClose={() => setProfileOpen(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setProfileOpen(false)} activeOpacity={1}>
          <View style={styles.dropdown}>
            <View style={styles.dropdownHead}>
              <Avatar name={user?.displayName || 'U'} size={48} color={COLORS.emerald} />
              <View style={{ marginLeft: SPACING.md, flex: 1 }}>
                <Text style={styles.dropName}>{user?.displayName}</Text>
                <Text style={styles.dropEmail}>{user?.email}</Text>
                <Text style={[styles.dropStatus, { color: isVerified ? COLORS.emerald : COLORS.coral }]}>
                  {isVerified ? 'Cuenta verificada' : 'Verificacion pendiente'}
                </Text>
              </View>
            </View>
            {[
              { label: 'Mi perfil',        route: '/(main)/profile' },
              { label: 'Mis Djangues',     route: '/(main)/explore' },
              { label: 'Avisos',           route: '/(main)/notifications' },
              { label: 'Configuracion',    route: '/(main)/settings' },
              { label: 'Resumen mensual',  route: '/(main)/monthly-summary' },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.dropItem}
                onPress={() => { setProfileOpen(false); router.push(item.route as any); }}>
                <Text style={styles.dropItemText}>{item.label}</Text>
                <Text style={styles.dropItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.dropItem, { borderTopWidth: 1, borderTopColor: COLORS.navy + '12' }]}
              onPress={() => { setProfileOpen(false); logout(); }}>
              <Text style={[styles.dropItemText, { color: COLORS.coral }]}>Cerrar sesion</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bgLight },
  scroll:         { paddingBottom: SPACING.xxxl },
  header:         { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  headerSub:      { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  headerName:     { fontSize: 24, fontWeight: '700', color: COLORS.white, letterSpacing: -0.3 },
  avatarWrap:     { position: 'relative' },
  avatarBadge:    { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.coral, borderWidth: 2, borderColor: COLORS.navy },
  statsRow:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: RADIUS.md, padding: SPACING.lg },
  statItem:       { flex: 1, alignItems: 'center' },
  statVal:        { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLab:        { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: '500' },
  statSep:        { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  alertBanner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, margin: SPACING.xl, marginBottom: 0, borderLeftWidth: 4, borderLeftColor: COLORS.coral, ...SHADOWS.sm },
  alertIcon:      { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  alertIconText:  { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  alertTitle:     { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  alertBody:      { fontSize: 12, color: COLORS.navy + '80', marginTop: 2 },
  alertArrow:     { fontSize: 22, color: COLORS.navy + '40' },
  actionsGrid:    { margin: SPACING.xl, gap: SPACING.sm },
  actionBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, borderLeftWidth: 4, ...SHADOWS.sm },
  actionDot:      { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.md },
  actionLabel:    { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.navy },
  actionArrow:    { fontSize: 20, color: COLORS.navy + '30' },
  section:        { paddingHorizontal: SPACING.xl },
  card:           { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADIUS.md, marginBottom: SPACING.md, overflow: 'hidden', ...SHADOWS.sm },
  cardBar:        { width: 4 },
  cardContent:    { flex: 1, padding: SPACING.lg },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardName:       { fontSize: 16, fontWeight: '700', color: COLORS.navy, flex: 1, marginRight: SPACING.sm },
  cardStatus:     { borderRadius: RADIUS.pill, paddingVertical: 3, paddingHorizontal: SPACING.sm },
  cardStatusText: { fontSize: 11, fontWeight: '700' },
  cardSub:        { fontSize: 12, color: COLORS.navy + '70', marginBottom: SPACING.sm },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  cardMeta:       { fontSize: 12, color: COLORS.navy + '60' },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 80, paddingRight: SPACING.xl },
  dropdown:       { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, width: 290, ...SHADOWS.lg, overflow: 'hidden' },
  dropdownHead:   { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.navy },
  dropName:       { fontSize: 15, fontWeight: '700', color: COLORS.white },
  dropEmail:      { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  dropStatus:     { fontSize: 11, fontWeight: '600', marginTop: 4 },
  dropItem:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.navy + '08' },
  dropItemText:   { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.navy },
  dropItemArrow:  { fontSize: 18, color: COLORS.navy + '35' },
});
