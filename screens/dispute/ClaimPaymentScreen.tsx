import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, LegalBar, Card, ErrorBanner } from '../../components/common';

export default function ClaimPaymentScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { claimUnregisteredPayment, isLoading, error, clearError } = useGroupStore();
  const [ref, setRef] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);

  const handleClaim = async () => {
    await claimUnregisteredPayment({ groupId, bizumRef: ref, amount: Number(amount), notes });
    setSent(true);
  };

  if (sent) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.success}>
        <View style={styles.circle}><Text style={styles.circleText}>OK</Text></View>
        <Text style={styles.successTitle}>Reclamacion enviada</Text>
        <Text style={styles.successBody}>El cobrador tiene 48h para confirmar. Si no responde, el caso se escala al equipo de Djangue.</Text>
        <TouchableOpacity style={styles.successCta} onPress={() => router.back()}><Text style={styles.successCtaText}>Volver</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Reclamar pago</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Que es una reclamacion?</Text>
          <Text style={styles.infoBody}>Si realizaste el pago pero el cobrador no lo ha confirmado, puedes reclamarlo aqui. Necesitaras la referencia de tu Bizum.</Text>
        </Card>
        <Text style={styles.label}>Referencia del Bizum</Text>
        <TextInput style={styles.input} value={ref} onChangeText={setRef} placeholder="Referencia o ID de la transaccion" placeholderTextColor={COLORS.charcoal + '50'} />
        <Text style={styles.label}>Importe enviado (EUR)</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="100" placeholderTextColor={COLORS.charcoal + '50'} />
        <Text style={styles.label}>Notas adicionales</Text>
        <TextInput style={styles.textarea} value={notes} onChangeText={setNotes} placeholder="Fecha, hora, cualquier detalle adicional..." placeholderTextColor={COLORS.charcoal + '50'} multiline numberOfLines={4} textAlignVertical="top" />
        <Button label="Enviar reclamacion" onPress={handleClaim} loading={isLoading} disabled={!ref.trim() || !amount} />
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
  infoCard: { marginBottom: SPACING.xl },
  infoTitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700', marginBottom: SPACING.sm },
  infoBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  input: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal },
  textarea: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', padding: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal, minHeight: 100, marginBottom: SPACING.xl },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  circleText: { fontSize: 20, color: COLORS.cream, fontWeight: '700' },
  successTitle: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.md },
  successBody: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xxl },
  successCta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl },
  successCtaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
});
