import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, LegalBar, ErrorBanner } from '../../components/common';

export default function ReportIdentityScreen() {
  const router = useRouter();
  const { groupId, participantId } = useLocalSearchParams<{ groupId: string; participantId?: string }>();
  const { openDispute, isLoading, error, clearError } = useGroupStore();
  const [desc, setDesc] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    await openDispute({ groupId, type: 'identity', description: desc, reportedId: participantId });
    setSent(true);
  };

  if (sent) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.success}>
        <View style={styles.circle}><Text style={styles.circleText}>OK</Text></View>
        <Text style={styles.successTitle}>Denuncia enviada</Text>
        <Text style={styles.successBody}>Verificaremos la identidad del participante en las proximas 24-48 horas.</Text>
        <TouchableOpacity style={styles.cta} onPress={() => router.back()}><Text style={styles.ctaText}>Volver</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Denunciar identidad</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {error && <ErrorBanner message={error} onDismiss={clearError} />}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Reportar identidad falsa</Text>
          <Text style={styles.warningBody}>Si sospechas que alguien ha proporcionado una identidad falsa, reportalo aqui. Investigaremos el caso.</Text>
        </View>
        <Text style={styles.label}>Describe la sospecha</Text>
        <TextInput style={styles.textarea} value={desc} onChangeText={setDesc} placeholder="Que te hace sospechar? Incluye cualquier dato relevante." placeholderTextColor={COLORS.charcoal + '50'} multiline numberOfLines={5} textAlignVertical="top" />
        <Button label="Enviar denuncia" onPress={handleSend} loading={isLoading} disabled={desc.trim().length < 20} />
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
  warningBox: { backgroundColor: COLORS.coral + '10', borderRadius: RADIUS.md, borderLeftWidth: 3, borderLeftColor: COLORS.coral, padding: SPACING.lg, marginBottom: SPACING.xl },
  warningTitle: { ...TYPOGRAPHY.body, color: COLORS.coral, fontWeight: '700', marginBottom: SPACING.sm },
  warningBody: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + 'AA', lineHeight: 18 },
  label: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '80', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  textarea: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.charcoal + '20', padding: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.charcoal, minHeight: 120, marginBottom: SPACING.xl },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  circle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  circleText: { fontSize: 20, color: COLORS.cream, fontWeight: '700' },
  successTitle: { ...TYPOGRAPHY.h2, color: COLORS.charcoal, textAlign: 'center', marginBottom: SPACING.md },
  successBody: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 24, marginBottom: SPACING.xxl },
  cta: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl },
  ctaText: { ...TYPOGRAPHY.button, color: COLORS.cream },
});
