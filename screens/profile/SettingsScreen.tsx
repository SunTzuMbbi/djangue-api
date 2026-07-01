import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { LegalBar, Divider } from '../../components/common';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifDispute, setNotifDispute] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleDelete = () => {
    Alert.alert('Eliminar cuenta', 'Esta accion es irreversible y eliminara todos tus datos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Configuracion</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Notificaciones</Text>
        {[
          { label: 'Pagos y cobros', value: notifPayment, set: setNotifPayment },
          { label: 'Recordatorios de pago', value: notifReminder, set: setNotifReminder },
          { label: 'Disputas y alertas', value: notifDispute, set: setNotifDispute },
        ].map(item => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Switch value={item.value} onValueChange={item.set} trackColor={{ false: COLORS.charcoal + '30', true: COLORS.emerald }} thumbColor={item.value ? COLORS.cream : COLORS.white} />
          </View>
        ))}
        <Divider />
        <Text style={styles.sectionLabel}>Seguridad</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Autenticacion biometrica</Text>
          <Switch value={biometric} onValueChange={setBiometric} trackColor={{ false: COLORS.charcoal + '30', true: COLORS.emerald }} thumbColor={biometric ? COLORS.cream : COLORS.white} />
        </View>
        <Divider />
        <Text style={styles.sectionLabel}>Cuenta</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/(auth)/pre-camera' as any)}>
          <Text style={styles.rowLabel}>Verificar identidad</Text>
          <Text style={styles.rowArrow}>{'>'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={logout}>
          <Text style={[styles.rowLabel, { color: COLORS.coral }]}>Cerrar sesion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleDelete}>
          <Text style={[styles.rowLabel, { color: COLORS.coral }]}>Eliminar cuenta</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Djangue v1.0.0 - Djangue coordina la tanda y no custodia el dinero.</Text>
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
  sectionLabel: { ...TYPOGRAPHY.label, color: COLORS.charcoal + '70', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: SPACING.xl, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderColor: COLORS.charcoal + '0E' },
  rowLabel: { ...TYPOGRAPHY.body, color: COLORS.charcoal },
  rowArrow: { fontSize: 20, color: COLORS.charcoal + '50' },
  version: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '50', textAlign: 'center', marginTop: SPACING.xxl, fontStyle: 'italic' },
});
