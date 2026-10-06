import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ITEM_BY_ID, ITEM_CATALOG, ItemCategory, ItemDef, ItemId } from '../constants/items';
import { useInventory } from '../context/InventoryContext';

type Filter = 'all' | ItemCategory;

const BLUE = '#0b4f9c';
const BLUE_SOFT = '#dbe8fb';
const INK = '#1f2937';

// Valores de ejemplo para la barra superior. En la Fase 4 vienen del perfil en Supabase.
const PROFILE = { name: 'Trainer Sabana', level: 28, xp: '48.2k', coins: 350 };

/** Poké Ball dibujada en SVG: la parte de arriba cambia de color según el tipo. */
const BallIcon = memo(function BallIcon({ size, top }: { size: number; top: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#ffffff" stroke={INK} strokeWidth="5" />
      <Path d="M4 50 A46 46 0 0 1 96 50 Z" fill={top} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <Path d="M4 50 H96" stroke={INK} strokeWidth="6" />
      <Circle cx="50" cy="50" r="13" fill="#ffffff" stroke={INK} strokeWidth="5" />
    </Svg>
  );
});

const ITEM_ICON: Record<ItemId, (size: number) => JSX.Element> = {
  pokeball: (s) => <BallIcon size={s} top="#ef4444" />,
  greatball: (s) => <BallIcon size={s} top="#2563eb" />,
  ultraball: (s) => <BallIcon size={s} top="#f5b301" />,
  potion: (s) => <Ionicons name="flask" size={s} color="#0891b2" />,
  revive: (s) => <Ionicons name="heart" size={s} color="#e11d48" />,
  berry: (s) => <Ionicons name="nutrition" size={s} color="#dc2626" />,
};

interface CardProps {
  item: ItemDef;
  qty: number;
  selected: boolean;
  compact?: boolean;
  onPress: (id: ItemId) => void;
}

const ItemCard = memo(function ItemCard({ item, qty, selected, compact, onPress }: CardProps) {
  if (compact) {
    return (
      <Pressable
        onPress={() => onPress(item.id)}
        style={[styles.card, styles.cardCompact, selected && styles.cardSelected]}
      >
        <View style={styles.compactTop}>
          <View style={[styles.iconCircleSm, { backgroundColor: item.tint }]}>{ITEM_ICON[item.id](24)}</View>
          <View style={styles.qtyPill}><Text style={styles.qtyPillText}>×{qty}</Text></View>
        </View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[styles.card, styles.cardRow, selected && styles.cardSelected]}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.tint }]}>
        {ITEM_ICON[item.id](36)}
        <View style={styles.badge}><Text style={styles.badgeText}>×{qty}</Text></View>
      </View>
      <View style={styles.rowText}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.desc}</Text>
      </View>
    </Pressable>
  );
});

export default function BackpackScreen() {
  const { stock, capacity, total, consume, refresh} = useInventory();
  useEffect(() => {
    refresh();
  }, [refresh]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<ItemId | null>(null);

  const owned = useMemo(() => ITEM_CATALOG.filter((i) => stock[i.id] > 0), [stock]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return owned.filter(
      (i) => (filter === 'all' || i.category === filter) && (q === '' || i.name.toLowerCase().includes(q)),
    );
  }, [owned, filter, query]);

  const balls = useMemo(() => visible.filter((i) => i.category === 'balls'), [visible]);
  const healing = useMemo(() => visible.filter((i) => i.category === 'healing'), [visible]);

  const sumOf = useCallback(
    (cat: ItemCategory) => owned.filter((i) => i.category === cat).reduce((s, i) => s + stock[i.id], 0),
    [owned, stock],
  );
  const ballsTotal = useMemo(() => sumOf('balls'), [sumOf]);
  const healingTotal = useMemo(() => sumOf('healing'), [sumOf]);

  const select = useCallback((id: ItemId) => setSelectedId((cur) => (cur === id ? null : id)), []);
  const closePanel = useCallback(() => setSelectedId(null), []);
  const selected = selectedId && stock[selectedId] > 0 ? ITEM_BY_ID[selectedId] : null;

  const pct = Math.min(100, (total / capacity) * 100);
  const nearFull = pct >= 85;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, selected && { paddingBottom: 300 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Barra de entrenador */}
        <View style={styles.topBar}>
          <View style={styles.trainer}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}><Ionicons name="person" size={26} color={BLUE} /></View>
              <View style={styles.levelBadge}><Text style={styles.levelText}>{PROFILE.level}</Text></View>
            </View>
            <View>
              <Text style={styles.trainerName}>{PROFILE.name}</Text>
              <Text style={styles.trainerSub}>Pokédex</Text>
            </View>
          </View>

          <View style={styles.centerPill}><BallIcon size={22} top="#ef4444" /></View>

          <View style={styles.stats}>
            <View style={styles.statPill}>
              <Ionicons name="sparkles" size={14} color={BLUE} />
              <Text style={styles.statText}>{PROFILE.xp}</Text>
            </View>
            <View style={[styles.statPill, styles.coinPill]}>
              <Ionicons name="disc" size={16} color="#b45309" />
              <Text style={[styles.statText, { color: '#78350f' }]}>{PROFILE.coins}</Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de capacidad */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.titleRow}>
              <Ionicons name="bag-handle" size={24} color={BLUE} />
              <Text style={styles.title}>Mochila de Objetos</Text>
            </View>
            <View style={[styles.status, nearFull && styles.statusWarn]}>
              <View style={[styles.dot, nearFull && styles.dotWarn]} />
              <Text style={[styles.statusText, nearFull && styles.statusTextWarn]}>
                {Math.round(pct)}% Ocupado
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Campus UniSabana • Temporada de Clases</Text>

          <View style={styles.capRow}>
            <View style={styles.capLeft}>
              <Text style={styles.capLabel}>Capacidad</Text>
              <View style={[styles.alertTag, !nearFull && styles.okTag]}>
                <Text style={[styles.alertText, !nearFull && styles.okText]}>{nearFull ? 'ALERTA' : 'OK'}</Text>
              </View>
            </View>
            <Text style={styles.capValue}>
              {total}
              <Text style={styles.capMax}> / {capacity}</Text>
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }, nearFull && styles.fillWarn]} />
          </View>
        </View>

        {/* Búsqueda */}
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={BLUE} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar Pokéball, baya o poción..."
            placeholderTextColor="#8a94a6"
            value={query}
            onChangeText={setQuery}
          />
          {query !== '' && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clearBtn}>
              <Ionicons name="close" size={16} color="#475569" />
            </Pressable>
          )}
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Pressable onPress={() => setFilter('all')} style={[styles.chip, filter === 'all' && styles.chipActive]}>
            <Ionicons name="grid" size={14} color={filter === 'all' ? 'white' : BLUE} />
            <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>Todos</Text>
            <View style={[styles.chipCount, filter === 'all' && styles.chipCountActive]}>
              <Text style={[styles.chipCountText, filter === 'all' && styles.chipCountTextActive]}>{total}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setFilter('balls')} style={[styles.chip, filter === 'balls' && styles.chipActive]}>
            <View style={styles.redDot} />
            <Text style={[styles.chipText, filter === 'balls' && styles.chipTextActive]}>Pokéballs</Text>
            <View style={[styles.chipCount, filter === 'balls' && styles.chipCountActive]}>
              <Text style={[styles.chipCountText, filter === 'balls' && styles.chipCountTextActive]}>{ballsTotal}</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setFilter('healing')} style={[styles.chip, filter === 'healing' && styles.chipActive]}>
            <Ionicons name="medkit" size={14} color={filter === 'healing' ? 'white' : '#dc2626'} />
            <Text style={[styles.chipText, filter === 'healing' && styles.chipTextActive]}>Curación</Text>
            <View style={[styles.chipCount, filter === 'healing' && styles.chipCountActive]}>
              <Text style={[styles.chipCountText, filter === 'healing' && styles.chipCountTextActive]}>{healingTotal}</Text>
            </View>
          </Pressable>
        </ScrollView>

        {/* Pokéballs */}
        {balls.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={styles.sectionLeft}>
                <View style={styles.redDotLg} />
                <Text style={styles.sectionTitle}>Pokéballs y Captura</Text>
              </View>
              <View style={styles.totalPill}><Text style={styles.totalText}>{ballsTotal} Total</Text></View>
            </View>
            {balls.map((i) => (
              <ItemCard key={i.id} item={i} qty={stock[i.id]} selected={selectedId === i.id} onPress={select} />
            ))}
          </>
        )}

        {/* Curación */}
        {healing.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <View style={styles.sectionLeft}>
                <Ionicons name="heart-outline" size={20} color="#dc2626" />
                <Text style={styles.sectionTitle}>Curación y Bayas</Text>
              </View>
              <View style={styles.totalPill}><Text style={styles.totalText}>{healingTotal} Total</Text></View>
            </View>
            <View style={styles.grid}>
              {healing.map((i) => (
                <ItemCard key={i.id} item={i} qty={stock[i.id]} selected={selectedId === i.id} compact onPress={select} />
              ))}
            </View>
          </>
        )}

        {visible.length === 0 && <Text style={styles.empty}>No hay objetos que coincidan.</Text>}
      </ScrollView>

      {/* Panel del objeto seleccionado */}
      {selected && (
        <View style={styles.panel}>
          <Pressable style={styles.panelClose} onPress={closePanel} hitSlop={8}>
            <Ionicons name="close" size={18} color="#475569" />
          </Pressable>
          <View style={[styles.panelIcon, { backgroundColor: selected.tint }]}>
            {ITEM_ICON[selected.id](56)}
            <View style={styles.badge}><Text style={styles.badgeText}>×{stock[selected.id]}</Text></View>
          </View>
          <Text style={styles.panelName}>{selected.name}</Text>
          <Text style={styles.panelDesc}>{selected.desc}</Text>
          {selected.category === 'healing' ? (
            <Pressable style={styles.useBtn} onPress={() => consume(selected.id)}>
              <Text style={styles.useBtnText}>USAR</Text>
            </Pressable>
          ) : (
            <Text style={styles.panelHint}>Se usa al lanzarla en el modo captura.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const SHADOW = {
  shadowColor: '#0b2a5b', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5fd' },
  scroll: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 24 },

  // Barra de entrenador
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  trainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarWrap: { width: 48, height: 48 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#dbe8fb',
    borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', ...SHADOW,
  },
  levelBadge: {
    position: 'absolute', left: -2, bottom: -4, minWidth: 22, height: 22, borderRadius: 11,
    backgroundColor: '#dc2626', borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  levelText: { color: 'white', fontWeight: '800', fontSize: 11 },
  trainerName: { fontSize: 14, fontWeight: '800', color: INK },
  trainerSub: { fontSize: 13, fontWeight: '600', color: BLUE },
  centerPill: {
    width: 56, height: 40, borderRadius: 20, backgroundColor: BLUE_SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  stats: { flexDirection: 'row', gap: 6 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'white',
    paddingHorizontal: 10, height: 34, borderRadius: 17, ...SHADOW,
  },
  coinPill: { backgroundColor: '#fcd34d', borderBottomWidth: 3, borderBottomColor: '#d99a00' },
  statText: { fontSize: 13, fontWeight: '800', color: INK },

  // Tarjeta de capacidad
  header: { backgroundColor: 'white', borderRadius: 26, padding: 18, ...SHADOW },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  title: { fontSize: 22, fontWeight: '800', color: BLUE },
  subtitle: { fontSize: 13, color: BLUE, marginTop: 4, fontWeight: '500' },
  status: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#dcfce7',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12,
  },
  statusWarn: { backgroundColor: '#fee2e2' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16a34a' },
  dotWarn: { backgroundColor: '#dc2626' },
  statusText: { color: '#166534', fontWeight: '800', fontSize: 11 },
  statusTextWarn: { color: '#b91c1c' },
  capRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  capLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capLabel: { fontWeight: '800', color: INK, fontSize: 14 },
  alertTag: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  alertText: { color: '#b91c1c', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 },
  okTag: { backgroundColor: '#dcfce7' },
  okText: { color: '#166534' },
  capValue: { fontWeight: '800', fontSize: 28, color: BLUE },
  capMax: { fontSize: 15, color: '#64748b', fontWeight: '600' },
  track: { height: 10, borderRadius: 5, backgroundColor: BLUE_SOFT, marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#2f80ed', borderRadius: 5 },
  fillWarn: { backgroundColor: '#f5b301' },

  // Búsqueda y filtros
  search: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 18,
    paddingHorizontal: 16, marginTop: 14, ...SHADOW,
  },
  searchInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 10, fontSize: 15, color: INK },
  clearBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },

  chips: { flexDirection: 'row', gap: 8, marginTop: 14, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'white',
    paddingHorizontal: 12, height: 40, borderRadius: 14, ...SHADOW,
  },
  chipActive: { backgroundColor: BLUE },
  chipText: { fontWeight: '700', color: INK, fontSize: 13 },
  chipTextActive: { color: 'white' },
  chipCount: { backgroundColor: '#e8eefb', paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8 },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipCountText: { color: BLUE, fontWeight: '800', fontSize: 11 },
  chipCountTextActive: { color: 'white' },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#dc2626' },
  redDotLg: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#dc2626' },

  // Secciones
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: BLUE },
  totalPill: { backgroundColor: BLUE_SOFT, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  totalText: { color: BLUE, fontWeight: '800', fontSize: 11 },

  // Tarjetas de objetos
  card: { backgroundColor: 'white', borderRadius: 20, borderWidth: 2, borderColor: 'transparent', ...SHADOW },
  cardSelected: { borderColor: '#f5b301' },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10 },
  cardCompact: { width: '48%', padding: 14, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', right: -8, bottom: -4, backgroundColor: '#f5b301',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  badgeText: { color: '#5b3a00', fontWeight: '800', fontSize: 12 },
  rowText: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 16, fontWeight: '800', color: INK },
  itemDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },

  compactTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconCircleSm: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  qtyPill: { backgroundColor: BLUE_SOFT, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  qtyPillText: { color: BLUE, fontWeight: '800' },

  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },

  // Panel inferior
  panel: {
    position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'white',
    borderRadius: 28, padding: 20, alignItems: 'center', ...SHADOW, shadowOpacity: 0.22,
  },
  panelClose: {
    position: 'absolute', top: 12, right: 14, width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center',
  },
  panelIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  panelName: { fontSize: 24, fontWeight: '800', color: BLUE, marginTop: 14 },
  panelDesc: { fontSize: 14, color: '#475569', marginTop: 4, textAlign: 'center' },
  panelHint: { marginTop: 14, color: '#64748b', fontWeight: '600' },
  useBtn: {
    marginTop: 14, backgroundColor: BLUE, paddingVertical: 14, borderRadius: 14,
    alignSelf: 'stretch', alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#073a75',
  },
  useBtnText: { color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
});