import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Badge, Card, LegalBar, Divider, ProgressBar } from '../../components/common';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  if (!user) return null;
  const verColor = { approved: COLORS.emerald, pending: COLORS.coral, rejected: COLORS.coral, idle: COLORS.charcoal }[user.verificationStatus] || COLORS.charcoal;
  const verLabel = { approved: 'Verificado', pending: 'En revision', rejected: 'Rechazado', idle: 'Sin verificar' }[user.verificationStatus] || 'Desconocido';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={user.displayName} size={72} color={COLORS.emerald} />
          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
          <Badge label={verLabel} color={verColor} />
        </View>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statValue}>{user.groupsCompleted}</Text><Text style={styles.statLabel}>Ciclos completados</Text></View>
            <View style={[styles.stat, styles.statBorder]}><Text style={[styles.statValue, { color: COLORS.emerald }]}>{user.reputationScore}</Text><Text style={styles.statLabel}>Puntuacion</Text></View>
            <View style={styles.stat}><Text style={[styles.statValue, { color: COLORS.coral }]}>{user.groupsFailed}</Text><Text style={styles.statLabel}>Incidencias</Text></View>
          </View>
          <Divider />
          <Text style={styles.repLabel}>Reputacion</Text>
          <ProgressBar progress={user.reputationScore} color={user.reputationScore > 70 ? COLORS.emerald : COLORS.coral} />
          <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/reputation', params: { userId: user.id } } as any)}>
            <Text style={styles.repLink}>Ver detalle de reputacion</Text>
          </TouchableOpacity>
        </Card>
        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>Nivel de lider: {user.leaderLevel === 2 ? 'Nivel 2' : 'Nivel 1'}</Text>
          <Text style={styles.levelBody}>{user.leaderLevel === 2 ? 'Hasta 150 EUR con 8 participantes.' : 'Completa un ciclo para subir al Nivel 2 (150 EUR, 8 participantes).'}</Text>
        </View>
        <View style={styles.menu}>
          {[
            { label: 'Configuracion', route: '/(main)/settings' },
            { label: 'Resumen mensual', route: '/(main)/monthly-summary' },
            { label: 'Verificar identidad', route: '/(auth)/pre-camera' },
            { label: 'Demo de la app', route: '/(main)/demo' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Text style={styles.menuItemArrow}>{'>'}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={logout}>
            <Text style={[styles.menuItemText, { color: COLORS.coral }]}>Cerrar sesion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  header: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  name: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  phone: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80' },
  statsCard: { marginBottom: SPACING.xl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingBottom: SPACING.lg },
  stat: { alignItems: 'center', flex: 1 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.charcoal + '15' },
  statValue: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', textAlign: 'center', marginTop: 2 },
  repLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.sm, fontWeight: '600' },
  repLink: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '600', marginTop: SPACING.sm },
  levelCard: { backgroundColor: COLORS.emerald + '0E', borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.emerald, padding: SPACING.lg, marginBottom: SPACING.xl },
  levelTitle: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '700', marginBottom: SPACING.xs },
  levelBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  menu: { gap: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, borderBottomWidth: 1, borderColor: COLORS.charcoal + '0E' },
  menuItemDanger: { marginTop: SPACING.md },
  menuItemText: { ...TYPOGRAPHY.body, color: COLORS.charcoal },
  menuItemArrow: { fontSize: 20, color: COLORS.charcoal + '50' },
});
