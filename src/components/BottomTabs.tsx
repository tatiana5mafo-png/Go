import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type TabKey = 'map' | 'dex' | 'bag';

interface Props {
  tab: TabKey;
  onChange: (t: TabKey) => void;
}

const TABS: { key: TabKey; icon: keyof typeof Ionicons.glyphMap; iconOff: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'map', icon: 'compass', iconOff: 'compass-outline', label: 'Campus' },
  { key: 'dex', icon: 'book', iconOff: 'book-outline', label: 'Pokédex' },
  { key: 'bag', icon: 'bag-handle', iconOff: 'bag-handle-outline', label: 'Mochila' },
];

function BottomTabs({ tab, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <Pressable key={t.key} style={styles.item} onPress={() => onChange(t.key)}>
            <View style={[styles.iconWrap, active && styles.iconActive]}>
              <Ionicons name={active ? t.icon : t.iconOff} size={24} color={active ? '#0b4f9c' : '#64748b'} />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(BottomTabs);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'white',
    paddingTop: 8, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0',
  },
  item: { alignItems: 'center', minWidth: 90 },
  iconWrap: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 16 },
  iconActive: { backgroundColor: '#fde68a' },
  label: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 2 },
  labelActive: { color: '#0b4f9c' },
});