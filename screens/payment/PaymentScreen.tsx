import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, Card, LegalBar, AmountDisplay, ErrorBanner } from '../../components/common';

export default function PaymentScreen() {
  const router = useRouter();
  const { groupId, cycleId } = useLocalSearchParams<{ groupId: string; cycleId?: string }>();
  const { activeGroup, confirmPayment, isLoading, error, clearError } = useGroupStore();
  const [ref, setRef] = useState('');
  const [step, setStep] = useState<'instructions' | 'confirm'>('instructions');
  const g = activeGroup;

  const handleConfirm = async () => {
    await confirmPayment(groupId!, cycleId || '', ref);
    router.push({ pathname: '/(group)/payment-confirm', params: { groupId, amount: String(g?.amount) } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Realizar pago</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <Card style={styles.amountCard}>
          <Text style={styles.amountLabel}>Importe a pagar</Text>
          <AmountDisplay amount={g?.amount || 0} size="lg" color={COLORS.emerald} />
          <Text style={styles.amountSub}>Tanda: {g?.name}</Text>
        </Card>
        {step === 'instructions' ? (
          <>
            <Text style={styles.sectionTitle}>Como pagar con Bizum</Text>
            <Card style={styles.stepsCard}>
              <View style={styles.step}><View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View><Text style={styles.stepText}>Abre Bizum en tu app bancaria.</Text></View>
              <View style={styles.step}><View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View><Text style={styles.stepText}>Envia el importe al cobrador de este ciclo.</Text></View>
              <View style={styles.step}><View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View><Text style={styles.stepText}>En el concepto indica el codigo de tu tanda.</Text></View>
              <View style={styles.step}><View style={styles.stepNum}><Text style={styles.stepNumText}>4</Text></View><Text style={styles.stepText}>Vuelve aqui y confirma el pago.</Text></View>
              <View style={styles.phoneBox}>
                <Text style={styles.phoneLabel}>Numero del cobrador</Text>
                <Text style={styles.phoneNumber}>{g?.leader?.phone || 'Pendiente de sorteo'}</Text>
              </View>
            </Card>
            <Button label="Ya he pagado, confirmar" onPress={() => setStep('confirm')} />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Confirma el pago</Text>
            <Text style={styles.refHint}>Introduce la referencia de tu Bizum (opcional pero recomendado).</Text>
            <TextInput style={styles.input} value={ref} onChangeText={setRef} placeholder="Referencia Bizum" placeholderTextColor={COLORS.charcoal + '50'} />
            <Button label="Confirmar pago" onPress={handleConfirm} loading={isLoading} />
            <TouchableOpacity style={styles.claimLink} onPress={() => router.push({ pathname: '/(group)/claim-payment', params: { groupId } })}>
              <Text style={styles.claimLinkText}>El cobrador no reconoce tu pago? Reclamar aqui</Text>
            </TouchableOpacity>
          </>
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
  amountCard: { alignItems: 'center', marginBottom: SPACING.xl, paddingVertical: SPACING.xl },
  amountLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: SPACING.sm },
  amountSub: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginTop: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, marginBottom: SPACING.md },
  stepsCard: { marginBottom: SPACING.xl },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg, gap: SPACING.md },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { ...TYPOGRAPHY.caption, color: COLORS.cream, fontWeight: '700' },
  stepText: { ...TYPOGRAPHY.body, color: COLORS.charcoal, flex: 1, lineHeight: 22 },
  phoneBox: { backgroundColor: COLORS.emerald + '12', borderRadius: RADIUS.sm, padding: SPACING.md, marginTop: SPACING.sm },
  phoneLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '80', marginBottom: 4 },
  phoneNumber: { ...TYPOGRAPHY.h3, color: COLORS.emerald, letterSpacing: 1 },
  refHint: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', marginBottom: SPACING.md, lineHeight: 22 },
  input: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal, marginBottom: SPACING.xl },
  claimLink: { alignItems: 'center', paddingVertical: SPACING.md },
  claimLinkText: { ...TYPOGRAPHY.caption, color: COLORS.coral, textDecorationLine: 'underline', textAlign: 'center' },
});
