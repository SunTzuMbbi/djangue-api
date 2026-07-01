import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme';
import { useGroupStore } from '../../store/groupStore';
import { Button, Card, LegalBar, Avatar } from '../../components/common';

export default function LotteryScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { activeGroup, runLottery, isLoading } = useGroupStore();
  const [done, setDone] = useState(!!activeGroup?.lotteryHash);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleRun = () => {
    Alert.alert('Ejecutar sorteo', 'El sorteo es irreversible y se registrará con un hash único. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ejecutar', style: 'default', onPress: async () => {
        Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: true }), { iterations: 5 }).start();
        await runLottery(groupId!);
        setDone(true);
      }},
    ]);
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>‹ Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Sorteo de la tanda</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <Animated.View style={[styles.spinWheel, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinWheelInner} />
          </Animated.View>
          {!done ? (
            <>
              <Text style={styles.hint}>El sorteo asigna aleatoriamente el orden de cobro. El resultado queda registrado con un hash inmutable visible para todos.</Text>
              <Button label="Ejecutar sorteo ahora" onPress={handleRun} loading={isLoading} />
            </>
          ) : (
            <>
              <View style={styles.successBadge}>
                <Text style={styles.successText}>Sorteo completado</Text>
              </View>
              {activeGroup?.lotteryHash && (
                <Card style={styles.hashCard}>
                  <Text style={styles.hashLabel}>Hash del sorteo (inmutable)</Text>
                  <Text style={styles.hashValue}>{activeGroup.lotteryHash}</Text>
                </Card>
              )}
              <Text style={styles.orderTitle}>Orden de cobro</Text>
              {activeGroup?.participants.sort((a, b) => a.cyclePosition - b.cyclePosition).map((p, i) => (
                <View key={p.id} style={styles.orderRow}>
                  <View style={styles.orderPos}><Text style={styles.orderPosText}>{p.cyclePosition}</Text></View>
                  <Avatar name={p.user?.displayName || '?'} size={32} />
                  <Text style={styles.orderName}>{p.user?.displayName}</Text>
                </View>
              ))}
            </>
          )}
        </View>
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
  center: { alignItems: 'center', paddingTop: SPACING.xl },
  spinWheel: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.emerald, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  spinWheelInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.emerald },
  hint: { ...TYPOGRAPHY.body, color: COLORS.charcoal + 'AA', textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl, paddingHorizontal: SPACING.lg },
  successBadge: { backgroundColor: COLORS.emerald, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  successText: { ...TYPOGRAPHY.button, color: COLORS.cream },
  hashCard: { width: '100%', marginBottom: SPACING.xl },
  hashLabel: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '70', marginBottom: SPACING.sm },
  hashValue: { ...TYPOGRAPHY.mono, color: COLORS.charcoal, fontSize: 11, lineHeight: 16 },
  orderTitle: { ...TYPOGRAPHY.h3, color: COLORS.charcoal, alignSelf: 'flex-start', marginBottom: SPACING.md },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, alignSelf: 'stretch', paddingVertical: SPACING.sm },
  orderPos: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.emerald, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  orderPosText: { ...TYPOGRAPHY.caption, color: COLORS.cream, fontWeight: '700' },
  orderName: { ...TYPOGRAPHY.body, color: COLORS.charcoal },
});
