import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Card, Badge, ProgressBar, EmptyState, LegalBar } from '../../components/common';
import type { Group } from '../../types';

const COUNTRIES = [
  { code: 'all', name: 'Todas' },
  { code: 'ES', name: 'España' },
  { code: 'GQ', name: 'Guinea Ec.' },
  { code: 'CM', name: 'Camerún' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'SN', name: 'Senegal' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { groups, fetchGroups, isLoading } = useGroupStore();
  const [country, setCountry] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchGroups(country === 'all' ? undefined : country); }, [country]);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar tandas</Text>
        <TouchableOpacity style={styles.joinCode} onPress={() => router.push('/(group)/join')}>
          <Text style={styles.joinCodeText}>Código</Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Buscar por nombre..." placeholderTextColor={COLORS.charcoal + '50'} />
      </View>

      {/* Filtro país */}
      <View style={styles.filterRow}>
        {COUNTRIES.map(c => (
          <TouchableOpacity key={c.code} style={[styles.filterChip, country === c.code && styles.filterChipActive]}
            onPress={() => setCountry(c.code)}>
            <Text style={[styles.filterChipText, country === c.code && styles.filterChipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={g => g.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchGroups(country === 'all' ? undefined : country)} tintColor={COLORS.emerald} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="Sin tandas disponibles" body="No hay tandas abiertas con estos filtros. Prueba a cambiar el país o crea la tuya." cta="Crear tanda" onCta={() => router.push('/(group)/create')} />
        }
        renderItem={({ item: g }) => (
          <Card style={styles.card} onPress={() => router.push({ pathname: '/(group)/[id]', params: { id: g.id } })}>
            <View style={styles.cardTop}>
              <Text style={styles.cardName} numberOfLines={1}>{g.name}</Text>
              <Badge label={`${g.maxParticipants - g.currentParticipants} plazas`} color={COLORS.coral} />
            </View>
            <Text style={styles.cardLeader}>Líder: {g.leader?.displayName}</Text>
            <Text style={styles.cardAmount}>{g.amount}€/mes · {g.paymentMethod === 'bizum' ? 'Bizum' : 'SEPA'}</Text>
            <ProgressBar progress={(g.currentParticipants / g.maxParticipants) * 100} />
            <View style={styles.cardFooter}>
              <Text style={styles.cardMeta}>{g.currentParticipants}/{g.maxParticipants} participantes</Text>
              <Text style={styles.cardDeposit}>Fianza: {g.depositAmount}€</Text>
            </View>
          </Card>
        )}
      />
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  joinCode: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, backgroundColor: COLORS.emerald + '15', borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.emerald + '30' },
  joinCodeText: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '700' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.xl, backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.charcoal + '18', paddingHorizontal: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.sm },
  searchIcon: { fontSize: 18, color: COLORS.charcoal + '60', marginRight: SPACING.sm },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.charcoal, paddingVertical: SPACING.md },
  filterRow: { flexDirection: 'row', paddingHorizontal: SPACING.xl, gap: SPACING.sm, marginBottom: SPACING.lg, flexWrap: 'wrap' },
  filterChip: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', backgroundColor: COLORS.white },
  filterChipActive: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald },
  filterChipText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.cream },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  card: { marginBottom: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.xs },
  cardName: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, flex: 1, marginRight: SPACING.sm },
  cardLeader: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginBottom: SPACING.xs },
  cardAmount: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600', marginBottom: SPACING.md },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm },
  cardMeta: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70' },
  cardDeposit: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '600' },
});
