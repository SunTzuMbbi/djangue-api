import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';

const TABS = [
  { name: 'home',          label: 'Inicio',   activeColor: COLORS.emerald },
  { name: 'explore',       label: 'Explorar', activeColor: COLORS.blue },
  { name: 'notifications', label: 'Avisos',   activeColor: COLORS.coral },
  { name: 'profile',       label: 'Perfil',   activeColor: COLORS.purple },
];

function TabIcon({ focused, label, activeColor }: { focused: boolean; label: string; activeColor: string }) {
  return (
    <View style={styles.wrap}>
      {focused && <View style={[styles.indicator, { backgroundColor: activeColor }]} />}
      <View style={[styles.dot, focused && { backgroundColor: activeColor + '20' }]}>
        <View style={[styles.dotInner, { backgroundColor: focused ? activeColor : COLORS.navy + '30' }]} />
      </View>
      <Text style={[styles.label, focused && { color: activeColor, fontWeight: '700' }]}>{label}</Text>
    </View>
  );
}

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: styles.bar }}>
      {TABS.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name}
          options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} label={tab.label} activeColor={tab.activeColor} /> }} />
      ))}
      <Tabs.Screen name="reputation"      options={{ href: null }} />
      <Tabs.Screen name="settings"        options={{ href: null }} />
      <Tabs.Screen name="monthly-summary" options={{ href: null }} />
      <Tabs.Screen name="demo"            options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy + '10',
    height: 68,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 16,
  },
  wrap:      { alignItems: 'center', justifyContent: 'center', width: 72, paddingTop: 4 },
  indicator: { position: 'absolute', top: -1, width: 32, height: 3, borderRadius: 2 },
  dot:       { width: 36, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  dotInner:  { width: 6, height: 6, borderRadius: 3 },
  label:     { fontSize: 10, color: COLORS.navy + '50', fontWeight: '500', letterSpacing: 0.2 },
});
