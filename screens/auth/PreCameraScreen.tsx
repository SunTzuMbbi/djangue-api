import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { Button, LegalBar } from '../../components/common';

export default function PreCameraScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>PreCamera</Text>
        <Button label="Continuar" onPress={() => router.push('/(auth)/otp' as any)} />
      </View>
      <LegalBar />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  title: { ...TYPOGRAPHY.h1, color: COLORS.charcoal, marginBottom: SPACING.xxl },
});
