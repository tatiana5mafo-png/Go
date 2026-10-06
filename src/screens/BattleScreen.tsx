import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Easing, FlatList, Image, PanResponder, Pressable,
  StyleSheet, Text, View,
} from 'react-native';
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

const ATTACK_COOLDOWN_MS = 1000; // el servidor es quien lo hace cumplir; aquí solo evitamos spam
const DODGE_COOLDOWN_MS = 3000;
const SWIPE_PX = 50;
const WAIT_LIMIT_MS = 2 * 60 * 1000; // NUEVO: tiempo de espera de rival (para probar rápido, pon 15_000)

const JOIN_ERRORS: Record<string, string> = {
  gym_not_found: 'Ese gimnasio no existe.',
  too_far: 'Estás demasiado lejos del gimnasio.',
  not_yours: 'Ese Pokémon no es tuyo.',
  already_in_battle: 'Ya estás en un combate.',
  error: 'Error de conexión con el servidor.',
};

// NUEVO: "1:42"
const clockText = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/** Barra de vida que baja con animación. */
const HpBar = memo(function HpBar({ hp, max }: { hp: number; max: number }) {
  const ratio = Math.max(0, Math.min(1, hp / Math.max(1, max)));
  const v = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: ratio, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v, ratio]);
  return (
    <View style={s.hpTrack}>
      <Animated.View
        style={[s.hpFill, {
          width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: v.interpolate({ inputRange: [0, 0.25, 0.5, 1], outputRange: ['#ef4444', '#ef4444', '#facc15', '#22c55e'] }),
        }]}
      />
    </View>
  );
});

/** Número de daño que sube y se desvanece. */
const DamagePop = memo(function DamagePop({ pop }: { pop: Pop }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={[s.pop, { color: pop.color }, pop.side === 'opp' ? s.popOpp : s.popMe, {
        opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
          { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.3, 1] }) },
        ],
      }]}
    >
      {pop.value}
    </Animated.Text>
  );
});

/** Aviso de tipo que rebota. */
const Banner = memo(function Banner({ msg }: { msg: Msg }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(v, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(900),
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

/** Sprite que flota; recibe un valor externo para temblar al ser golpeado. */
const Fighter = memo(function Fighter({
  uri, size, shake, flash, delay,
}: { uri: string | null; size: number; shake: Animated.Value; flash: Animated.Value; delay: number }) {
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
      transform: [
        { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
        { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-16, 16] }) },
      ],
    }}>
      {uri ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" /> : <View style={{ width: size, height: size }} />}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.hitFlash, { opacity: flash }]} />
    </Animated.View>
  );
});

export default function BattleScreen({ gymId, gymName, position, onClose }: Props) {
  const [mine, setMine] = useState<MyPokemon[] | null>(null);
  const [chosen, setChosen] = useState<MyPokemon | null>(null);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opp, setOpp] = useState<Opponent | null>(null);

  // NUEVO: espera de rival
  const [timedOut, setTimedOut] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const cancelling = useRef(false);
  const nextTry = useRef(0);

  const { view, fx, act, userId } = useBattle(battleId);

  const [pops, setPops] = useState<Pop[]>([]);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [dodgeReady, setDodgeReady] = useState(true);
  const lastAttack = useRef(0);
  const counter = useRef(0);
  const mounted = useRef(true);

  const myShake = useRef(new Animated.Value(0)).current;
  const oppShake = useRef(new Animated.Value(0)).current;
  const myFlash = useRef(new Animated.Value(0)).current;
  const oppFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    fetchMyPokemon().then((r) => mounted.current && setMine(r)).catch(() => mounted.current && setMine([]));
  }, []);

  // NUEVO: milisegundos que quedan de espera, calculados con la hora de creación del combate
  const created = view?.createdAt;
  const remainingMs =
    created && Number.isFinite(created) ? Math.max(0, created + WAIT_LIMIT_MS - now) : WAIT_LIMIT_MS;

  // NUEVO: reloj que avanza solo mientras se espera al rival
  useEffect(() => {
    if (view?.status !== 'waiting') return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [view?.status]);

  // NUEVO: al llegar a 0:00 se pide al servidor cerrar el combate en espera.
  // Si responde false es que alguien entró justo ahora (o falló la red): se reintenta en 3 s.
  useEffect(() => {
    if (!battleId || view?.status !== 'waiting' || remainingMs > 0) return;
    if (cancelling.current || Date.now() < nextTry.current) return;
    cancelling.current = true;
    battleApi.cancelWaiting(battleId).then((ok) => {
      cancelling.current = false;
      if (!mounted.current) return;
      if (ok) setTimedOut(true);
      else nextTry.current = Date.now() + 3000;
    });
  }, [battleId, view?.status, remainingMs, now]);

  // Rival: la función del servidor solo responde a los participantes
  useEffect(() => {
    if (!battleId || view?.status !== 'active' || opp) return;
    supabase.rpc('battle_opponent', { p_battle: battleId }).then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (mounted.current && row) setOpp(row as Opponent);
    });
  }, [battleId, view?.status, opp]);

  const hit = useCallback((who: 'me' | 'opp') => {
    const shake = who === 'me' ? myShake : oppShake;
    const flash = who === 'me' ? myFlash : oppFlash;
    Animated.parallel([
      Animated.sequence([1, -1, 0.7, -0.7, 0.4, 0].map((t) => Animated.timing(shake, { toValue: t, duration: 55, useNativeDriver: true }))
        .reduce<Animated.CompositeAnimation[]>((a, x) => [...a, x], []) as any),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.7, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    ]).start();
  }, [myShake, oppShake, myFlash, oppFlash]);

  const addPop = useCallback((side: 'me' | 'opp', value: string, color: string) => {
    const id = ++counter.current;
    setPops((p) => [...p.slice(-4), { id, value, color, side }]);
    setTimeout(() => mounted.current && setPops((p) => p.filter((x) => x.id !== id)), 1000);
  }, []);

  const say = useCallback((text: string, color: string) => setMsg({ id: ++counter.current, text, color }), []);

  const typeText = (mult: number) =>
    mult === 0 ? { t: 'No afecta', c: '#6b7280' }
    : mult > 1 ? { t: '¡SÚPER EFECTIVO!', c: '#f59e0b' }
    : mult < 1 ? { t: 'Poco efectivo', c: '#64748b' }
    : null;

  // Lo que hace el rival (solo animación; la vida llega por Postgres Changes)
  useEffect(() => {
    if (!fx || fx.from === userId) return;
    if (fx.kind === 'attack') {
      hit('me');
      addPop('me', `-${fx.damage ?? 0}`, '#f87171');
    } else {
      say('El rival esquiva', '#38bdf8');
    }
  }, [fx, userId, hit, addPop, say]);

  const attack = useCallback(async () => {
    const t = Date.now();
    if (t - lastAttack.current < ATTACK_COOLDOWN_MS) return;
    lastAttack.current = t;
    const res = await act('attack');
    if (!res.ok || res.action !== 'attack') return;
    hit('opp');
    addPop('opp', res.damage > 0 ? `-${res.damage}` : '0', res.dodged ? '#38bdf8' : '#fde047');
    const tt = typeText(Number(res.multiplier));
    if (res.dodged) say('¡Esquivado a medias!', '#38bdf8');
    else if (tt) say(tt.t, tt.c);
  }, [act, hit, addPop, say]);

  const dodge = useCallback(async () => {
    if (!dodgeReady) return;
    setDodgeReady(false);
    setTimeout(() => mounted.current && setDodgeReady(true), DODGE_COOLDOWN_MS);
    const res = await act('dodge');
    if (res.ok) say('¡Esquiva!', '#38bdf8');
  }, [act, dodgeReady, say]);

  // El PanResponder se crea una vez y usa siempre la última versión de los manejadores
  const handlers = useRef({ attack, dodge });
  handlers.current = { attack, dodge };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > SWIPE_PX && Math.abs(g.dx) > Math.abs(g.dy)) handlers.current.dodge();
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

  // NUEVO: Reintentar vuelve a buscar rival con el mismo Pokémon
  const retry = useCallback(() => {
    setTimedOut(false);
    setOpp(null);
    setBattleId(null);
    nextTry.current = 0;
    if (chosen) choose(chosen);
  }, [chosen, choose]);

  // NUEVO: Salir mientras se espera cierra también el combate, para no dejarlo abierto
  const leaveWaiting = useCallback(async () => {
    if (battleId) {
      try { await battleApi.cancelWaiting(battleId); } catch { /* si falla, igual salimos */ }
    }
    onClose();
  }, [battleId, onClose]);

  const myPoke = useMemo(
    () => mine?.find((m) => m.id === view?.myPokemonId) ?? chosen,
    [mine, view?.myPokemonId, chosen],
  );

  /* ─────────── 1. Elegir Pokémon ─────────── */
  if (!battleId) {
    return (
      <View style={s.root}>
        <View style={s.pickHead}>
          <Pressable onPress={onClose} style={s.backBtn} hitSlop={10}><Ionicons name="close" size={22} color="white" /></Pressable>
          <Text style={s.kicker}>GIMNASIO</Text>
          <Text style={s.pickTitle} numberOfLines={1}>{gymName}</Text>
          <Text style={s.pickSub}>Elige tu Pokémon</Text>
        </View>
        {error && <Text style={s.error}>{error}</Text>}
        {mine === null ? (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 40 }} />
        ) : mine.length === 0 ? (
          <Text style={s.empty}>Aún no tienes Pokémon. Captura uno primero.</Text>
        ) : (
          <FlatList
            data={[...mine].sort((a, b) => computeCp(b, b) - computeCp(a, a))}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <Pressable disabled={joining} onPress={() => choose(item)} style={({ pressed }) => [s.pickCard, pressed && { transform: [{ scale: 0.97 }] }]}>
                <View style={s.pickSprite}>
                  {item.spriteUrl ? <Image source={{ uri: item.spriteUrl }} style={{ width: 64, height: 64 }} resizeMode="contain" /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.pickName}>{item.name}</Text>
                  {/* CAMBIO: "PS" ahora dice "Salud" */}
                  <Text style={s.pickMeta}>IV {ivPerfection(item)}% · Salud {(item.baseHp + item.ivHp) * 3}</Text>
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

  /* ─────────── NUEVO: sin rival (tiempo de espera agotado) ─────────── */
  // Se muestra al cancelar por el contador o cuando el servidor cerró el combate sin que llegara nadie.
  if (timedOut || (view?.status === 'finished' && !view.hadOpponent)) {
    return <NoOpponent sprite={myPoke?.spriteUrl ?? null} onBack={onClose} onRetry={retry} />;
  }

  /* ─────────── 2. Esperando rival ─────────── */
  if (!view || view.status === 'waiting') {
    return (
      <View style={[s.root, s.centerAll]}>
        <WaitingPulse />
        {myPoke?.spriteUrl ? <Image source={{ uri: myPoke.spriteUrl }} style={s.waitSprite} resizeMode="contain" /> : null}
        <Text style={s.waitTitle}>Esperando un rival</Text>
        <Text style={s.waitSub}>Otro entrenador debe entrar a {gymName}.</Text>
        {/* NUEVO: contador regresivo */}
        <View style={[s.waitClock, remainingMs <= 15000 && s.waitClockUrgent]}>
          <Ionicons name="time-outline" size={20} color="white" />
          <Text style={s.waitClockText}>{clockText(remainingMs)}</Text>
        </View>
        <Text style={s.waitHint}>Si nadie llega, la búsqueda termina sola.</Text>
        <Pressable style={s.ghostBtn} onPress={leaveWaiting}><Text style={s.ghostText}>Salir</Text></Pressable>
      </View>
    );
  }

  /* ─────────── 3. Combate ─────────── */
  const finished = view.status === 'finished';
  return (
    <View style={s.root}>
      <View style={s.beamA} /><View style={s.beamB} />

      {/* Rival (arriba) */}
      <View style={s.oppPanel}>
        <View style={s.panelRow}>
          <Text style={s.panelName} numberOfLines={1}>{opp?.name ?? 'Rival'}</Text>
          <Text style={s.panelHp}>{view.oppHp}/{view.oppMax}</Text>
        </View>
        <HpBar hp={view.oppHp} max={view.oppMax} />
      </View>

      {/* Arena: tocar ataca, deslizar esquiva */}
      <View style={s.arena} {...pan.panHandlers}>
        <View style={s.floorOuter}><View style={s.floorInner} /></View>
        <View style={s.oppSpot}><Fighter uri={opp?.sprite_url ?? null} size={150} shake={oppShake} flash={oppFlash} delay={0} /></View>
        <View style={s.meSpot}><Fighter uri={myPoke?.spriteUrl ?? null} size={190} shake={myShake} flash={myFlash} delay={400} /></View>
        {pops.map((p) => <DamagePop key={p.id} pop={p} />)}
        {msg && <Banner key={msg.id} msg={msg} />}
      </View>

      {/* Mi Pokémon (abajo) */}
      <View style={s.mePanel}>
        <View style={s.panelRow}>
          <Text style={s.panelName} numberOfLines={1}>{myPoke?.name ?? 'Tú'}</Text>
          <Text style={s.panelHp}>{view.myHp}/{view.myMax}</Text>
        </View>
        <HpBar hp={view.myHp} max={view.myMax} />
        <View style={s.hintRow}>
          <View style={s.hint}><Ionicons name="flash" size={16} color="#facc15" /><Text style={s.hintText}>Toca: atacar</Text></View>
          <View style={[s.hint, !dodgeReady && { opacity: 0.4 }]}><Ionicons name="swap-horizontal" size={16} color="#38bdf8" /><Text style={s.hintText}>Desliza: esquivar</Text></View>
        </View>
      </View>

      {/* Resultado: ahora con tres casos */}
      {finished && (
        <View style={s.resultOverlay}>
          {view.won ? (
            <>
              <Ionicons name="trophy" size={84} color="#facc15" />
              <Text style={[s.resultTitle, { color: '#facc15' }]}>¡Victoria!</Text>
              <Text style={s.resultSub}>Dejaste sin salud a tu rival.</Text>
            </>
          ) : view.winnerId === null ? (
            <>
              {/* NUEVO: combate cerrado por inactividad, sin ganador */}
              <Ionicons name="time-outline" size={84} color="#fdba74" />
              <Text style={[s.resultTitle, { color: '#fdba74', fontSize: 36 }]}>Combate cancelado</Text>
              <Text style={s.resultSub}>Se cerró por inactividad. No hay ganador.</Text>
            </>
          ) : (
            <>
              <Ionicons name="sad" size={84} color="#94a3b8" />
              <Text style={[s.resultTitle, { color: '#e5e7eb' }]}>Derrota</Text>
              <Text style={s.resultSub}>Tu Pokémon se quedó sin salud.</Text>
            </>
          )}
          <Pressable style={s.btn} onPress={onClose}><Text style={s.btnText}>Volver al mapa</Text></Pressable>
        </View>
      )}
    </View>
  );
}

/** Círculos que se expanden mientras se espera al rival. */
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

/** NUEVO: pantalla de "búsqueda agotada", con entrada animada y plataforma holográfica. */
const NoOpponent = memo(function NoOpponent({
  sprite, onBack, onRetry,
}: { sprite: string | null; onBack: () => void; onRetry: () => void }) {
  const tTitle = useRef(new Animated.Value(0)).current;
  const tCard = useRef(new Animated.Value(0)).current;
  const tStage = useRef(new Animated.Value(0)).current;
  const tBtns = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(1)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spring = (v: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(v, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]);

    const intro = Animated.parallel([
      spring(tTitle, 0),
      spring(tCard, 250),
      spring(tStage, 450),
      spring(tBtns, 800),
      // el 0:00 parpadea como pantalla digital al encenderse
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(flicker, { toValue: 0.2, duration: 70, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.4, duration: 70, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 1, duration: 90, useNativeDriver: true }),
      ]),
    ]);

    const loops = [
      Animated.loop(Animated.timing(wave, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true })),
      Animated.loop(Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])),
    ];

    intro.start();
    loops.forEach((l) => l.start());
    return () => { intro.stop(); loops.forEach((l) => l.stop()); };
  }, [tTitle, tCard, tStage, tBtns, flicker, wave, bob, glow]);

  const titleY = tTitle.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const cardY = tCard.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const cardGlow = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const stageScale = tStage.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const waveScale = wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const waveOpacity = wave.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const btnsScale = tBtns.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] });

  return (
    <View style={s.noRoot}>
      <View style={s.noGlowA} />
      <View style={s.noGlowB} />

      <Animated.View style={{ alignItems: 'center', opacity: tTitle, transform: [{ translateY: titleY }] }}>
        <Text style={s.noTitle}>
          BÚSQUEDA <Text style={s.noTitleAccent}>AGOTADA</Text>
        </Text>
        <Text style={s.noSub}>No se encontraron oponentes. ¡Inténtalo de nuevo más tarde!</Text>
      </Animated.View>

      {/* Tarjeta holográfica con el reloj */}
      <Animated.View style={[s.noCard, { opacity: tCard, transform: [{ translateY: cardY }, { scale: cardGlow }] }]}>
        <Ionicons name="timer-outline" size={38} color="#fdba74" />
        <View style={{ alignItems: 'center' }}>
          <Animated.Text allowFontScaling={false} style={[s.noClock, { opacity: flicker }]}>0:00</Animated.Text>
          <Text style={s.noExpired}>TIEMPO AGOTADO</Text>
        </View>
      </Animated.View>

      {/* Plataforma con tu Pokémon esperando */}
      <Animated.View style={[s.noStage, { opacity: tStage, transform: [{ scale: stageScale }] }]}>
        <View style={s.platOuter} />
        <View style={s.platInner} />
        <Animated.View style={[s.platWave, { opacity: waveOpacity, transform: [{ scale: waveScale }] }]} />
        <Animated.View style={{ marginBottom: 46, transform: [{ translateY: bobY }] }}>
          {sprite ? (
            <Image source={{ uri: sprite }} style={s.noSprite} resizeMode="contain" />
          ) : (
            <View style={s.noSprite} />
          )}
        </Animated.View>
      </Animated.View>

      <Animated.View style={[s.noButtons, { opacity: tBtns, transform: [{ scale: btnsScale }] }]}>
        <Pressable style={[s.noBtn, s.noBtnGhost]} onPress={onBack}>
          <Text style={s.noBtnGhostText}>VOLVER</Text>
        </Pressable>
        <Pressable style={[s.noBtn, s.noBtnSolid]} onPress={onRetry}>
          <Text style={s.noBtnSolidText}>REINTENTAR</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
});

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
  waitClock: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.14)', paddingHorizontal: 18, height: 44, borderRadius: 22 },
  waitClockUrgent: { backgroundColor: 'rgba(220,38,38,0.85)' },
  waitClockText: { color: 'white', fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  waitHint: { color: '#64748b', marginTop: 10, fontSize: 12 },
  ghostBtn: { marginTop: 24, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 14 },
  ghostText: { color: 'white', fontWeight: '800' },

  beamA: { position: 'absolute', top: -40, left: 30, width: 90, height: 420, backgroundColor: 'rgba(56,189,248,0.10)', transform: [{ rotate: '-18deg' }] },
  beamB: { position: 'absolute', top: -40, right: 40, width: 90, height: 420, backgroundColor: 'rgba(250,204,21,0.07)', transform: [{ rotate: '16deg' }] },

  oppPanel: { marginTop: 58, marginHorizontal: 16, padding: 12, borderRadius: 18, backgroundColor: 'rgba(11,42,91,0.85)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.5)' },
  mePanel: { marginHorizontal: 16, marginBottom: 28, padding: 12, borderRadius: 18, backgroundColor: 'rgba(11,42,91,0.85)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.5)' },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  panelName: { color: 'white', fontSize: 18, fontWeight: '900', flex: 1 },
  panelHp: { color: '#e2e8f0', fontWeight: '800', fontVariant: ['tabular-nums'] },
  hpTrack: { height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  hpFill: { height: '100%', borderRadius: 6 },
  hintRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintText: { color: '#cbd5e1', fontWeight: '700', fontSize: 12 },

  arena: { flex: 1 },
  floorOuter: { position: 'absolute', bottom: 30, alignSelf: 'center', width: 340, height: 120, borderRadius: 170, backgroundColor: 'rgba(56,189,248,0.12)', alignItems: 'center', justifyContent: 'center' },
  floorInner: { width: 250, height: 80, borderRadius: 125, borderWidth: 3, borderColor: 'rgba(125,211,252,0.5)' },
  oppSpot: { position: 'absolute', top: 6, right: 30 },
  meSpot: { position: 'absolute', bottom: 22, left: 14 },
  hitFlash: { backgroundColor: 'white', borderRadius: 80 },

  pop: { position: 'absolute', fontSize: 38, fontWeight: '900', textShadowColor: 'black', textShadowRadius: 8 },
  popOpp: { top: 40, right: 70 },
  popMe: { bottom: 130, left: 70 },
  banner: { position: 'absolute', top: '42%', alignSelf: 'center', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 16, borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.3)' },
  bannerText: { color: '#1f1300', fontWeight: '900', fontSize: 20 },

  resultOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,10,24,0.92)', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 6 },
  resultTitle: { fontSize: 46, fontWeight: '900' },
  resultSub: { color: '#94a3b8', fontSize: 15, marginBottom: 18, textAlign: 'center' },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 16, borderBottomWidth: 5, borderBottomColor: '#1e40af' },
  btnText: { color: 'white', fontWeight: '900', fontSize: 17 },

  // NUEVO: pantalla "búsqueda agotada"
  noRoot: { flex: 1, backgroundColor: '#1d2150', alignItems: 'center', justifyContent: 'space-between', paddingTop: 74, paddingBottom: 40, paddingHorizontal: 20, overflow: 'hidden' },
  noGlowA: { position: 'absolute', top: -80, left: -70, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(168,85,247,0.22)' },
  noGlowB: { position: 'absolute', bottom: -90, right: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(56,189,248,0.18)' },
  noTitle: { color: 'white', fontSize: 30, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  noTitleAccent: { color: '#fb923c' },
  noSub: { color: '#e2e8f0', fontSize: 15, textAlign: 'center', marginTop: 10, paddingHorizontal: 10, lineHeight: 21 },
  noCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 18,
    backgroundColor: 'rgba(15,40,70,0.65)', borderWidth: 2, borderColor: 'rgba(125,211,252,0.75)',
    shadowColor: '#7dd3fc', shadowOpacity: 0.7, shadowRadius: 16, shadowOffset: { width: 0, height: 0 },
  },
  noClock: { color: '#fdba74', fontSize: 44, fontWeight: '800', fontVariant: ['tabular-nums'], textShadowColor: '#fb923c', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } },
  noExpired: { color: '#fed7aa', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  noStage: { width: '100%', height: 280, alignItems: 'center', justifyContent: 'flex-end' },
  platOuter: { position: 'absolute', bottom: 8, width: 320, height: 96, borderRadius: 160, borderWidth: 2, borderColor: 'rgba(125,211,252,0.55)' },
  platInner: { position: 'absolute', bottom: 22, width: 230, height: 66, borderRadius: 115, borderWidth: 3, borderColor: 'rgba(125,211,252,0.9)', backgroundColor: 'rgba(125,211,252,0.16)' },
  platWave: { position: 'absolute', bottom: 22, width: 230, height: 66, borderRadius: 115, borderWidth: 2, borderColor: '#7dd3fc' },
  noSprite: { width: 190, height: 190 },
  noButtons: { flexDirection: 'row', gap: 14, alignSelf: 'stretch' },
  noBtn: { flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  noBtnGhost: { borderWidth: 2, borderColor: '#6ee7b7', backgroundColor: 'rgba(110,231,183,0.08)' },
  noBtnGhostText: { color: '#6ee7b7', fontWeight: '800', letterSpacing: 1 },
  noBtnSolid: { backgroundColor: '#34d399' },
  noBtnSolidText: { color: 'white', fontWeight: '800', letterSpacing: 1 },
});