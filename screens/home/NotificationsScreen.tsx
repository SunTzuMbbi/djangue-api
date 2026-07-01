import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { notificationApi } from '../../services/api';
import { EmptyState, LegalBar } from '../../components/common';
import type { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const TYPE_COLORS: Record<string, string> = {
  payment_due: COLORS.coral, payment_received: COLORS.emerald,
  cycle_completed: COLORS.emerald, lottery_done: COLORS.emerald,
  dispute_opened: COLORS.coral, dispute_resolved: COLORS.emerald,
  verification_approved: COLORS.emerald, verification_rejected: COLORS.coral,
  phantom_warning: COLORS.coral, group_expiring: COLORS.coral,
  default: COLORS.charcoal,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.list();
      setNotifications(data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  const markAllRead = async () => {
    await notificationApi.markAll();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => { fetch(); }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Marcar todas leídas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor={COLORS.emerald} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState title="Sin notificaciones" body="Cuando haya actividad en tus tandas, aparecerá aquí." />}
        renderItem={({ item: n }) => {
          const color = TYPE_COLORS[n.type] || TYPE_COLORS.default;
          const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es });
          return (
            <TouchableOpacity
              style={[styles.notif, !n.read && styles.notifUnread]}
              onPress={async () => {
                await notificationApi.markRead(n.id);
                if (n.groupId) router.push({ pathname: '/(group)/[id]', params: { id: n.groupId } });
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.notifDot, { backgroundColor: color }]} />
              <View style={styles.notifBody}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifText}>{n.body}</Text>
                <Text style={styles.notifTime}>{timeAgo}</Text>
              </View>
              {!n.read && <View style={styles.unreadBadge} />}
            </TouchableOpacity>
          );
        }}
      />
      <LegalBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.charcoal },
  markAll: { ...TYPOGRAPHY.caption, color: COLORS.emerald, fontWeight: '600' },
  list: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxxl },
  notif: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.charcoal + '0E' },
  notifUnread: { borderColor: COLORS.emerald + '30', backgroundColor: COLORS.emerald + '05' },
  notifDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: SPACING.md, flexShrink: 0 },
  notifBody: { flex: 1 },
  notifTitle: { ...TYPOGRAPHY.body, color: COLORS.charcoal, fontWeight: '600', marginBottom: 2 },
  notifText: { ...TYPOGRAPHY.bodySmall, color: COLORS.charcoal + 'AA', lineHeight: 18, marginBottom: 4 },
  notifTime: { ...TYPOGRAPHY.caption, color: COLORS.charcoal + '60' },
  unreadBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald, marginTop: 4 },
});
