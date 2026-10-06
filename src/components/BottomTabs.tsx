import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

export type TabKey = 'map' | 'pokedex' | 'bag';

interface Props {
  tab: TabKey;
  onChange: (t: TabKey) => void;
}

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: { key: TabKey; icon: IconName; label: string }[] = [
  { key: 'map', icon: 'compass', label: 'Campus' },
  { key: 'pokedex', icon: 'book', label: 'Pokédex' },
  { key: 'bag', icon: 'bag-handle', label: 'Mochila' },
];

const BLUE = '#0b3d7a';
const BUBBLE = 58;

function BottomTabs({ tab, onChange }: Props) {
  const [w, setW] = useState(0);
  const index = TABS.findIndex((t) => t.key === tab);
  const slide = useRef(new Animated.Value(index)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: index, friction: 7, tension: 90, useNativeDriver: true }).start();
    bounce.setValue(0.6);
    Animated.spring(bounce, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [index, slide, bounce]);

  const itemW = w / TABS.length;
  const x = slide.interpolate({
    inputRange: TABS.map((_, i) => i),
    outputRange: TABS.map((_, i) => i * itemW + (itemW - BUBBLE) / 2),
  });

  return (
    <View style={styles.bar} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Animated.View style={[styles.bubble, { transform: [{ translateX: x }] }]}>
          <View style={styles.bubbleRing} />
        </Animated.View>
      )}

      {TABS.map((t, i) => {
        const active = i === index;
        return (
          <Pressable key={t.key} style={styles.item} onPress={() => onChange(t.key)}>
            <Animated.View style={[styles.iconBox, active && { transform: [{ translateY: -22 }, { scale: bounce }] }]}>
              <Ionicons name={t.icon} size={active ? 28 : 24} color={active ? 'white' : '#94a3b8'} />
            </Animated.View>
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
    flexDirection: 'row', backgroundColor: 'white', paddingTop: 12, paddingBottom: 26,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    shadowColor: '#0b2a5b', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: -4 }, elevation: 16,
  },
  bubble: {
    position: 'absolute', top: -14, left: 0, width: BUBBLE, height: BUBBLE, borderRadius: BUBBLE / 2,
    backgroundColor: BLUE, borderWidth: 5, borderColor: '#f1f5fd',
    shadowColor: BLUE, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  bubbleRing: { ...StyleSheet.absoluteFillObject, borderRadius: BUBBLE / 2, borderWidth: 2, borderColor: 'rgba(250,204,21,0.9)' },
  item: { flex: 1, alignItems: 'center', height: 48, justifyContent: 'flex-end' },
  iconBox: { height: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  label: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  labelActive: { color: BLUE, fontWeight: '900' },
});