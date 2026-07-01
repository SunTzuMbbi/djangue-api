import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Card, Avatar, Badge, LegalBar, Button } from '../../components/common';

export default function DepositLeaderViewScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { deposits, fetchDeposits, confirmDepositReceipt, isLoading } = useGroupStore();
  useEffect(() => { if (groupId) fetchDeposits(groupId); }, [groupId]);
  const paid = deposits.filter(d => d.status === 'paid');
  const pending = deposits.filter(d => d.status === 'pending');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Fianzas recibidas</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={deposits}
        keyExtractor={d => d.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryText}>{paid.length}/{deposits.length} fianzas confirmadas</Text>
            {pending.length > 0 && <Text style={styles.pendingText}>{pending.length} pendientes de confirmar</Text>}
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>No hay fianzas registradas aun.</Text>}
        renderItem={({ item: d }) => (
          <Card style={styles.depositCard}>
            <View style={styles.row}>
              <Avatar name="P" size={36} color={d.status === 'paid' ? COLORS.emerald : COLORS.coral} />
              <View style={styles.info}>
                <Text style={styles.name}>Participante</Text>
                <Text style={styles.amt}>{d.amount} EUR</Text>
              </View>
              <Badge label={d.status === 'paid' ? 'Confirmada' : 'Pendiente'} color={d.status === 'paid' ? COLORS.emerald : COLORS.coral} />
            </View>
            {d.status === 'pending' && (
              <Button label="Confirmar recepcion" size="sm" onPress={() => confirmDepositReceipt(groupId!, d.participantId)} loading={isLoading} style={{ marginTop: SPACING.md }} />
            )}
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
  summary: { backgroundColor: COLORS.emerald + '12', borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl },
  summaryText: { ...TYPOGRAPHY.h3, color: COLORS.emerald },
  pendingText: { ...TYPOGRAPHY.caption, color: COLORS.coral, marginTop: SPACING.xs },
  depositCard: { marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  info: { flex: 1 },
  name: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  amt: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80' },
  empty: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textAlign: 'center', marginTop: SPACING.xxxl },
});
