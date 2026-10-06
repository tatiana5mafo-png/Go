import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  LayoutChangeEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import {
  MyPokemon,
  PokedexEntry,
  PokemonMove,
  fetchMoves,
  fetchMyPokemon,
  fetchPokedex,
} from '../services/pokedexApi';
import { computeCp } from '../utils/cp';

/* ───────────────────────── utilidades ───────────────────────── */

type Tab = 'all' | 'mine';
type SortKey = 'dex' | 'name' | 'recent' | 'iv' | 'cp';

const SORTS: Record<Tab, { key: SortKey; label: string }[]> = {
  all: [
    { key: 'dex', label: 'N.º Pokédex' },
    { key: 'name', label: 'Nombre' },
  ],
  mine: [
    { key: 'recent', label: 'Más recientes' },
    { key: 'recent', label: 'Más recientes' },
    { key: 'iv', label: 'IV más alto' },
    { key: 'name', label: 'Nombre' },
    { key: 'dex', label: 'N.º Pokédex' },
  ],
};

// Colores por tipo (inglés y español). Si un nombre no coincide, usa azul.
const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130', fuego: '#EE8130',
  water: '#6390F0', agua: '#6390F0',
  electric: '#F7B52C', electrico: '#F7B52C',
  grass: '#7AC74C', planta: '#7AC74C',
  ice: '#96D9D6', hielo: '#96D9D6',
  fighting: '#C22E28', lucha: '#C22E28',
  poison: '#A33EA1', veneno: '#A33EA1',
  ground: '#E2BF65', tierra: '#E2BF65',
  flying: '#A98FF3', volador: '#A98FF3',
  psychic: '#F95587', psiquico: '#F95587',
  bug: '#A6B91A', bicho: '#A6B91A',
  rock: '#B6A136', roca: '#B6A136',
  ghost: '#735797', fantasma: '#735797',
  dragon: '#6F35FC',
  dark: '#705746', siniestro: '#705746',
  steel: '#B7B7CE', acero: '#B7B7CE',
  fairy: '#D685AD', hada: '#D685AD',
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const typeColor = (t?: string) => (t ? TYPE_COLORS[norm(t)] : undefined) ?? '#3b82f6';

// IV máximo posible: 15 + 15 + 15 = 45
const ivPercent = (p: MyPokemon) => Math.round(((p.ivHp + p.ivAttack + p.ivDefense) / 45) * 100);

const pad = (n: number) => String(n).padStart(3, '0');

interface Row {
  key: string;
  dexNumber: number;
  name: string;
  spriteUrl: string | null;
  types: string[];
  captured: boolean;
  copies: number;
  ivPct?: number;
  cp?: number;
  capturedAt?: string;
}

const H_PAD = 16;
const GAP = 10;

const HERO_SPOTS = [
  { right: 10, bottom: 6, size: 88 },
  { right: 100, bottom: 4, size: 74 },
  { right: 130, bottom: 78, size: 58 },
];

/* ───────────────────────── animaciones ───────────────────────── */

/** Flota suavemente de arriba a abajo en bucle. */
function Floating({
  children,
  delay = 0,
  amplitude = 8,
  duration = 1600,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  amplitude?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay, duration]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitude] });

  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Aparece con fundido y escala; escalonado para las primeras tarjetas. */
function Appear({
  index,
  children,
  style,
}: {
  index: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 350,
      delay: Math.min(index, 11) * 45,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, index]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return <Animated.View style={[style, { opacity: v, transform: [{ scale }] }]}>{children}</Animated.View>;
}

/** Barra que se llena al aparecer. */
function AnimatedBar({ ratio, color, delay = 0 }: { ratio: number; color: string; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: Math.max(0, Math.min(1, ratio)),
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // el ancho no se puede animar con driver nativo
    }).start();
  }, [v, ratio, delay]);

  const width = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={s.barBg}>
      <Animated.View style={[s.barFill, { backgroundColor: color, width }]} />
    </View>
  );
}

/* ───────────────────────── detalle ───────────────────────── */

function BarRow({
  label,
  text,
  ratio,
  color,
  delay,
}: {
  label: string;
  text: string;
  ratio: number;
  color: string;
  delay: number;
}) {
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel}>{label}</Text>
      <View style={{ flex: 1 }}>
        <AnimatedBar ratio={ratio} color={color} delay={delay} />
      </View>
      <Text style={s.barValue}>{text}</Text>
    </View>
  );
}

function Detail({
  entry,
  instances,
  moves,
  onClose,
}: {
  entry: PokedexEntry;
  instances: MyPokemon[];
  moves: PokemonMove[];
  onClose: () => void;
}) {
  const color = typeColor(entry.types[0]);

  return (
    <ScrollView style={{ backgroundColor: '#f1f5fd' }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.detailHead, { backgroundColor: color }]}>
        <Pressable style={s.closeX} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <View style={s.detailBubble}>
          <Floating amplitude={10} duration={1500}>
            {entry.spriteUrl ? (
              <Image source={{ uri: entry.spriteUrl }} style={s.detailSprite} resizeMode="contain" />
            ) : null}
          </Floating>
        </View>
        <Text style={s.detailNum}>#{pad(entry.dexNumber)}</Text>
        <Text style={s.detailName}>{entry.name}</Text>
        <View style={s.typeRowCenter}>
          {entry.types.map((t) => (
            <Text key={t} style={s.detailTypeChip}>
              {t}
            </Text>
          ))}
        </View>
      </View>

      <View style={s.detailBody}>
        <Text style={s.section}>Stats base</Text>
        <View style={s.panel}>
          <BarRow label="HP" text={String(entry.baseHp)} ratio={entry.baseHp / 255} color={color} delay={0} />
          <BarRow label="Ataque" text={String(entry.baseAttack)} ratio={entry.baseAttack / 255} color={color} delay={100} />
          <BarRow label="Defensa" text={String(entry.baseDefense)} ratio={entry.baseDefense / 255} color={color} delay={200} />
          <Text style={s.small}>Catch rate base: {entry.baseCatchRate}</Text>
        </View>

        <Text style={s.section}>Tus capturas ({instances.length})</Text>
        {instances.length === 0 && (
          <View style={s.panel}>
            <Text style={s.line}>Aún no has capturado este Pokémon.</Text>
          </View>
        )}
        {instances.map((i) => (
          <View key={i.id} style={s.panel}>
            <Text style={s.instanceTitle}>Calidad IV: {ivPercent(i)}%</Text>
            <BarRow label="HP" text={`${i.ivHp}/15`} ratio={i.ivHp / 15} color="#0b4f9c" delay={0} />
            <BarRow label="Ataque" text={`${i.ivAttack}/15`} ratio={i.ivAttack / 15} color="#0b4f9c" delay={100} />
            <BarRow label="Defensa" text={`${i.ivDefense}/15`} ratio={i.ivDefense / 15} color="#0b4f9c" delay={200} />
            <Text style={s.small}>Capturado: {new Date(i.capturedAt).toLocaleString()}</Text>
          </View>
        ))}

        <Text style={s.section}>Movimientos</Text>
        <View style={s.panel}>
          {moves.length === 0 && <Text style={s.line}>Sin movimientos registrados.</Text>}
          {moves.map((m) => (
            <View key={m.id} style={s.moveRow}>
              <Text style={s.moveName}>{m.name}</Text>
              <Text style={s.moveMeta}>
                {m.kind}
                {m.type ? ` · ${m.type}` : ''}
                {m.power != null ? ` · poder ${m.power}` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/* ───────────────────────── pantalla ───────────────────────── */

export default function PokedexScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - GAP * 2) / 3;

  const [entries, setEntries] = useState<PokedexEntry[]>([]);
  const [mine, setMine] = useState<MyPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortIdx, setSortIdx] = useState(0);

  const [selectedDex, setSelectedDex] = useState<number | null>(null);
  const [moves, setMoves] = useState<PokemonMove[]>([]);

  // Selector deslizante de pestañas
  const [segW, setSegW] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([fetchPokedex(), fetchMyPokemon()])
      .then(([all, owned]) => {
        setEntries(all);
        setMine(owned);
      })
      .catch((e) => setError(e.message ?? 'Error cargando la Pokédex'))
      .finally(() => setLoading(false));
  }, []);

  const entryByDex = useMemo(() => new Map(entries.map((e) => [e.dexNumber, e])), [entries]);

  const copiesMap = useMemo(() => {
    const m = new Map<number, number>();
    mine.forEach((p) => m.set(p.dexNumber, (m.get(p.dexNumber) ?? 0) + 1));
    return m;
  }, [mine]);

  // Filas base de la pestaña actual
  const baseRows: Row[] = useMemo(() => {
    if (tab === 'all') {
      return entries.map((e) => {
        const copies = copiesMap.get(e.dexNumber) ?? 0;
        return {
          key: `e${e.dexNumber}`,
          dexNumber: e.dexNumber,
          name: e.name,
          spriteUrl: e.spriteUrl,
          types: e.types,
          captured: copies > 0,
          copies,
        };
      });
    }
    return mine.map((p) => ({
      key: p.id,
      dexNumber: p.dexNumber,
      name: p.name,
      spriteUrl: p.spriteUrl,
      types: p.types,
      captured: true,
      copies: 1,
      ivPct: ivPercent(p),
      cp: computeCp(p, p),
      capturedAt: p.capturedAt,
    }));
  }, [tab, entries, mine, copiesMap]);

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>();
    baseRows.forEach((r) => r.types.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [baseRows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = baseRows.filter((r) => {
      if (typeFilter && !r.types.includes(typeFilter)) return false;
      if (q && !r.name.toLowerCase().includes(q) && String(r.dexNumber) !== q) return false;
      return true;
    });
    const sort = SORTS[tab][sortIdx].key;
    return [...list].sort((a, b) => {
      if (sort === 'cp') return (b.cp ?? 0) - (a.cp ?? 0);
      if (sort === 'iv') return (b.ivPct ?? 0) - (a.ivPct ?? 0);
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'recent') return (b.capturedAt ?? '').localeCompare(a.capturedAt ?? '');
      return a.dexNumber - b.dexNumber;
    });
  }, [baseRows, query, typeFilter, sortIdx, tab]);

  const registered = copiesMap.size;
  const total = entries.length;
  const pct = total > 0 ? Math.round((registered / total) * 100) : 0;

  // Pokémon que flotan en el banner
  const heroSprites = useMemo(() => {
    const picks = [150, 6, 25]
      .map((n) => entryByDex.get(n))
      .filter((e): e is PokedexEntry => !!e && !!e.spriteUrl);
    return picks.length ? picks : entries.filter((e) => !!e.spriteUrl).slice(0, 3);
  }, [entryByDex, entries]);

  const changeTab = useCallback(
    (t: Tab) => {
      setTab(t);
      setTypeFilter(null);
      setSortIdx(0);
      Animated.spring(slide, {
        toValue: t === 'all' ? 0 : 1,
        friction: 8,
        useNativeDriver: true,
      }).start();
    },
    [slide]
  );

  const openDetail = useCallback(async (dex: number) => {
    setSelectedDex(dex);
    setMoves([]);
    try {
      setMoves(await fetchMoves(dex));
    } catch {
      // el detalle se muestra igual sin movimientos
    }
  }, []);

  const selectedEntry = selectedDex != null ? entryByDex.get(selectedDex) ?? null : null;
  const selectedInstances = useMemo(
    () => (selectedDex != null ? mine.filter((p) => p.dexNumber === selectedDex) : []),
    [mine, selectedDex]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Row; index: number }) => {
      const tint = typeColor(item.types[0]);
      const dim = !item.captured;
      return (
        <Appear index={index} style={{ width: cardWidth }}>
          <Pressable
            onPress={() => openDetail(item.dexNumber)}
            style={({ pressed }) => [s.card, pressed && s.cardPressed]}
          >
            <View style={s.cardTop}>
              <Text style={s.cardNum}>#{pad(item.dexNumber)}</Text>
              {item.ivPct != null ? (
                <Text style={s.iv}>IV {item.ivPct}%</Text>
              ) : item.captured ? (
                <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              ) : null}
            </View>

            <View style={[s.bubble, { backgroundColor: tint + '22' }]}>
              {item.spriteUrl ? (
                <Image
                  source={{ uri: item.spriteUrl }}
                  style={[s.sprite, dim && s.silhouette]}
                  resizeMode="contain"
                />
              ) : null}
              {tab === 'all' && item.copies > 1 && (
                <View style={s.copies}>
                  <Text style={s.copiesText}>x{item.copies}</Text>
                </View>
              )}
            </View>

            <Text style={[s.cardName, dim && { color: '#64748b' }]} numberOfLines={1}>
              {item.name}
              
            </Text>
                        {item.cp != null && <Text style={s.cp}>CP {item.cp}</Text>}
            <View style={s.typeRow}>
              {item.types.map((t) => (
                <Text key={t} style={[s.typeChip, { backgroundColor: typeColor(t) }]}>
                  {t}
                </Text>
              ))}
            </View>
          </Pressable>
        </Appear>
      );
    },
    [cardWidth, openDetail, tab]
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0b4f9c" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.err}>{error}</Text>
      </View>
    );
  }

  const segItemW = Math.max(0, (segW - 8) / 2);
  const indicatorX = slide.interpolate({ inputRange: [0, 1], outputRange: [0, segItemW] });

  const header = (
    <View>
      {/* Banner animado */}
      <View style={s.hero}>
        <View style={s.circleBig} />
        <View style={s.circleSmall} />

        <View style={s.heroPill}>
          <Ionicons name="sparkles" size={14} color="#0b4f9c" />
          <Text style={s.heroPillText}>
            {registered}/{total}
          </Text>
        </View>

        {heroSprites.map((e, i) => {
          const spot = HERO_SPOTS[i];
          return (
            <Floating
              key={e.dexNumber}
              delay={i * 350}
              amplitude={6 + i * 2}
              duration={1400 + i * 250}
              style={{ position: 'absolute', right: spot.right, bottom: spot.bottom }}
            >
              <Image
                source={{ uri: e.spriteUrl as string }}
                style={{ width: spot.size, height: spot.size }}
                resizeMode="contain"
              />
            </Floating>
          );
        })}

        <Text style={s.heroSmall}>KANTO · UNISABANA</Text>
        <Text style={s.heroTitle}>Pokédex</Text>
      </View>

      {/* Pestañas */}
      <View style={s.seg} onLayout={(e: LayoutChangeEvent) => setSegW(e.nativeEvent.layout.width)}>
        {segW > 0 && (
          <Animated.View
            style={[s.segIndicator, { width: segItemW, transform: [{ translateX: indicatorX }] }]}
          />
        )}
        <Pressable style={s.segItem} onPress={() => changeTab('all')}>
          <Text style={[s.segText, tab === 'all' && s.segTextOn]}>Todos {total}</Text>
        </Pressable>
        <Pressable style={s.segItem} onPress={() => changeTab('mine')}>
          <Text style={[s.segText, tab === 'mine' && s.segTextOn]}>Mis Pokémon {mine.length}</Text>
        </Pressable>
      </View>

      {/* Búsqueda y orden */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color="#0b4f9c" />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar por nombre o número"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <Pressable
          style={s.sortBtn}
          onPress={() => setSortIdx((i) => (i + 1) % SORTS[tab].length)}
        >
          <Ionicons name="swap-vertical" size={16} color="#0b4f9c" />
          <Text style={s.sortText}>{SORTS[tab][sortIdx].label}</Text>
        </Pressable>
      </View>

      {/* Filtro por tipo */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll}>
        <Pressable onPress={() => setTypeFilter(null)} style={[s.chip, !typeFilter && s.chipOn]}>
          <Text style={[s.chipText, !typeFilter && s.chipTextOn]}>Todos {baseRows.length}</Text>
        </Pressable>
        {typeCounts.map(([t, n]) => {
          const on = typeFilter === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(on ? null : t)}
              style={[s.chip, on && { backgroundColor: typeColor(t) }]}
            >
              <View style={[s.chipDot, { backgroundColor: on ? '#fff' : typeColor(t) }]} />
              <Text style={[s.chipText, on && s.chipTextOn]}>
                {t} {n}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const footer = (
    <View style={s.progressCard}>
      <View style={s.progressTop}>
        <Ionicons name="trophy-outline" size={26} color="#0b4f9c" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.progressTitle}>Pokédex Kanto UniSabana</Text>
          <Text style={s.progressSub}>
            {registered} de {total} registradas en el campus
          </Text>
        </View>
        <Text style={s.progressPct}>{pct}%</Text>
      </View>
      <View style={{ marginTop: 12 }}>
        <AnimatedBar ratio={pct / 100} color="#0b4f9c" delay={200} />
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <FlatList
        data={visible}
        keyExtractor={(r) => r.key}
        numColumns={3}
        renderItem={renderItem}
        columnWrapperStyle={s.columnWrap}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={
          <Text style={s.empty}>
            {tab === 'mine' && mine.length === 0
              ? 'Aún no has capturado ningún Pokémon.'
              : 'Sin resultados para ese filtro.'}
          </Text>
        }
        initialNumToRender={12}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />

      <Modal
        visible={!!selectedEntry}
        animationType="slide"
        onRequestClose={() => setSelectedDex(null)}
      >
        {selectedEntry && (
          <Detail
            entry={selectedEntry}
            instances={selectedInstances}
            moves={moves}
            onClose={() => setSelectedDex(null)}
          />
        )}
      </Modal>
    </View>
  );
}

/* ───────────────────────── estilos ───────────────────────── */

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5fd' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5fd' },
  err: { color: '#c00', padding: 24, textAlign: 'center' },
  listContent: { paddingTop: 56, paddingHorizontal: H_PAD, paddingBottom: 24 },
  columnWrap: { gap: GAP, marginBottom: GAP },

  // Banner
  hero: {
    backgroundColor: '#0b4f9c',
    borderRadius: 28,
    height: 180,
    padding: 18,
    justifyContent: 'flex-end',
    marginBottom: 14,
    overflow: 'hidden',
  },
  circleBig: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleSmall: {
    position: 'absolute',
    left: -30,
    top: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(252,211,77,0.15)',
  },
  heroPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroPillText: { color: '#0b4f9c', fontWeight: '800', fontSize: 13 },
  heroSmall: { color: '#fcd34d', fontWeight: '800', fontSize: 11, letterSpacing: 1.2 },
  heroTitle: { color: 'white', fontWeight: '800', fontSize: 34 },

  // Pestañas
  seg: {
    flexDirection: 'row',
    backgroundColor: '#dbe7fb',
    borderRadius: 22,
    padding: 4,
    marginBottom: 12,
  },
  segIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    backgroundColor: 'white',
    borderRadius: 18,
    shadowColor: '#0b4f9c',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 11 },
  segText: { fontWeight: '800', color: '#64748b', fontSize: 14 },
  segTextOn: { color: '#0b4f9c' },

  // Búsqueda
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 44,
  },
  sortText: { color: '#0b4f9c', fontWeight: '700', fontSize: 12 },

  // Chips de tipo
  chipsScroll: { marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: 'white',
    marginRight: 8,
  },
  chipOn: { backgroundColor: '#0b4f9c' },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipText: { color: '#334155', fontWeight: '700', fontSize: 13, textTransform: 'capitalize' },
  chipTextOn: { color: 'white' },

  // Tarjetas
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#0b4f9c',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardPressed: { transform: [{ scale: 0.96 }] },
  cardTop: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  cardNum: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
  iv: { fontSize: 11, fontWeight: '800', color: '#0b4f9c' },
  cp: { fontSize: 12, fontWeight: '800', color: '#b45309', marginTop: 3 },
  bubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  sprite: { width: 60, height: 60 },
  silhouette: { tintColor: '#0f172a', opacity: 0.28 },
  copies: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    backgroundColor: '#0b4f9c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  copiesText: { color: 'white', fontSize: 10, fontWeight: '800' },
  cardName: { fontSize: 13, fontWeight: '800', color: '#0f172a', textTransform: 'capitalize' },
  typeRow: { flexDirection: 'row', gap: 4, marginTop: 5, flexWrap: 'wrap', justifyContent: 'center' },
  typeChip: {
    fontSize: 9,
    fontWeight: '800',
    color: 'white',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  empty: { textAlign: 'center', marginTop: 40, marginBottom: 20, color: '#64748b' },

  // Progreso
  progressCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginTop: 6 },
  progressTop: { flexDirection: 'row', alignItems: 'center' },
  progressTitle: { fontWeight: '800', color: '#0f172a', fontSize: 14 },
  progressSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  progressPct: { color: '#0b4f9c', fontWeight: '800', fontSize: 16 },

  // Barras
  barBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  barLabel: { width: 64, fontWeight: '700', color: '#334155', fontSize: 13 },
  barValue: { width: 44, textAlign: 'right', fontWeight: '800', color: '#0f172a', fontSize: 13 },

  // Detalle
  detailHead: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  closeX: {
    position: 'absolute',
    top: 54,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  detailBubble: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailSprite: { width: 150, height: 150 },
  detailNum: { color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  detailName: { color: 'white', fontSize: 30, fontWeight: '800', textTransform: 'capitalize' },
  typeRowCenter: { flexDirection: 'row', gap: 8, marginTop: 8 },
  detailTypeChip: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.22)',
    fontWeight: '800',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  detailBody: { paddingHorizontal: 18 },
  section: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 20, marginBottom: 8 },
  panel: { backgroundColor: 'white', borderRadius: 20, padding: 14, marginBottom: 8 },
  instanceTitle: { fontWeight: '800', color: '#0b4f9c', marginBottom: 4 },
  line: { fontSize: 15, color: '#334155' },
  small: { fontSize: 12, color: '#64748b', marginTop: 8 },
  moveRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  moveName: { fontWeight: '800', color: '#0f172a', textTransform: 'capitalize' },
  moveMeta: { color: '#64748b', fontSize: 12, marginTop: 2 },
});