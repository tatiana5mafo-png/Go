import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Easing, FlatList, Image, PanResponder, Pressable,
  StyleSheet, Text, View,
} from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
import { useBattle } from '../hooks/useBattle';
import { battleApi } from '../services/battleApi';
import { MyPokemon, fetchMyPokemon } from '../services/pokedexApi';
import { supabase } from '../services/supabase';
import { Coordinate } from '../types';
import { computeCp, ivPerfection } from '../utils/cp';

interface Props {
  gymId: string;
  gymName: string;
  position: Coordinate;
  onClose: () => void;
}

interface Opponent { dex_number: number; name: string; sprite_url: string | null }
interface Pop { id: number; value: string; color: string; side: 'me' | 'opp' }
interface Msg { id: number; text: string; color: string }
interface ShotFx { id: number; from: 'me' | 'opp'; color: string }
type Intro = 'idle' | 'vs' | 'fight' | 'done';

const ATTACK_COOLDOWN_MS = 1000; // el servidor lo hace cumplir; aquí solo se ve
const DODGE_COOLDOWN_MS = 3000;
const SWIPE_PX = 50;
const ME_SIZE = 200;
const OPP_SIZE = 150;

const JOIN_ERRORS: Record<string, string> = {
  gym_not_found: 'Ese gimnasio no existe.',
  too_far: 'Estás demasiado lejos del gimnasio.',
  not_yours: 'Ese Pokémon no es tuyo.',
  already_in_battle: 'Ya estás en un combate.',
  outside: 'Solo se juega dentro del campus.',
  error: 'Error de conexión con el servidor.',
};

const shakeSeq = (v: Animated.Value, amp = 1) =>
  Animated.sequence(
    [1, -1, 0.7, -0.7, 0.4, 0].map((t) =>
      Animated.timing(v, { toValue: t * amp, duration: 50, useNativeDriver: true }),
    ),
  );

/* ───────────── Barra de vida con estela ───────────── */
const HpBar = memo(function HpBar({ hp, max }: { hp: number; max: number }) {
  const ratio = Math.max(0, Math.min(1, hp / Math.max(1, max)));
  const main = useRef(new Animated.Value(ratio)).current;
  const ghost = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(main, { toValue: ratio, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(ghost, { toValue: ratio, duration: 600, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [main, ghost, ratio]);
  const pct = (v: Animated.Value) => v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={s.hpTrack}>
      <Animated.View style={[s.hpGhost, { width: pct(ghost) }]} />
      <Animated.View
        style={[s.hpFill, {
          width: pct(main),
          backgroundColor: main.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: ['#ef4444', '#ef4444', '#facc15', '#22c55e'] }),
        }]}
      />
      <View style={s.hpShine} />
    </View>
  );
});

/* ───────────── Efectos ───────────── */
const DamagePop = memo(function DamagePop({ pop }: { pop: Pop }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 950, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={[s.pop, { color: pop.color }, pop.side === 'opp' ? s.popOpp : s.popMe, {
        opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) },
          { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.4, 1] }) },
        ],
      }]}
    >
      {pop.value}
    </Animated.Text>
  );
});

const Banner = memo(function Banner({ msg }: { msg: Msg }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(v, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(v, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.banner, { backgroundColor: msg.color, opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]}
    >
      <Text style={s.bannerText}>{msg.text}</Text>
    </Animated.View>
  );
});

/** Esfera que viaja de un Pokémon al otro y estalla en una onda al llegar. */
const Shot = memo(function Shot({
  from, to, color, onDone,
}: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; onDone: () => void }) {
  const p = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(ring, { toValue: 1, duration: 330, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]);
    a.start(() => onDone());
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const orb = (k: number, size: number, op: number) => (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: from.x - size / 2, top: from.y - size / 2, width: size, height: size,
        borderRadius: size / 2, backgroundColor: color, shadowColor: color, shadowOpacity: 1, shadowRadius: 12,
        opacity: p.interpolate({ inputRange: [0, 0.97, 1], outputRange: [op, op, 0] }),
        transform: [
          { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, dx * k] }) },
          { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, dy * k] }) },
        ],
      }}
    />
  );
  return (
    <>
      {orb(0.7, 12, 0.35)}
      {orb(0.85, 16, 0.6)}
      {orb(1, 24, 1)}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', left: to.x - 60, top: to.y - 60, width: 120, height: 120, borderRadius: 60,
          borderWidth: 6, borderColor: color,
          opacity: ring.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 1, 0] }),
          transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.5] }) }],
        }}
      />
    </>
  );
});

/** Sprite con sombra, flotación, temblor, destello y desplazamiento lateral (esquiva). */
const Fighter = memo(function Fighter({
  uri, size, shake, flash, slide, delay,
}: {
  uri: string | null; size: number; shake: Animated.Value; flash: Animated.Value;
  slide: Animated.Value; delay: number;
}) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(bob, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [bob, delay]);
  return (
    <Animated.View style={{
      width: size, height: size,
      transform: [
        { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -9] }) },
        { translateX: Animated.add(shake.interpolate({ inputRange: [-1, 1], outputRange: [-16, 16] }), slide) },
      ],
    }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" /> : null}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.hitFlash, { opacity: flash }]} />
    </Animated.View>
  );
});

/** Confeti de victoria. */
const Confetti = memo(function Confetti() {
  const colors = ['#facc15', '#38bdf8', '#f87171', '#4ade80', '#ffffff'];
  const pieces = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      v: new Animated.Value(0),
      x: ((i * 53 + 7) % 100) / 100,
      color: colors[i % colors.length],
      dur: 1800 + ((i * 197) % 1400),
      delay: (i * 60) % 600,
      spin: 360 + (i % 5) * 180,
    })),
  ).current;
  useEffect(() => {
    const anims = pieces.map((p) => Animated.sequence([
      Animated.delay(p.delay),
      Animated.timing(p.v, { toValue: 1, duration: p.dur, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: `${p.x * 100}%`, top: -20, width: 9, height: 15, borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, 900] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
});

const WaitingPulse = memo(function WaitingPulse() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [v]);
  return (
    <Animated.View pointerEvents="none" style={[s.pulse, {
      opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] }) }],
    }]} />
  );
});

/** Botón de acción con barra de recarga. */
const ActionBtn = memo(function ActionBtn({
  icon, label, color, big, cooldown, disabled, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap; label: string; color: string; big?: boolean;
  cooldown: Animated.Value; disabled: boolean; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.actBtn, big && s.actBig, { backgroundColor: color }, disabled && { opacity: 0.55 }, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      <Ionicons name={icon} size={big ? 34 : 26} color="white" />
      <Text style={[s.actLabel, big && { fontSize: 15 }]}>{label}</Text>
      <View style={s.cdTrack}>
        <Animated.View style={[s.cdFill, { width: cooldown.interpolate({ inputRange: [0, 1], outputRange: ['100%', '0%'] }) }]} />
      </View>
    </Pressable>
  );
});

export default function BattleScreen({ gymId, gymName, position, onClose }: Props) {
  const [mine, setMine] = useState<MyPokemon[] | null>(null);
  const [chosen, setChosen] = useState<MyPokemon | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opp, setOpp] = useState<Opponent | null>(null);
  const [intro, setIntro] = useState<Intro>('idle');
  const [arena, setArena] = useState({ w: 0, h: 0 });

  const { view, fx, act, userId } = useBattle(battleId);

  const [pops, setPops] = useState<Pop[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [shots, setShots] = useState<ShotFx[]>([]);
  const [combo, setCombo] = useState(0);
  const lastAttack = useRef(0);
  const dodgeReadyAt = useRef(0);
  const counter = useRef(0);
  const mounted = useRef(true);

  const myShake = useRef(new Animated.Value(0)).current;
  const oppShake = useRef(new Animated.Value(0)).current;
  const myFlash = useRef(new Animated.Value(0)).current;
  const oppFlash = useRef(new Animated.Value(0)).current;
  const mySlide = useRef(new Animated.Value(0)).current;
  const screenShake = useRef(new Animated.Value(0)).current;
  const atkCd = useRef(new Animated.Value(1)).current;
  const dodgeCd = useRef(new Animated.Value(1)).current;
  const introLeft = useRef(new Animated.Value(0)).current;
  const introRight = useRef(new Animated.Value(0)).current;
  const introVs = useRef(new Animated.Value(0)).current;
  const introFight = useRef(new Animated.Value(0)).current;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    fetchMyPokemon().then((r) => mounted.current && setMine(r)).catch(() => mounted.current && setMine([]));
  }, []);

  // Rival: la función del servidor solo responde a los participantes
  useEffect(() => {
    if (!battleId || view?.status !== 'active' || opp) return;
    supabase.rpc('battle_opponent', { p_battle: battleId }).then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (mounted.current && row) setOpp(row as Opponent);
    });
  }, [battleId, view?.status, opp]);

  // Presentación del duelo: VS y ¡PELEA!
  useEffect(() => {
    if (view?.status !== 'active' || intro !== 'idle') return;
    setIntro('vs');
    const seq = Animated.sequence([
      Animated.parallel([
        Animated.timing(introLeft, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(introRight, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
      ]),
      Animated.spring(introVs, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(700),
    ]);
    seq.start(() => {
      if (!mounted.current) return;
      setIntro('fight');
      Animated.sequence([
        Animated.spring(introFight, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.delay(450),
      ]).start(() => mounted.current && setIntro('done'));
    });
    return () => seq.stop();
  }, [view?.status, intro, introLeft, introRight, introVs, introFight]);

  // Si entras a un combate ya terminado, no hay presentación
  useEffect(() => {
    if (view?.status === 'finished' && intro !== 'done') setIntro('done');
  }, [view?.status, intro]);

  const spot = useCallback(
    (who: 'me' | 'opp') => (who === 'me'
      ? { x: arena.w * 0.27, y: arena.h * 0.68 }
      : { x: arena.w * 0.73, y: arena.h * 0.27 }),
    [arena],
  );

  const hit = useCallback((who: 'me' | 'opp', big: boolean) => {
    const shake = who === 'me' ? myShake : oppShake;
    const flash = who === 'me' ? myFlash : oppFlash;
    Animated.parallel([
      shakeSeq(shake),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.75, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
      shakeSeq(screenShake, big ? 0.6 : 0.25),
    ]).start();
  }, [myShake, oppShake, myFlash, oppFlash, screenShake]);

  const addPop = useCallback((side: 'me' | 'opp', value: string, color: string) => {
    const id = ++counter.current;
    setPops((p) => [...p.slice(-4), { id, value, color, side }]);
    setTimeout(() => mounted.current && setPops((p) => p.filter((x) => x.id !== id)), 1000);
  }, []);

  const say = useCallback((text: string, color: string) => setMsg({ id: ++counter.current, text, color }), []);

  const fire = useCallback((from: 'me' | 'opp', color: string) => {
    const id = ++counter.current;
    setShots((a) => [...a.slice(-3), { id, from, color }]);
  }, []);
  const endShot = useCallback((id: number) => setShots((a) => a.filter((x) => x.id !== id)), []);

  const typeText = (mult: number) =>
    mult === 0 ? { t: 'No afecta', c: '#9ca3af' }
    : mult > 1 ? { t: '¡SÚPER EFECTIVO!', c: '#f59e0b' }
    : mult < 1 ? { t: 'Poco efectivo', c: '#94a3b8' }
    : null;

  // Lo que hace el rival (solo animación; la vida llega por Postgres Changes)
  useEffect(() => {
    if (!fx || fx.from === userId) return;
    if (fx.kind === 'attack') {
      fire('opp', '#f87171');
      setTimeout(() => {
        if (!mounted.current) return;
        hit('me', Number(fx.multiplier) > 1);
        addPop('me', `-${fx.damage ?? 0}`, '#f87171');
        setCombo(0);
      }, 240);
    } else {
      say('El rival esquiva', '#38bdf8');
    }
  }, [fx, userId, hit, addPop, say, fire]);

  const attack = useCallback(async () => {
    const now = Date.now();
    if (intro !== 'done' || now - lastAttack.current < ATTACK_COOLDOWN_MS) return;
    lastAttack.current = now;
    atkCd.setValue(0);
    Animated.timing(atkCd, { toValue: 1, duration: ATTACK_COOLDOWN_MS, easing: Easing.linear, useNativeDriver: false }).start();
    const res = await act('attack');
    if (!mounted.current || !res.ok || res.action !== 'attack') return;
    fire('me', '#fde047');
    setTimeout(() => {
      if (!mounted.current) return;
      const mult = Number(res.multiplier);
      hit('opp', mult > 1);
      addPop('opp', res.damage > 0 ? `-${res.damage}` : '0', res.dodged ? '#38bdf8' : '#fde047');
      setCombo((c) => c + 1);
      const tt = typeText(mult);
      if (res.dodged) say('¡Esquivado a medias!', '#38bdf8');
      else if (tt) say(tt.t, tt.c);
    }, 240);
  }, [act, hit, addPop, say, fire, intro, atkCd]);

  const dodge = useCallback(async (dir: 1 | -1) => {
    const now = Date.now();
    if (intro !== 'done' || now < dodgeReadyAt.current) return;
    dodgeReadyAt.current = now + DODGE_COOLDOWN_MS;
    dodgeCd.setValue(0);
    Animated.timing(dodgeCd, { toValue: 1, duration: DODGE_COOLDOWN_MS, easing: Easing.linear, useNativeDriver: false }).start();
    Animated.sequence([
      Animated.timing(mySlide, { toValue: 70 * dir, duration: 140, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(mySlide, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
    const res = await act('dodge');
    if (res.ok) say('¡Esquiva!', '#38bdf8');
  }, [act, say, intro, dodgeCd, mySlide]);

  // El PanResponder se crea una vez y usa siempre la última versión de los manejadores
  const handlers = useRef({ attack, dodge });
  handlers.current = { attack, dodge };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > SWIPE_PX && Math.abs(g.dx) > Math.abs(g.dy)) handlers.current.dodge(g.dx > 0 ? 1 : -1);
      else handlers.current.attack();
    },
  })).current;

  const choose = useCallback(async (p: MyPokemon) => {
    setChosen(p); setJoining(true); setError(null);
    const res = await battleApi.join(gymId, p.id, position);
    if (!mounted.current) return;
    setJoining(false);
    if (res.ok) setBattleId(res.battleId);
    else if (res.reason === 'already_in_battle' && res.battleId) setBattleId(res.battleId);
    else setError(JOIN_ERRORS[res.reason] ?? 'Error');
  }, [gymId, position]);

  const myPoke = useMemo(
    () => mine?.find((m) => m.id === view?.myPokemonId) ?? chosen,
    [mine, view?.myPokemonId, chosen],
  );
  const sortedMine = useMemo(
    () => (mine ? [...mine].sort((a, b) => computeCp(b, b) - computeCp(a, a)) : []),
    [mine],
  );

  /* ─────────── 1. Elegir Pokémon ─────────── */
  if (!battleId) {
    return (
      <View style={s.root}>
        <View style={s.pickHead}>
          <Pressable onPress={onClose} style={s.backBtn} hitSlop={10}><Ionicons name="close" size={22} color="white" /></Pressable>
          <Text style={s.kicker}>GIMNASIO</Text>
          <Text style={s.pickTitle} numberOfLines={1}>{gymName}</Text>
          <Text style={s.pickSub}>Elige a tu luchador</Text>
        </View>
        {error && <Text style={s.error}>{error}</Text>}
        {mine === null ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : mine.length === 0 ? (
          <Text style={s.empty}>Aún no tienes Pokémon. Captura uno primero.</Text>
        ) : (
          <FlatList
            data={sortedMine}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <Pressable disabled={joining} onPress={() => choose(item)} style={({ pressed }) => [s.pickCard, pressed && { transform: [{ scale: 0.97 }] }]}>
                <View style={s.pickSprite}>
                  {item.spriteUrl ? <Image source={{ uri: item.spriteUrl }} style={{ width: 64, height: 64 }} resizeMode="contain" /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.pickName}>{item.name}</Text>
                  <Text style={s.pickMeta}>IV {ivPerfection(item)}% · PS {(item.baseHp + item.ivHp) * 3}</Text>
                </View>
                <Text style={s.pickCp}>CP {computeCp(item, item)}</Text>
              </Pressable>
            )}
          />
        )}
        {joining && <View style={s.joining}><ActivityIndicator color="white" /><Text style={s.joiningText}>Entrando al gimnasio...</Text></View>}
      </View>
    );
  }

  /* ─────────── 2. Esperando rival ─────────── */
  if (!view || view.status === 'waiting') {
    return (
      <View style={[s.root, s.centerAll]}>
        <WaitingPulse />
        {myPoke?.spriteUrl ? <Image source={{ uri: myPoke.spriteUrl }} style={s.waitSprite} resizeMode="contain" /> : null}
        <Text style={s.waitTitle}>Esperando un rival</Text>
        <Text style={s.waitSub}>Otro entrenador debe entrar a {gymName}.</Text>
        <Pressable style={s.ghostBtn} onPress={onClose}><Text style={s.ghostText}>Salir</Text></Pressable>
      </View>
    );
  }

  /* ─────────── 3. Combate ─────────── */
  const finished = view.status === 'finished';
  const me = spot('me');
  const op = spot('opp');
  const canAct = intro === 'done' && !finished;

  return (
    <View style={s.root}>
      {/* Rival (arriba) */}
      <View style={s.oppPanel}>
        <View style={s.panelRow}>
          <Text style={s.panelName} numberOfLines={1}>{opp?.name ?? 'Rival'}</Text>
          <View style={s.hpBadge}><Text style={s.panelHp}>{view.oppHp}/{view.oppMax}</Text></View>
        </View>
        <HpBar hp={view.oppHp} max={view.oppMax} />
      </View>

      {/* Arena: tocar ataca, deslizar esquiva */}
      <Animated.View
        style={[s.arena, { transform: [{ translateX: screenShake.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) }] }]}
        onLayout={(e) => setArena({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        {...pan.panHandlers}
      >
        {arena.w > 0 && (
          <Svg width={arena.w} height={arena.h} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#050d22" />
                <Stop offset="1" stopColor="#0d3270" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={arena.w} height={arena.h} fill="url(#sky)" />
            <Polygon points={`${arena.w * 0.1},0 ${arena.w * 0.3},0 ${arena.w * 0.55},${arena.h} ${arena.w * 0.15},${arena.h}`} fill="rgba(56,189,248,0.08)" />
            <Polygon points={`${arena.w * 0.7},0 ${arena.w * 0.92},0 ${arena.w * 0.9},${arena.h} ${arena.w * 0.5},${arena.h}`} fill="rgba(250,204,21,0.06)" />
            <Ellipse cx={arena.w / 2} cy={arena.h * 0.52} rx={arena.w * 0.62} ry={arena.h * 0.34} fill="none" stroke="rgba(125,211,252,0.18)" strokeWidth="3" />
            <Ellipse cx={arena.w / 2} cy={arena.h * 0.52} rx={arena.w * 0.44} ry={arena.h * 0.22} fill="none" stroke="rgba(125,211,252,0.12)" strokeWidth="2" />
            <Ellipse cx={op.x} cy={op.y + OPP_SIZE * 0.42} rx={OPP_SIZE * 0.6} ry={OPP_SIZE * 0.17} fill="rgba(56,189,248,0.22)" stroke="rgba(125,211,252,0.6)" strokeWidth="2" />
            <Ellipse cx={me.x} cy={me.y + ME_SIZE * 0.42} rx={ME_SIZE * 0.6} ry={ME_SIZE * 0.17} fill="rgba(250,204,21,0.2)" stroke="rgba(253,224,71,0.6)" strokeWidth="2" />
          </Svg>
        )}

        {arena.w > 0 && (
          <>
            <View style={[s.spot, { left: op.x - OPP_SIZE / 2, top: op.y - OPP_SIZE / 2 }]} pointerEvents="none">
              <Fighter uri={opp?.sprite_url ?? null} size={OPP_SIZE} shake={oppShake} flash={oppFlash} slide={new Animated.Value(0)} delay={0} />
            </View>
            <View style={[s.spot, { left: me.x - ME_SIZE / 2, top: me.y - ME_SIZE / 2 }]} pointerEvents="none">
              <Fighter uri={myPoke?.spriteUrl ?? null} size={ME_SIZE} shake={myShake} flash={myFlash} slide={mySlide} delay={400} />
            </View>
            {shots.map((sh) => (
              <Shot key={sh.id} from={sh.from === 'me' ? me : op} to={sh.from === 'me' ? op : me} color={sh.color} onDone={() => endShot(sh.id)} />
            ))}
          </>
        )}

        {pops.map((p) => <DamagePop key={p.id} pop={p} />)}
        {msg && <Banner key={msg.id} msg={msg} />}
        {combo >= 2 && (
          <View style={s.combo} pointerEvents="none"><Text style={s.comboText}>COMBO x{combo}</Text></View>
        )}
      </Animated.View>

      {/* Mi Pokémon y acciones */}
      <View style={s.mePanel}>
        <View style={s.panelRow}>
          <Text style={s.panelName} numberOfLines={1}>{myPoke?.name ?? 'Tú'}</Text>
          <View style={s.hpBadge}><Text style={s.panelHp}>{view.myHp}/{view.myMax}</Text></View>
        </View>
        <HpBar hp={view.myHp} max={view.myMax} />
      </View>

      <View style={s.actions}>
        <ActionBtn icon="arrow-back" label="Esquivar" color="#0369a1" cooldown={dodgeCd} disabled={!canAct} onPress={() => dodge(-1)} />
        <ActionBtn icon="flash" label="ATACAR" color="#dc2626" big cooldown={atkCd} disabled={!canAct} onPress={attack} />
        <ActionBtn icon="arrow-forward" label="Esquivar" color="#0369a1" cooldown={dodgeCd} disabled={!canAct} onPress={() => dodge(1)} />
      </View>

      {/* Presentación VS */}
      {(intro === 'vs' || intro === 'fight') && (
        <View style={s.introOverlay} pointerEvents="none">
          <Animated.View style={[s.introCard, s.introMe, {
            transform: [{ translateX: introLeft.interpolate({ inputRange: [0, 1], outputRange: [-320, 0] }) }],
          }]}>
            {myPoke?.spriteUrl ? <Image source={{ uri: myPoke.spriteUrl }} style={s.introSprite} resizeMode="contain" /> : null}
            <Text style={s.introName} numberOfLines={1}>{myPoke?.name ?? 'Tú'}</Text>
          </Animated.View>

          <Animated.Text style={[s.vs, { opacity: introVs, transform: [{ scale: introVs.interpolate({ inputRange: [0, 1], outputRange: [3, 1] }) }] }]}>VS</Animated.Text>

          <Animated.View style={[s.introCard, s.introOpp, {
            transform: [{ translateX: introRight.interpolate({ inputRange: [0, 1], outputRange: [320, 0] }) }],
          }]}>
            {opp?.sprite_url ? <Image source={{ uri: opp.sprite_url }} style={s.introSprite} resizeMode="contain" /> : null}
            <Text style={s.introName} numberOfLines={1}>{opp?.name ?? 'Rival'}</Text>
          </Animated.View>

          {intro === 'fight' && (
            <Animated.Text style={[s.fightText, { opacity: introFight, transform: [{ scale: introFight.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }] }]}>
              ¡PELEA!
            </Animated.Text>
          )}
        </View>
      )}

      {/* Resultado */}
      {finished && (
        <View style={s.resultOverlay}>
          {view.won && <Confetti />}
          <Ionicons name={view.won ? 'trophy' : 'sad'} size={96} color={view.won ? '#facc15' : '#94a3b8'} />
          <Text style={[s.resultTitle, { color: view.won ? '#facc15' : '#e5e7eb' }]}>{view.won ? '¡Victoria!' : 'Derrota'}</Text>
          <Text style={s.resultSub}>{view.won ? 'Dejaste sin PS a tu rival.' : 'Tu Pokémon se quedó sin PS.'}</Text>
          <Pressable style={s.btn} onPress={onClose}><Text style={s.btnText}>Volver al mapa</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060f24' },
  centerAll: { alignItems: 'center', justifyContent: 'center', padding: 24 },

  pickHead: { paddingTop: 60, paddingBottom: 18, paddingHorizontal: 20, backgroundColor: '#0b2a5b', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { position: 'absolute', top: 58, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  kicker: { color: '#38bdf8', fontWeight: '800', fontSize: 12, letterSpacing: 3 },
  pickTitle: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 2 },
  pickSub: { color: '#bfdbfe', marginTop: 4, fontWeight: '600' },
  error: { color: '#fca5a5', textAlign: 'center', marginTop: 12, fontWeight: '700' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 40, paddingHorizontal: 30 },
  pickCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  pickSprite: { width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pickName: { color: 'white', fontSize: 18, fontWeight: '800' },
  pickMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2, fontWeight: '600' },
  pickCp: { color: '#fcd34d', fontWeight: '900', fontSize: 18 },
  joining: { position: 'absolute', bottom: 40, alignSelf: 'center', flexDirection: 'row', gap: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  joiningText: { color: 'white', fontWeight: '700' },

  pulse: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#38bdf8' },
  waitSprite: { width: 180, height: 180 },
  waitTitle: { color: 'white', fontSize: 26, fontWeight: '900', marginTop: 10 },
  waitSub: { color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  ghostBtn: { marginTop: 28, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14 },
  ghostText: { color: 'white', fontWeight: '800' },

  oppPanel: { marginTop: 56, marginHorizontal: 14, padding: 12, borderRadius: 18, backgroundColor: 'rgba(11,42,91,0.92)', borderWidth: 2, borderColor: 'rgba(248,113,113,0.6)', zIndex: 3 },
  mePanel: { marginHorizontal: 14, marginTop: 8, padding: 12, borderRadius: 18, backgroundColor: 'rgba(11,42,91,0.92)', borderWidth: 2, borderColor: 'rgba(56,189,248,0.6)' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  panelName: { color: 'white', fontSize: 18, fontWeight: '900', flex: 1, textTransform: 'capitalize' },
  hpBadge: { backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  panelHp: { color: '#e2e8f0', fontWeight: '800', fontVariant: ['tabular-nums'] },
  hpTrack: { height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  hpGhost: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.85)' },
  hpFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 7 },
  hpShine: { position: 'absolute', left: 0, right: 0, top: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.28)' },

  arena: { flex: 1, marginTop: 8, marginHorizontal: 0, overflow: 'hidden' },
  spot: { position: 'absolute' },
  hitFlash: { backgroundColor: 'white', borderRadius: 80 },

  pop: { position: 'absolute', fontSize: 42, fontWeight: '900', textShadowColor: 'black', textShadowRadius: 8 },
  popOpp: { top: '14%', right: '14%' },
  popMe: { bottom: '34%', left: '12%' },
  banner: { position: 'absolute', top: '44%', alignSelf: 'center', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 16, borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.3)' },
  bannerText: { color: '#1f1300', fontWeight: '900', fontSize: 20 },
  combo: { position: 'absolute', top: 10, left: 14, backgroundColor: '#f59e0b', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderBottomWidth: 3, borderBottomColor: '#b45309' },
  comboText: { color: '#1f1300', fontWeight: '900' },

  actions: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 30 },
  actBtn: { flex: 1, height: 78, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.3)', overflow: 'hidden' },
  actBig: { flex: 1.6, height: 96, borderRadius: 26 },
  actLabel: { color: 'white', fontWeight: '900', fontSize: 12, marginTop: 2, letterSpacing: 0.5 },
  cdTrack: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, backgroundColor: 'rgba(0,0,0,0.25)' },
  cdFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.85)' },

  introOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,10,24,0.9)', alignItems: 'center', justifyContent: 'center', gap: 6 },
  introCard: { width: '78%', alignItems: 'center', paddingVertical: 14, borderRadius: 26, borderWidth: 3 },
  introMe: { backgroundColor: 'rgba(37,99,235,0.35)', borderColor: '#38bdf8', alignSelf: 'flex-start', marginLeft: 14 },
  introOpp: { backgroundColor: 'rgba(220,38,38,0.35)', borderColor: '#f87171', alignSelf: 'flex-end', marginRight: 14 },
  introSprite: { width: 130, height: 130 },
  introName: { color: 'white', fontSize: 24, fontWeight: '900', textTransform: 'capitalize' },
  vs: { color: '#facc15', fontSize: 64, fontWeight: '900', textShadowColor: 'rgba(250,204,21,0.7)', textShadowRadius: 18 },
  fightText: { position: 'absolute', color: '#fde047', fontSize: 62, fontWeight: '900', textShadowColor: 'black', textShadowRadius: 12, backgroundColor: 'rgba(220,38,38,0.9)', paddingHorizontal: 24, borderRadius: 18, overflow: 'hidden' },

  resultOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,10,24,0.93)', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  resultTitle: { fontSize: 48, fontWeight: '900' },
  resultSub: { color: '#94a3b8', fontSize: 15, marginBottom: 18 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16, borderBottomWidth: 5, borderBottomColor: '#1e40af' },
  btnText: { color: 'white', fontWeight: '900', fontSize: 17 },
});