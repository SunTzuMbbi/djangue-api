import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { groupApi } from '../../services/api';
import { Card, Badge, LegalBar } from '../../components/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HistoryScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    groupApi.getHistory(groupId!).then(({ data }) => setHistory(data.data)).catch(() => {});
  }, [groupId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Historial</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Sin movimientos aún.</Text>}
        renderItem={({ item: h }) => (
          <Card style={styles.historyCard}>
            <View style={styles.historyRow}>
              <View style={[styles.historyIcon, { backgroundColor: h.type === 'payment' ? COLORS.emerald + '15' : COLORS.coral + '15' }]}>
                <Text style={{ fontSize: 16 }}>{h.type === 'payment' ? '↑' : '↓'}</Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{h.description || 'Movimiento'}</Text>
                <Text style={styles.historyDate}>{h.createdAt ? format(new Date(h.createdAt), "d MMM yyyy", { locale: es }) : ''}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: h.type === 'payment' ? COLORS.emerald : COLORS.coral }]}>
                {h.type === 'payment' ? '+' : '-'}{h.amount}€
              </Text>
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  historyCard: { marginBottom: SPACING.sm },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  historyIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  historyInfo: { flex: 1 },
  historyTitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  historyDate: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70' },
  historyAmount: { ...TYPOGRAPHY.h3, fontWeight: '700' },
  empty: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textAlign: 'center', marginTop: SPACING.xxxl },
});
