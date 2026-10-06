import { Ionicons } from '@expo/vector-icons';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, Modal, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { COOLDOWN_MS, Reward, SpinResult } from '../services/pokestopApi';

interface Props {
  visible: boolean;
  name: string;
  onClose: () => void;
  onSpin: () => Promise<SpinResult>;
}

type Phase = 'idle' | 'spinning' | 'done';

const SWIPE_MIN_PX = 40;
const MIN_SPIN_MS = 1100;
const INK = '#111827';
const DISC = 230;
const RAYS = 420;

const ITEM_LABEL: Record<Reward['item'], string> = {
  pokeball: 'Poké Ball',
  greatball: 'Super Ball',
  potion: 'Poción',
};

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

function RewardIcon({ item, size }: { item: Reward['item']; size: number }) {
  if (item === 'pokeball') return <BallIcon size={size} top="#ef4444" />;
  if (item === 'greatball') return <BallIcon size={size} top="#2563eb" />;
  return <Ionicons name="flask" size={size} color="#22d3ee" />;
}

/** Disco de la parada. `muted` lo pone gris cuando está en enfriamiento. */
const DiscArt = memo(function DiscArt({ muted }: { muted: boolean }) {
  const c = muted
    ? { outer: '#6b7280', mid: '#9ca3af', core: '#4b5563', cube: '#d1d5db', top: '#f3f4f6' }
    : { outer: '#0ea5e9', mid: '#38bdf8', core: '#0369a1', cube: '#7dd3fc', top: '#e0f2fe' };
  const marks = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <Svg width={DISC} height={DISC} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="94" fill={c.outer} stroke="#ffffff" strokeWidth="6" />
      <Circle cx="100" cy="100" r="74" fill={c.mid} />
      <Circle cx="100" cy="100" r="74" fill="none" stroke={c.top} strokeWidth="3" strokeDasharray="4 8" />
      {marks.map((deg) => (
        <G key={deg} rotation={deg} origin="100, 100">
          <Circle cx="100" cy="16" r="6" fill="#ffffff" />
        </G>
      ))}
      <Circle cx="100" cy="100" r="46" fill={c.core} stroke="#ffffff" strokeWidth="5" />
      <Path d="M100 76 L122 88 L122 112 L100 124 L78 112 L78 88 Z" fill={c.cube} stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" />
      <Path d="M100 76 L122 88 L100 100 L78 88 Z" fill={c.top} />
      <Path d="M100 100 L100 124" stroke="#ffffff" strokeWidth="3" />
      <Path d="M62 62 A52 52 0 0 1 90 50" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="6" strokeLinecap="round" fill="none" />
    </Svg>
  );
});

/** Rayos de luz que giran despacio detrás del disco. */
const Rays = memo(function Rays({ color, id }: { color: string; id: string }) {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [rot]);

  const wedges = useMemo(() => {
    const c = RAYS / 2;
    return Array.from({ length: 12 }, (_, i) => {
      const a0 = (i * 30 * Math.PI) / 180;
      const a1 = ((i * 30 + 14) * Math.PI) / 180;
      return `M${c} ${c} L${c + c * Math.cos(a0)} ${c + c * Math.sin(a0)} L${c + c * Math.cos(a1)} ${c + c * Math.sin(a1)} Z`;
    });
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', width: RAYS, height: RAYS,
        transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      }}
    >
      <Svg width={RAYS} height={RAYS}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.55" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {wedges.map((d, i) => <Path key={i} d={d} fill={`url(#${id})`} />)}
      </Svg>
    </Animated.View>
  );
});

/** Chispas que suben flotando por toda la pantalla. */
const Sparks = memo(function Sparks({ color }: { color: string }) {
  const { width, height } = useWindowDimensions();
  const items = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      v: new Animated.Value(0),
      x: ((i * 37 + 11) % 100) / 100,
      size: 4 + (i % 4) * 2,
      dur: 2600 + ((i * 313) % 2200),
      delay: (i * 240) % 2400,
    })),
  ).current;

  useEffect(() => {
    const loops = items.map((s) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(s.delay),
          Animated.timing(s.v, { toValue: 1, duration: s.dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(s.v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [items]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((s, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: s.x * width, top: height * 0.82,
            width: s.size, height: s.size, borderRadius: s.size, backgroundColor: color,
            opacity: s.v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.9, 0.6, 0] }),
            transform: [{ translateY: s.v.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.55] }) }],
          }}
        />
      ))}
    </View>
  );
});

/** Estallido de partículas desde el centro al ganar. */
const Burst = memo(function Burst() {
  const parts = useRef(
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const dist = 110 + (i % 3) * 40;
      return { v: new Animated.Value(0), dx: Math.cos(a) * dist, dy: Math.sin(a) * dist, big: i % 2 === 0 };
    }),
  ).current;

  useEffect(() => {
    const anim = Animated.stagger(
      18,
      parts.map((p) => Animated.timing(p.v, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
    );
    anim.start();
    return () => anim.stop();
  }, [parts]);

  return (
    <View pointerEvents="none" style={styles.burstCenter}>
      {parts.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', width: p.big ? 12 : 7, height: p.big ? 12 : 7, borderRadius: 6,
            backgroundColor: p.big ? '#facc15' : '#ffffff',
            opacity: p.v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] }) },
              { scale: p.v.interpolate({ inputRange: [0, 1], outputRange: [1.4, 0.3] }) },
            ],
          }}
        />
      ))}
    </View>
  );
});

/** Confeti que cae una sola vez. */
const Confetti = memo(function Confetti() {
  const { width, height } = useWindowDimensions();
  const colors = ['#facc15', '#38bdf8', '#f87171', '#4ade80', '#ffffff'];
  const pieces = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      v: new Animated.Value(0),
      x: ((i * 53 + 7) % 100) / 100,
      color: colors[i % colors.length],
      dur: 1900 + ((i * 197) % 1500),
      delay: (i * 70) % 700,
      spin: 360 + (i % 5) * 180,
      sway: ((i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 10)),
    })),
  ).current;

  useEffect(() => {
    const anims = pieces.map((p) =>
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(p.v, { toValue: 1, duration: p.dur, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: p.x * width, top: -20, width: 9, height: 15, borderRadius: 2,
            backgroundColor: p.color,
            opacity: p.v.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
              { translateX: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, p.sway] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
});

/** Premio que entra con resorte; el retraso los escalona. */
const RewardChip = memo(function RewardChip({ reward, delay }: { reward: Reward; delay: number }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 130, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pop, delay]);

  return (
    <Animated.View
      style={[
        styles.chip,
        {
          opacity: pop,
          transform: [
            { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.1, 1] }) },
            { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.chipIcon}><RewardIcon item={reward.item} size={42} /></View>
      <Text style={styles.chipName}>{ITEM_LABEL[reward.item]}</Text>
      <View style={styles.chipQty}><Text style={styles.chipQtyText}>×{reward.amount}</Text></View>
    </Animated.View>
  );
});

/** Título que rebota al aparecer. */
const PopTitle = memo(function PopTitle({ text }: { text: string }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.spring(s, { toValue: 1, friction: 3, tension: 110, useNativeDriver: true });
    a.start();
    return () => a.stop();
  }, [s]);
  return (
    <Animated.Text
      style={[styles.resultTitle, { opacity: s, transform: [{ scale: s.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }] }]}
    >
      {text}
    </Animated.Text>
  );
});

function PokestopModal({ visible, name, onClose, onSpin }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<SpinResult | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);

  const phaseRef = useRef<Phase>('idle');
  const onSpinRef = useRef(onSpin);
  const mounted = useRef(true);

  const rot = useRef(new Animated.Value(0)).current;     // giro automático
  const drag = useRef(new Animated.Value(0)).current;    // giro según el dedo (grados)
  const kick = useRef(new Animated.Value(0)).current;    // impulso al soltar
  const glow = useRef(new Animated.Value(0)).current;
  const hint = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => { onSpinRef.current = onSpin; }, [onSpin]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    if (visible) {
      setResult(null);
      setRemainingMs(0);
      drag.setValue(0);
      kick.setValue(0);
      phaseRef.current = 'idle';
      setPhase('idle');
    }
  }, [visible, drag, kick]);

  // Rotación automática del disco: lenta en reposo, rápida mientras gira.
  useEffect(() => {
    if (!visible || phase === 'done') return;
    rot.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: phase === 'spinning' ? 380 : 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, phase, rot]);

  // Resplandor y pista de deslizar.
  useEffect(() => {
    if (!visible) return;
    const glowLoop = Animated.loop(
      Animated.timing(glow, { toValue: 1, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    const hintLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(hint, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(hint, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    glowLoop.start();
    hintLoop.start();
    return () => { glowLoop.stop(); hintLoop.stop(); };
  }, [visible, glow, hint]);

  // Cuenta regresiva contra la hora UTC del servidor.
  const cooldownUntil = result && 'cooldownUntil' in result ? result.cooldownUntil : undefined;
  useEffect(() => {
    if (!cooldownUntil) {
      setRemainingMs(0);
      return;
    }
    const target = Date.parse(cooldownUntil);
    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  // Sacudida corta cuando hay un fallo.
  const failed = result && !result.ok;
  useEffect(() => {
    if (!failed) return;
    shake.setValue(0);
    const a = Animated.sequence(
      [1, -1, 0.7, -0.7, 0.4, 0].map((t) =>
        Animated.timing(shake, { toValue: t, duration: 60, useNativeDriver: true }),
      ),
    );
    a.start();
    return () => a.stop();
  }, [failed, shake]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => phaseRef.current === 'idle',
        onPanResponderMove: (_, g) => {
          if (phaseRef.current === 'idle') drag.setValue(g.dx * 0.9);
        },
        onPanResponderRelease: async (_, g) => {
          if (phaseRef.current !== 'idle') return;
          if (Math.hypot(g.dx, g.dy) < SWIPE_MIN_PX) {
            Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
            return;
          }
          setPhaseBoth('spinning');
          kick.setValue(0);
          Animated.sequence([
            Animated.timing(kick, { toValue: 1, duration: 140, useNativeDriver: true }),
            Animated.spring(kick, { toValue: 0, friction: 4, useNativeDriver: true }),
          ]).start();
          const [res] = await Promise.all([
            onSpinRef.current(),
            new Promise((r) => setTimeout(r, MIN_SPIN_MS)),
          ]);
          if (!mounted.current) return;
          setResult(res);
          setPhaseBoth('done');
        },
      }),
    [drag, kick],
  );

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const dragRotate = drag.interpolate({ inputRange: [-720, 720], outputRange: ['-720deg', '720deg'] });
  const kickScale = kick.interpolate({ inputRange: [0, 1], outputRange: [1, 0.88] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.4] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const hintShift = hint.interpolate({ inputRange: [0, 1], outputRange: [8, -12] });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-14, 14] });

  const mm = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
  const pct = Math.min(1, remainingMs / COOLDOWN_MS);

  const RING_R = 118;
  const CIRC = 2 * Math.PI * RING_R;

  const failure = result && !result.ok ? result : null;
  const failureInfo = failure
    ? {
        cooldown: { icon: 'time' as const, color: '#fbbf24', title: 'En enfriamiento', sub: 'La parada se está recargando.' },
        too_far: { icon: 'walk' as const, color: '#f87171', title: 'Estás muy lejos', sub: 'Acércate a la parada para girarla.' },
        not_found: { icon: 'help-circle' as const, color: '#f87171', title: 'Parada no encontrada', sub: 'Esa parada no existe.' },
        error: { icon: 'cloud-offline' as const, color: '#f87171', title: 'Error de conexión', sub: 'Revisa tu internet e inténtalo de nuevo.' },
      }[failure.reason]
    : null;

  const won = result && result.ok ? result : null;
  const showCooldownDisc = !!failure && failure.reason === 'cooldown';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.bgTop} />
        <View style={styles.bgBottom} />

        {phase !== 'done' && <Sparks color="#7dd3fc" />}
        {won && <Confetti />}

        <View style={styles.header}>
          <Text style={styles.kicker}>POKÉPARADA</Text>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
        </View>

        {/* Disco para girar */}
        {phase !== 'done' && (
          <>
            <View {...pan.panHandlers} style={styles.discArea}>
              <Rays color="#38bdf8" id="rayBlue" />
              <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
              <Animated.View style={{ transform: [{ scale: kickScale }] }}>
                <Animated.View style={{ transform: [{ rotate: dragRotate }] }}>
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <DiscArt muted={false} />
                  </Animated.View>
                </Animated.View>
              </Animated.View>
            </View>

            <View style={styles.hintBox}>
              {phase === 'spinning' ? (
                <Text style={styles.hint}>Girando...</Text>
              ) : (
                <>
                  <Animated.View style={{ alignItems: 'center', transform: [{ translateY: hintShift }] }}>
                    <Ionicons name="chevron-up" size={28} color="#e0f2fe" />
                    <Ionicons name="chevron-up" size={28} color="#7dd3fc" style={{ marginTop: -16 }} />
                  </Animated.View>
                  <Text style={styles.hint}>Desliza el disco</Text>
                </>
              )}
            </View>
          </>
        )}

        {/* Premios */}
        {phase === 'done' && won && (
          <View style={styles.result}>
            <View style={styles.winStage}>
              <Rays color="#facc15" id="rayGold" />
              <Burst />
              <PopTitle text="¡Premios!" />
            </View>
            <View style={styles.chips}>
              {won.rewards.map((r, i) => (
                <RewardChip key={r.item} reward={r} delay={500 + i * 240} />
              ))}
            </View>
            {remainingMs > 0 && (
              <View style={styles.nextRow}>
                <Ionicons name="time-outline" size={16} color="#93c5fd" />
                <Text style={styles.cooldownText}>Vuelve en {mm}:{ss}</Text>
              </View>
            )}
          </View>
        )}

        {/* Fallos (con el disco en gris y el anillo de tiempo si es enfriamiento) */}
        {phase === 'done' && failure && failureInfo && (
          <Animated.View style={[styles.result, { transform: [{ translateX: shakeX }] }]}>
            {showCooldownDisc ? (
              <View style={styles.coolStage}>
                <View style={{ opacity: 0.85 }}><DiscArt muted /></View>
                <Svg width={260} height={260} style={StyleSheet.absoluteFill}>
                  <Circle cx="130" cy="130" r={RING_R} stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
                  <Circle
                    cx="130" cy="130" r={RING_R} stroke="#fbbf24" strokeWidth="8" fill="none"
                    strokeLinecap="round" strokeDasharray={`${CIRC}`} strokeDashoffset={CIRC * (1 - pct)}
                    rotation={-90} origin="130, 130"
                  />
                </Svg>
                <View style={styles.timerBadge}>
                  <Text style={styles.timerText}>{mm}:{ss}</Text>
                </View>
              </View>
            ) : (
              <Ionicons name={failureInfo.icon} size={84} color={failureInfo.color} />
            )}
            <Text style={styles.failTitle}>{failureInfo.title}</Text>
            <Text style={styles.failSub}>{failureInfo.sub}</Text>
          </Animated.View>
        )}

        <Pressable style={styles.close} onPress={onClose}>
          <Text style={styles.closeText}>{phase === 'done' ? 'Listo' : 'Cerrar'}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export default memo(PokestopModal);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#04142b', alignItems: 'center', justifyContent: 'center', padding: 24 },
  bgTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: '#0a2a52', opacity: 0.55 },
  bgBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: '#020b18', opacity: 0.7 },

  header: { alignItems: 'center', marginBottom: 12 },
  kicker: { color: '#38bdf8', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  title: { color: 'white', fontSize: 28, fontWeight: '900', marginTop: 4, textAlign: 'center' },

  discArea: { width: RAYS, height: 330, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: DISC, height: DISC, borderRadius: DISC / 2, backgroundColor: '#38bdf8' },

  hintBox: { height: 84, alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#e0f2fe', fontSize: 17, fontWeight: '800', marginTop: 4 },

  result: { alignItems: 'center', minHeight: 330, justifyContent: 'center', alignSelf: 'stretch' },
  winStage: { width: RAYS, height: 170, alignItems: 'center', justifyContent: 'center' },
  burstCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  resultTitle: {
    color: '#facc15', fontSize: 44, fontWeight: '900', textShadowColor: 'rgba(250,204,21,0.55)',
    textShadowRadius: 18, textShadowOffset: { width: 0, height: 0 },
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 4 },
  chip: {
    width: 108, alignItems: 'center', paddingVertical: 14, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 2, borderColor: 'rgba(250,204,21,0.45)',
  },
  chipIcon: { height: 48, alignItems: 'center', justifyContent: 'center' },
  chipName: { color: '#f3f4f6', fontSize: 12, fontWeight: '800', marginTop: 8 },
  chipQty: { marginTop: 6, backgroundColor: '#facc15', paddingHorizontal: 14, paddingVertical: 3, borderRadius: 12 },
  chipQtyText: { color: '#5b3a00', fontWeight: '900', fontSize: 17 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 22 },
  cooldownText: { color: '#93c5fd', fontSize: 15, fontWeight: '700' },

  coolStage: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  timerBadge: {
    position: 'absolute', backgroundColor: 'rgba(4,20,43,0.88)', paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 16, borderWidth: 2, borderColor: '#fbbf24',
  },
  timerText: { color: '#fde68a', fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  failTitle: { color: 'white', fontSize: 26, fontWeight: '900', marginTop: 6 },
  failSub: { color: '#9ca3af', fontSize: 15, textAlign: 'center', marginTop: 4 },

  close: {
    marginTop: 22, backgroundColor: '#2563eb', paddingHorizontal: 44, paddingVertical: 14,
    borderRadius: 16, borderBottomWidth: 5, borderBottomColor: '#1e40af',
  },
  closeText: { color: 'white', fontWeight: '900', fontSize: 17, letterSpacing: 0.5 },
});