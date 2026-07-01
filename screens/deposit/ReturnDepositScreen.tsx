import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, LegalBar, Card } from '../../components/common';

export default function ReturnDepositScreen() {
  const router = useRouter();
  const { groupId, participantId, amount } = useLocalSearchParams<{ groupId: string; participantId: string; amount: string }>();
  const { returnDeposit, isLoading } = useGroupStore();

  const handleReturn = () => {
    Alert.alert('Devolver fianza', 'Confirmas que has devuelto la fianza al participante?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Si, confirmar', onPress: async () => { await returnDeposit(groupId!, participantId!); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Devolver fianza</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.amountDisplay}>
          <Text style={styles.amountLabel}>Importe a devolver</Text>
          <Text style={styles.amount}>{amount || '0'} EUR</Text>
        </View>
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como devolver la fianza</Text>
          <Text style={styles.infoBody}>Envia el importe al participante por Bizum o transferencia. Una vez enviado, confirma aqui para cerrar la fianza en el sistema.</Text>
          <Text style={styles.disclaimer}>Djangue coordina la tanda y no custodia el dinero.</Text>
        </Card>
        <Button label="Confirmar devolucion" onPress={handleReturn} loading={isLoading} />
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
  amountDisplay: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  amountLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.sm },
  amount: { fontSize: 48, fontWeight: '700', color: COLORS.emerald },
  infoCard: { marginBottom: SPACING.xl },
  infoTitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700', marginBottom: SPACING.sm },
  infoBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18, marginBottom: SPACING.sm },
  disclaimer: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', fontStyle: 'italic' },
});
