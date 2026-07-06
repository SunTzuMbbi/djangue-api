import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { EmptyState, LegalBar, ProgressBar } from '../../components/common';
import type { Group } from '../../types';

const COUNTRIES = [
  { code: 'all', name: 'Todos' },
  { code: 'ES', name: 'España' },
  { code: 'GQ', name: 'Guinea Ec.' },
  { code: 'CM', name: 'Camerún' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'SN', name: 'Senegal' },
];

const CARD_COLORS = [COLORS.emerald, COLORS.blue, COLORS.purple, COLORS.coral];

export default function ExploreScreen() {
  const router = useRouter();
  const { groups, fetchGroups, isLoading } = useGroupStore();
  const [country, setCountry] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchGroups(country === 'all' ? undefined : country); }, [country]);

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={[COLORS.blue, COLORS.purple]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Explorar Djangues</Text>
            <Text style={styles.headerSub}>{groups.length} disponibles ahora</Text>
          </View>
          <TouchableOpacity style={styles.codeBtn} onPress={() => router.push('/(group)/join')}>
            <Text style={styles.codeBtnText}>+ Codigo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
            placeholder="Buscar Djangue..." placeholderTextColor="rgba(255,255,255,0.6)"
            selectionColor={COLORS.gold} />
        </View>
      </LinearGradient>

      <View style={styles.filterRow}>
        {COUNTRIES.map(c => (
          <TouchableOpacity key={c.code}
            style={[styles.chip, country === c.code && styles.chipActive]}
            onPress={() => setCountry(c.code)}>
            <Text style={[styles.chipText, country === c.code && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={g => g.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchGroups(country === 'all' ? undefined : country)} tintColor={COLORS.blue} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Sin Djangues disponibles"
            body="No hay Djangues abiertos con estos filtros. Crea el tuyo y invita a tu comunidad."
            cta="Crear Djangue"
            onCta={() => router.push('/(group)/create')}
          />
        }
        renderItem={({ item: g, index }) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          const fill = g.maxParticipants ? (g.currentParticipants / g.maxParticipants) * 100 : 0;
          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(group)/[id]', params: { id: g.id } })} activeOpacity={0.88}>
              <View style={[styles.cardTop, { backgroundColor: color }]}>
                <Text style={styles.cardName} numberOfLines={1}>{g.name}</Text>
                <View style={styles.cardAmountBadge}>
                  <Text style={styles.cardAmountText}>{g.amount}€</Text>
                  <Text style={styles.cardAmountSub}>/mes</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardMeta}>Participantes</Text>
                  <Text style={[styles.cardMetaVal, { color }]}>{g.currentParticipants}/{g.maxParticipants}</Text>
                </View>
                <ProgressBar progress={fill} color={color} />
                <View style={styles.cardRow}>
                  <Text style={styles.cardMeta}>Metodo de pago</Text>
                  <Text style={styles.cardMetaVal}>{g.paymentMethod === 'bizum' ? 'Bizum' : 'SEPA'}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.cardMeta}>Fianza</Text>
                  <Text style={styles.cardMetaVal}>{g.depositAmount}€</Text>
                </View>
                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: color }]}
                  onPress={() => router.push({ pathname: '/(group)/[id]', params: { id: g.id } })}>
                  <Text style={styles.joinBtnText}>Ver Djangue →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.cream },
  header:         { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: COLORS.white },
  headerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  codeBtn:        { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  codeBtnText:    { fontSize: 13, fontWeight: '700', color: COLORS.white },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  searchIcon:     { fontSize: 18, color: 'rgba(255,255,255,0.7)', marginRight: SPACING.sm },
  searchInput:    { flex: 1, fontSize: 15, color: COLORS.white, paddingVertical: SPACING.md },
  filterRow:      { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: SPACING.sm, flexWrap: 'wrap' },
  chip:           { paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.navy + '20', backgroundColor: COLORS.white },
  chipActive:     { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText:       { fontSize: 12, color: COLORS.navy, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  list:           { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl, gap: SPACING.lg },
  card:           { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.md },
  cardTop:        { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:       { fontSize: 18, fontWeight: '800', color: COLORS.white, flex: 1, marginRight: SPACING.sm },
  cardAmountBadge:{ alignItems: 'flex-end' },
  cardAmountText: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  cardAmountSub:  { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  cardBody:       { padding: SPACING.lg, gap: SPACING.sm },
  cardRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta:       { fontSize: 12, color: COLORS.navy + '70' },
  cardMetaVal:    { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  joinBtn:        { borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm, ...SHADOWS.sm },
  joinBtnText:    { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
