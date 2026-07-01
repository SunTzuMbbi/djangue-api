import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, Card, LegalBar, AmountDisplay, ErrorBanner } from '../../components/common';

export default function DepositScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { activeGroup, payDeposit, isLoading, error, clearError } = useGroupStore();
  const g = activeGroup;
  const handlePay = async () => { await payDeposit(groupId!); router.back(); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Pagar fianza</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Importe de fianza</Text>
          <AmountDisplay amount={g?.depositAmount || 0} size="lg" color={COLORS.emerald} />
        </Card>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Para que sirve la fianza</Text>
          <Text style={styles.infoBody}>La fianza garantiza tu compromiso con la tanda. El lider la custodia y te la devuelve al completar el ciclo. Se transfiere directamente por Bizum.</Text>
          <Text style={styles.disclaimer}>Djangue coordina la tanda y no custodia el dinero.</Text>
        </View>
        <View style={styles.leaderInfo}>
          <Text style={styles.leaderLabel}>Enviar fianza al lider</Text>
          <Text style={styles.leaderPhone}>{g?.leader?.phone || 'Numero pendiente'}</Text>
          <Text style={styles.leaderName}>{g?.leader?.displayName}</Text>
        </View>
        <Button label="Confirmar pago de fianza" onPress={handlePay} loading={isLoading} />
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
  amountCard: { alignItems: 'center', marginBottom: SPACING.xl, paddingVertical: SPACING.xl },
  amountLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.sm },
  infoBox: { backgroundColor: COLORS.emerald + '0E', borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.emerald, padding: SPACING.lg, marginBottom: SPACING.xl },
  infoTitle: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '700', marginBottom: SPACING.sm },
  infoBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18, marginBottom: SPACING.sm },
  disclaimer: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', fontStyle: 'italic' },
  leaderInfo: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.charcoal + '12' },
  leaderLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginBottom: SPACING.sm },
  leaderPhone: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, letterSpacing: 1, marginBottom: SPACING.xs },
  leaderName: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80' },
});
