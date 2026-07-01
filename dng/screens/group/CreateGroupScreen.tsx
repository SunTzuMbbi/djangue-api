import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { Button, LegalBar, ErrorBanner } from '../../components/common';
import type { CreateGroupForm, PaymentMethod } from '../../types';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { createGroup, isLoading, error, clearError } = useGroupStore();
  const { user } = useAuthStore();
  const [form, setForm] = useState<Partial<CreateGroupForm>>({ amount: 100, maxParticipants: 4, paymentMethod: 'bizum', depositAmount: 50 });
  const [accepted, setAccepted] = useState(false);

  const isLevel2 = user?.leaderLevel === 2;
  const maxAmount = isLevel2 ? 150 : 50;
  const maxPart = isLevel2 ? 8 : 4;
  const bote = (form.amount || 0) * (form.maxParticipants || 0);

  const handleCreate = async () => {
    if (!form.name?.trim()) { Alert.alert('Nombre requerido', 'Dale un nombre a tu tanda.'); return; }
    if (!accepted) { Alert.alert('Acepta las condiciones', 'Debes aceptar tu responsabilidad como lider.'); return; }
    try {
      const group = await createGroup(form as CreateGroupForm);
      router.replace({ pathname: '/(group)/[id]', params: { id: group.id } });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.close}>Cerrar</Text></TouchableOpacity>
          <Text style={styles.title}>Nueva tanda</Text>
          <View style={{ width: 60 }} />
        </View>
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <View style={styles.levelBanner}>
          <Text style={styles.levelTitle}>Nivel {user?.leaderLevel || 1} de lider</Text>
          <Text style={styles.levelBody}>{isLevel2 ? 'Hasta 150 EUR por mes y 8 participantes.' : 'Hasta 50 EUR por mes y 4 participantes. Completa un ciclo para subir de nivel.'}</Text>
        </View>
        <Text style={styles.label}>Nombre de la tanda</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Tanda comunidad enero 2026" placeholderTextColor={COLORS.charcoal + '50'} maxLength={60} />
        <Text style={styles.label}>Importe mensual por participante</Text>
        <View style={styles.chipRow}>
          {[50, 100, 150, 200].filter(a => a <= maxAmount).map(a => (
            <TouchableOpacity key={a} style={[styles.chip, form.amount === a && styles.chipActive]} onPress={() => setForm(f => ({ ...f, amount: a }))}>
              <Text style={[styles.chipText, form.amount === a && styles.chipTextActive]}>{a} EUR</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Numero de participantes</Text>
        <View style={styles.chipRow}>
          {[4, 6, 8].filter(p => p <= maxPart).map(p => (
            <TouchableOpacity key={p} style={[styles.chip, form.maxParticipants === p && styles.chipActive]} onPress={() => setForm(f => ({ ...f, maxParticipants: p }))}>
              <Text style={[styles.chipText, form.maxParticipants === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Fianza (EUR)</Text>
        <Text style={styles.fieldHint}>Se transfiere a ti por Bizum. La devuelves al completar el ciclo.</Text>
        <TextInput style={styles.input} value={String(form.depositAmount || '')} onChangeText={v => setForm(f => ({ ...f, depositAmount: Number(v.replace(/\D/g, '')) }))} keyboardType="number-pad" placeholder="50" placeholderTextColor={COLORS.charcoal + '50'} />
        <Text style={styles.label}>Metodo de pago</Text>
        <View style={styles.methodRow}>
          {(['bizum', 'sepa'] as PaymentMethod[]).map(m => (
            <TouchableOpacity key={m} style={[styles.methodBtn, form.paymentMethod === m && styles.methodBtnActive]} onPress={() => setForm(f => ({ ...f, paymentMethod: m }))}>
              <Text style={[styles.methodBtnText, form.paymentMethod === m && styles.methodBtnTextActive]}>{m === 'bizum' ? 'Bizum' : 'SEPA'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.responsibilityBox}>
          <View style={styles.responsibilityHeader}>
            <Text style={styles.responsibilityTitle}>Responsabilidad del lider</Text>
            <Switch value={accepted} onValueChange={setAccepted} trackColor={{ false: COLORS.charcoal + '30', true: COLORS.emerald }} thumbColor={accepted ? COLORS.cream : COLORS.white} />
          </View>
          <Text style={styles.responsibilityText}>Como lider, recibiras las fianzas de los participantes directamente por Bizum. Te comprometes a coordinar la tanda y devolver las fianzas al finalizar. Djangue coordina la tanda y no custodia el dinero.</Text>
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Bote mensual</Text><Text style={styles.summaryValue}>{bote} EUR</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Duracion</Text><Text style={styles.summaryValue}>{form.maxParticipants} meses</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tu bote cuando cobres</Text><Text style={styles.summaryValue}>{bote} EUR</Text></View>
        </View>
        <Button label="Crear tanda" onPress={handleCreate} loading={isLoading} disabled={!accepted} style={{ marginTop: SPACING.lg }} />
      </ScrollView>
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
  close: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  levelBanner: { backgroundColor: COLORS.emerald + '12', borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.emerald, padding: SPACING.md, marginBottom: SPACING.xl },
  levelTitle: { ...TYPOGRAPHY.body, color: COLORS.emerald, fontWeight: '700', marginBottom: 2 },
  levelBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  fieldHint: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  chip: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', backgroundColor: COLORS.white },
  chipActive: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald },
  chipText: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600' },
  chipTextActive: { color: COLORS.cream },
  methodRow: { flexDirection: 'row', gap: SPACING.sm },
  methodBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', alignItems: 'center', backgroundColor: COLORS.white },
  methodBtnActive: { borderColor: COLORS.emerald, backgroundColor: COLORS.emerald },
  methodBtnText: { ...TYPOGRAPHY.label, color: COLORS.charcoal, fontWeight: '600' },
  methodBtnTextActive: { color: COLORS.cream },
  responsibilityBox: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.charcoal + '15', marginTop: SPACING.xl },
  responsibilityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  responsibilityTitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700' },
  responsibilityText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  summary: { backgroundColor: COLORS.charcoal + '06', borderRadius: RADIUS.md, padding: SPACING.lg, marginTop: SPACING.xl },
  summaryTitle: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', marginBottom: SPACING.md, textTransform: 'uppercase' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  summaryLabel: { ...TYPOGRAPHY.body, color: COLORS.charcoal + '80' },
  summaryValue: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '700' },
});
