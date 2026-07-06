import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { Avatar, Badge, LegalBar, ProgressBar } from '../../components/common';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  if (!user) return null;

  const verColor = user.emailVerified ? COLORS.emerald : COLORS.coral;
  const verLabel = user.emailVerified ? 'Verificado' : 'Sin verificar';

  const menuItems = [
    { label: 'Configuracion', icon: '⚙', color: COLORS.blue, route: '/(main)/settings' },
    { label: 'Resumen mensual', icon: '▣', color: COLORS.purple, route: '/(main)/monthly-summary' },
    { label: 'Verificar correo', icon: '✉', color: COLORS.gold, route: '/(auth)/pre-camera' },
    { label: 'Demo de la app', icon: '▷', color: COLORS.emerald, route: '/(main)/demo' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header gradiente */}
        <LinearGradient colors={[COLORS.purple, '#4A3AE8']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerContent}>
            <Avatar name={user.displayName || 'U'} size={80} color={COLORS.gold} />
            <Text style={styles.headerName}>{user.displayName}</Text>
            <Text style={styles.headerEmail}>{user.email}</Text>
            <View style={[styles.verBadge, { backgroundColor: verColor + '25', borderColor: verColor + '60' }]}>
              <Text style={[styles.verText, { color: verColor === COLORS.emerald ? COLORS.white : COLORS.white }]}>
                {user.emailVerified ? '✓' : '!'} {verLabel}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { val: user.groupsCompleted || 0, label: 'Djangues\ncompletados', color: COLORS.emerald },
            { val: user.reputationScore || 80, label: 'Puntuacion\nde reputacion', color: COLORS.blue },
            { val: user.groupsFailed || 0, label: 'Incidencias\nregistradas', color: COLORS.coral },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderTopColor: s.color }]}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Reputacion */}
        <View style={styles.repCard}>
          <View style={styles.repHeader}>
            <Text style={styles.repTitle}>Reputacion</Text>
            <Text style={[styles.repScore, { color: (user.reputationScore || 80) > 70 ? COLORS.emerald : COLORS.coral }]}>
              {user.reputationScore || 80}/100
            </Text>
          </View>
          <ProgressBar progress={user.reputationScore || 80} color={(user.reputationScore || 80) > 70 ? COLORS.emerald : COLORS.coral} />
          <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/reputation', params: { userId: user.uid } } as any)}>
            <Text style={styles.repLink}>Ver historial detallado →</Text>
          </TouchableOpacity>
        </View>

        {/* Nivel lider */}
        <LinearGradient colors={[COLORS.gold + 'CC', COLORS.coral + 'AA']} style={styles.levelCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.levelTitle}>Nivel de lider</Text>
          <Text style={styles.levelValue}>Nivel {user.leaderLevel || 1}</Text>
          <Text style={styles.levelBody}>
            {(user.leaderLevel || 1) >= 2
              ? 'Puedes crear Djangues de hasta 150€ con 8 participantes.'
              : 'Completa un Djangue para subir al Nivel 2 (150€, 8 participantes).'}
          </Text>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem}
              onPress={() => router.push(item.route as any)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <Text style={{ fontSize: 18, color: item.color }}>{item.icon}</Text>
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.menuDanger]} onPress={logout}>
            <View style={[styles.menuIcon, { backgroundColor: COLORS.coral + '18' }]}>
              <Text style={{ fontSize: 18, color: COLORS.coral }}>⊘</Text>
            </View>
            <Text style={[styles.menuText, { color: COLORS.coral }]}>Cerrar sesion</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.cream },
  scroll:       { paddingBottom: SPACING.xxxl },
  header:       { paddingBottom: SPACING.xxl, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerContent:{ alignItems: 'center', paddingTop: SPACING.xl, gap: SPACING.sm },
  headerName:   { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  headerEmail:  { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  verBadge:     { borderRadius: RADIUS.pill, paddingVertical: 5, paddingHorizontal: SPACING.lg, borderWidth: 1, marginTop: SPACING.xs },
  verText:      { fontSize: 12, fontWeight: '700' },
  statsRow:     { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.lg },
  statCard:     { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, ...SHADOWS.sm },
  statVal:      { fontSize: 26, fontWeight: '800' },
  statLabel:    { fontSize: 10, color: COLORS.navy + '70', textAlign: 'center', marginTop: 4, lineHeight: 14 },
  repCard:      { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, marginHorizontal: SPACING.xl, marginBottom: SPACING.lg, ...SHADOWS.sm },
  repHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  repTitle:     { fontSize: 15, fontWeight: '700', color: COLORS.navy },
  repScore:     { fontSize: 18, fontWeight: '800' },
  repLink:      { fontSize: 13, color: COLORS.blue, fontWeight: '600', marginTop: SPACING.md },
  levelCard:    { borderRadius: RADIUS.md, padding: SPACING.lg, marginHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  levelTitle:   { fontSize: 11, fontWeight: '700', color: COLORS.white + 'CC', textTransform: 'uppercase', letterSpacing: 1 },
  levelValue:   { fontSize: 28, fontWeight: '800', color: COLORS.white, marginVertical: 2 },
  levelBody:    { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  menu:         { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  menuItem:     { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, gap: SPACING.md, ...SHADOWS.sm },
  menuDanger:   {},
  menuIcon:     { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText:     { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.navy },
  menuArrow:    { fontSize: 22, color: COLORS.navy + '30', fontWeight: '300' },
});
