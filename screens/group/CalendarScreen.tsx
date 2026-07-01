import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { groupApi } from '../../services/api';
import { Card, LegalBar, Badge } from '../../components/common';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CalendarScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [calendar, setCalendar] = useState<any[]>([]);

  useEffect(() => {
    groupApi.getCalendar(groupId!).then(({ data }) => setCalendar(data.data)).catch(() => {});
  }, [groupId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Calendario de pagos</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {calendar.map((cycle: any, i: number) => (
          <Card key={cycle.id || i} style={[styles.cycleCard, cycle.status === 'paid' && styles.cycleCardDone]}>
            <View style={styles.cycleHeader}>
              <View style={styles.cycleBadgeNum}><Text style={styles.cycleBadgeText}>{i + 1}</Text></View>
              <View style={styles.cycleInfo}>
                <Text style={styles.cycleName}>{cycle.recipient?.displayName || `Participante ${i + 1}`}</Text>
                <Text style={styles.cycleDate}>
                  {cycle.dueDate ? format(new Date(cycle.dueDate), "d 'de' MMMM yyyy", { locale: es }) : 'Fecha pendiente'}
                </Text>
              </View>
              <Badge
                label={cycle.status === 'paid' ? 'Cobrado' : cycle.status === 'collecting' ? 'En curso' : 'Pendiente'}
                color={cycle.status === 'paid' ? COLORS.emerald : cycle.status === 'collecting' ? COLORS.coral : COLORS.charcoal}
              />
            </View>
          </Card>
        ))}
        {calendar.length === 0 && (
          <Text style={styles.empty}>El calendario se generará tras el sorteo.</Text>
        )}
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  back: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '600' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.charcoal },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  cycleCard: { marginBottom: SPACING.sm },
  cycleCardDone: { opacity: 0.65 },
  cycleHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  cycleBadgeNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cycleBadgeText: { ...TYPOGRAPHY.label, color: COLORS.cream, fontWeight: '700' },
  cycleInfo: { flex: 1 },
  cycleName: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  cycleDate: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80' },
  empty: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80', textAlign: 'center', marginTop: SPACING.xxxl },
});
