import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, LegalBar, ErrorBanner } from '../../components/common';

const TYPES = [
  { id: 'non_payment', label: 'Pago no recibido' },
  { id: 'phantom', label: 'Participante fantasma' },
  { id: 'identity', label: 'Identidad sospechosa' },
  { id: 'fraud', label: 'Fraude o estafa' },
  { id: 'other', label: 'Otro problema' },
];

export default function DisputeScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { openDispute, isLoading, error, clearError } = useGroupStore();
  const [type, setType] = useState('');
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!type || !desc.trim()) return;
    await openDispute({ groupId, type, description: desc });
    setSent(true);
  };

  if (sent) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.success}>
        <View style={styles.circle}><Text style={styles.circleText}>OK</Text></View>
        <Text style={styles.successTitle}>Disputa enviada</Text>
        <Text style={styles.successBody}>Hemos recibido tu reporte. El equipo lo revisara en 48 horas.</Text>
        <TouchableOpacity style={styles.successCta} onPress={() => router.back()}><Text style={styles.successCtaText}>Volver</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Reportar problema</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <Text style={styles.label}>Tipo de problema</Text>
        <View style={styles.typeGrid}>
          {TYPES.map(t => (
            <TouchableOpacity key={t.id} style={[styles.chip, type === t.id && styles.chipActive]} onPress={() => setType(t.id)}>
              <Text style={[styles.chipText, type === t.id && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Descripcion del problema</Text>
        <TextInput style={styles.textarea} value={desc} onChangeText={setDesc} placeholder="Describe el problema con detalle. Incluye fechas y referencias." placeholderTextColor={COLORS.charcoal + '50'} multiline numberOfLines={5} textAlignVertical="top" />
        <View style={styles.warningBox}><Text style={styles.warningText}>Los reportes falsos pueden resultar en la suspension de tu cuenta.</Text></View>
        <Button label="Enviar reporte" onPress={handleSend} loading={isLoading} disabled={!type || desc.trim().length < 20} />
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
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.lg },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  chip: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', backgroundColor: COLORS.white },
  chipActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coral },
  chipText: { ...TYPOGRAPHY.caption, color: COLORS.charcoal, fontWeight: '600' },
  chipTextActive: { color: COLORS.cream },
  textarea: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', padding: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal, minHeight: 120, marginBottom: SPACING.lg },
  warningBox: { backgroundColor: COLORS.coral + '10', borderRadius: RADIUS.sm, borderLeftWidth: 3, borderLeftColor: COLORS.coral, padding: SPACING.md, marginBottom: SPACING.xl },
  warningText: { ...TYPOGRAPHY.caption, color: COLORS.coral, lineHeight: 18 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  circleText: { fontSize: 20, color: COLORS.cream, fontWeight: '700' },
  successTitle: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.md },
  successBody: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xxl },
  successCta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl },
  successCtaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
});
