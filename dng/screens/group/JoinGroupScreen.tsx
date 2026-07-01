import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { groupApi } from '../../services/api';
import { Button, Card, Badge, LegalBar, ErrorBanner } from '../../components/common';
import type { Group } from '../../types';

export default function JoinGroupScreen() {
  const router = useRouter();
  const { code: initialCode } = useLocalSearchParams<{ code?: string }>();
  const { joinGroup, isLoading, error, clearError } = useGroupStore();
  const [code, setCode] = useState(initialCode || '');
  const [preview, setPreview] = useState<Group | null>(null);
  const [searching, setSearching] = useState(false);
  const [joined, setJoined] = useState(false);

  const search = async () => {
    if (code.trim().length < 4) return;
    setSearching(true);
    try {
      const { data } = await groupApi.list({ status: 'open' });
      const found = (data.data as Group[]).find(g => g.inviteCode === code.trim().toUpperCase());
      setPreview(found || null);
    } catch (_) {}
    setSearching(false);
  };

  const handleJoin = async () => {
    if (!preview) return;
    try {
      await joinGroup(preview.id, code);
      setJoined(true);
      setTimeout(() => router.replace({ pathname: '/(group)/[id]', params: { id: preview.id } }), 1200);
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Cerrar</Text></TouchableOpacity>
          <Text style={styles.title}>Unirme a una tanda</Text>
          <View style={{ width: 60 }} />
        </View>
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <Text style={styles.label}>Codigo de invitacion</Text>
        <View style={styles.codeRow}>
          <TextInput style={styles.codeInput} value={code} onChangeText={v => { setCode(v.toUpperCase()); setPreview(null); }} placeholder="ABCD-1234" placeholderTextColor={COLORS.charcoal + '50'} autoCapitalize="characters" maxLength={9} returnKeyType="search" onSubmitEditing={search} />
          <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={searching || code.length < 4}>
            {searching ? <ActivityIndicator color={COLORS.cream} size="small" /> : <Text style={styles.searchBtnText}>Buscar</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.codeHint}>Pide el codigo al lider de la tanda.</Text>
        {preview && (
          <Card style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewName} numberOfLines={1}>{preview.name}</Text>
              <Badge label={String(preview.maxParticipants - preview.currentParticipants) + ' plazas'} color={COLORS.coral} />
            </View>
            <Text style={styles.previewLeader}>Lider: {preview.leader?.displayName}</Text>
            <View style={styles.previewStats}>
              <View style={styles.stat}><Text style={styles.statValue}>{preview.amount} EUR</Text><Text style={styles.statLabel}>por mes</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{preview.maxParticipants}</Text><Text style={styles.statLabel}>participantes</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{preview.depositAmount} EUR</Text><Text style={styles.statLabel}>fianza</Text></View>
            </View>
            <View style={styles.depositInfo}>
              <Text style={styles.depositInfoTitle}>Antes de unirte</Text>
              <Text style={styles.depositInfoBody}>Deberas transferir {preview.depositAmount} EUR de fianza directamente al lider por Bizum. La fianza se devuelve al completar el ciclo.</Text>
            </View>
            {joined ? (
              <View style={styles.successBadge}><Text style={styles.successBadgeText}>Te has unido! Redirigiendo...</Text></View>
            ) : (
              <Button label={'Unirme - fianza ' + preview.depositAmount + ' EUR'} onPress={handleJoin} loading={isLoading} />
            )}
          </Card>
        )}
        {!preview && !searching && code.length >= 4 && (
          <Text style={styles.notFound}>No encontramos ninguna tanda con ese codigo.</Text>
        )}
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  codeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  codeInput: { flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.h3, color: COLORS.charcoal, letterSpacing: 2 },
  searchBtn: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm },
  searchBtnText: { ...TYPOGRAPHY.button, color: COLORS.cream },
  codeHint: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginBottom: SPACING.xl },
  previewCard: { marginBottom: SPACING.xl },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  previewName: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, flex: 1, marginRight: SPACING.sm },
  previewLeader: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.lg },
  previewStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.cream, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  stat: { alignItems: 'center' },
  statValue: { ...TYPOGRAPHY.h3, color: COLORS.emerald },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70' },
  depositInfo: { backgroundColor: COLORS.emerald + '0E', borderRadius: RADIUS.sm, padding: SPACING.md, marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.emerald },
  depositInfoTitle: { ...TYPOGRAPHY.label, color: COLORS.emerald, fontWeight: '700', marginBottom: SPACING.xs },
  depositInfoBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  successBadge: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  successBadgeText: { ...TYPOGRAPHY.button, color: COLORS.cream },
  notFound: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textAlign: 'center', lineHeight: 22, marginTop: SPACING.xl },
});
