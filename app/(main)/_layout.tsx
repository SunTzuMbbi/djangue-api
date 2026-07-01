import { Tabs } from 'expo-router';
import { COLORS } from '../../theme';

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.white, borderTopColor: COLORS.charcoal + '12' },
        tabBarActiveTintColor: COLORS.emerald,
        tabBarInactiveTintColor: COLORS.charcoal + '60',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar', tabBarLabel: 'Explorar' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Avisos', tabBarLabel: 'Avisos' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarLabel: 'Perfil' }} />
      <Tabs.Screen name="reputation" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="monthly-summary" options={{ href: null }} />
      <Tabs.Screen name="demo" options={{ href: null }} />
    </Tabs>
  );
}
