import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, Image, Modal, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { BallType, CaptureResult, Quality, captureApi } from '../services/captureApi';
import { supabase } from '../services/supabase';
import { Coordinate } from '../types';

export interface CaptureTarget {
  id: string;
  dexNumber: number;
  name: string;
  spriteUrl: string | null;
}

interface Props {
  target: CaptureTarget;
  position: Coordinate;
  onClose: () => void;
}

// Constantes de ajuste
const SHIFT_PX = 400;
const FLIGHT_MS = 700;
const SAMPLES = 28;
const GRAVITY_HALF = 700;
const HIT_RADIUS = 70;
const RING_PERIOD = 1500;
const SPRITE_SIZE = 200;
const BALL_SIZE = 72;
const RING_R = 110;
const INK = '#111827';
const TIME_LIMIT_S = 30; // segundos para capturar (cámbialo a tu gusto)

const BALLS: { id: BallType; label: string; top: string }[] = [
  { id: 'pokeball', label: 'Poké', top: '#ef4444' },
  { id: 'greatball', label: 'Super', top: '#2563eb' },
  { id: 'ultraball', label: 'Ultra', top: '#f5b301' },
];

const QUALITY_LABEL: Record<Quality, { text: string; color: string }> = {
  nice: { text: 'Bien', color: '#86efac' },
  great: { text: 'Muy bien', color: '#fde047' },
  excellent: { text: 'Excelente', color: '#fb7185' },
  miss: { text: 'Fallaste', color: '#e5e7eb' },
};

const REASONS: Record<string, string> = {
  expired: 'El Pokémon ya no está.',
  too_far: 'Estás muy lejos.',
  no_balls: 'No te quedan balls de ese tipo.',
  error: 'Error de conexión con el servidor.',
};

type Phase = 'aiming' | 'flying' | 'result' | 'timeup';
interface Pt { x: number; y: number }

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Ángulos de las chispas que salen del Pokémon en la pantalla de tiempo agotado
const SPARK_ANGLES = Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2);

const BallIcon = memo(function BallIcon({ size, top }: { size: number; top: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="46" fill="#ffffff" stroke={INK} strokeWidth="5" />
      <Path d="M4 50 A46 46 0 0 1 96 50 Z" fill={top} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <Path d="M4 50 H96" stroke={INK} strokeWidth="6" />
      <Circle cx="50" cy="50" r="13" fill="#ffffff" stroke={INK} strokeWidth="5" />
      <Path d="M22 30 A34 34 0 0 1 42 17" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" fill="none" />
    </Svg>
  );
});

/** Movimiento de proyectil: x lineal, y con gravedad. s ∈ [0,1] es el tiempo normalizado. */
function trajectory(x0: number, y0: number, vx: number, vy: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const s = i / SAMPLES;
    pts.push({
      x: x0 + vx * FLIGHT_MS * 0.8 * s,
      y: y0 + vy * FLIGHT_MS * s + GRAVITY_HALF * s * s,
    });
  }
  return pts;
}

function closestApproach(pts: Pt[], tx: number, ty: number) {
  let index = 0;
  let dist = Infinity;
  pts.forEach((p, i) => {
    const d = Math.hypot(p.x - tx, p.y - ty);
    if (d < dist) { dist = d; index = i; }
  });
  return { index, dist };
}

/** Escala actual del anillo (1 → 0.3) según el tiempo transcurrido. */
const ringScaleAt = (startMs: number) =>
  1 - 0.7 * (((Date.now() - startMs) % RING_PERIOD) / RING_PERIOD);

const qualityFromScale = (scale: number): Quality =>
  scale <= 0.45 ? 'excellent' : scale <= 0.7 ? 'great' : 'nice';

const colorFromScale = (scale: number) =>
  scale <= 0.45 ? '#ef4444' : scale <= 0.7 ? '#facc15' : '#22c55e';

export default function CaptureScreen({ target, position, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();

  const x0 = width * 0.62;
  const y0 = height - 210;
  const ty0 = height * 0.38;

  const [phase, setPhase] = useState<Phase>('aiming');
  const [ball, setBall] = useState<BallType>('pokeball');
  const [stock, setStock] = useState<Record<BallType, number | null>>({ pokeball: null, greatball: null, ultraball: null });
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [flight, setFlight] = useState<Pt[] | null>(null);
  const [ringColor, setRingColor] = useState('#22c55e');
  const [feedback, setFeedback] = useState<Quality | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S);
  const [throws, setThrows] = useState(0);

  const phaseRef = useRef<Phase>('aiming');
  const ballRef = useRef<BallType>('pokeball');
  const positionRef = useRef<Coordinate>(position);
  const mounted = useRef(true);
  const offset = useRef<Pt>({ x: 0, y: 0 });
  const ringStart = useRef(Date.now());

  const sx = useRef(new Animated.Value(0)).current;
  const sy = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const idle = useRef(new Animated.Value(0)).current;
  const flightAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Latido del reloj en los últimos 5 segundos
  const tickPulse = useRef(new Animated.Value(0)).current;

  // Pantalla de tiempo agotado: entrada coreografiada...
  const tuFlash = useRef(new Animated.Value(0)).current;        // destello rojo de impacto
  const tuIn = useRef(new Animated.Value(0)).current;           // fundido del fondo
  const tuTitle = useRef(new Animated.Value(0)).current;        // título tipo "sello"
  const tuBubble = useRef(new Animated.Value(0)).current;       // aparición del Pokémon
  const tuClockIn = useRef(new Animated.Value(0)).current;      // caída del reloj
  const tuClockFlicker = useRef(new Animated.Value(1)).current; // parpadeo del 00:00
  const tuCard = useRef(new Animated.Value(0)).current;         // tarjeta de resultado
  const tuBtns = useRef(new Animated.Value(0)).current;         // botones
  // ...y animaciones en bucle
  const tuFloat = useRef(new Animated.Value(0)).current;        // flotación
  const tuShake = useRef(new Animated.Value(0)).current;        // temblor de enojo
  const tuRing = useRef(new Animated.Value(0)).current;         // ondas expansivas
  const tuSpark = useRef(new Animated.Value(0)).current;        // chispas
  const tuGlow = useRef(new Animated.Value(0)).current;         // pulso del reloj

  useEffect(() => { ballRef.current = ball; }, [ball]);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; flightAnim.current?.stop(); };
  }, []);

  // Cantidad de cada ball: el RLS solo deja leer las filas del propio usuario.
  useEffect(() => {
    supabase.from('user_inventory').select('item_id, quantity').in('item_id', ['pokeball', 'greatball', 'ultraball'])
      .then(({ data }) => {
        if (!mounted.current || !data) return;
        setStock((prev) => {
          const next = { ...prev, pokeball: 0, greatball: 0, ultraball: 0 };
          data.forEach((r: any) => { next[r.item_id as BallType] = r.quantity; });
          return next;
        });
      });
  }, []);

  // Giroscopio: mueve el sprite. El cleanup detiene el sensor al salir.
  useEffect(() => {
    if (!permission?.granted) return;
    DeviceMotion.setUpdateInterval(50);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      const x = -rotation.gamma * SHIFT_PX;
      const y = -(rotation.beta - 1.2) * SHIFT_PX;
      offset.current = { x, y };
      sx.setValue(x);
      sy.setValue(y);
    });
    return () => sub.remove();
  }, [permission?.granted, sx, sy]);

  // Anillo que se encoge (hilo nativo) + color del anillo según su tamaño actual.
  useEffect(() => {
    if (phase !== 'aiming') return;
    ring.setValue(0);
    ringStart.current = Date.now();
    const loop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: RING_PERIOD, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    const colorTimer = setInterval(() => setRingColor(colorFromScale(ringScaleAt(ringStart.current))), 80);
    return () => { loop.stop(); clearInterval(colorTimer); };
  }, [phase, ring]);

  // Balanceo suave de la ball mientras apuntas.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [idle]);

  // El reloj solo corre mientras apuntas (se pausa durante el vuelo y el resultado)
  // y solo cuando la cámara ya tiene permiso.
  useEffect(() => {
    if (phase !== 'aiming' || !permission?.granted) return;
    const id = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [phase, permission?.granted]);

  // Al llegar a 0 mientras apuntas, se acaba el tiempo.
  useEffect(() => {
    if (phase === 'aiming' && timeLeft === 0) {
      phaseRef.current = 'timeup';
      setPhase('timeup');
    }
  }, [phase, timeLeft]);

  // Latido del reloj en los últimos 5 segundos
  useEffect(() => {
    if (phase !== 'aiming' || timeLeft > 5 || timeLeft === 0) return;
    tickPulse.setValue(0);
    Animated.sequence([
      Animated.timing(tickPulse, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(tickPulse, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [timeLeft, phase, tickPulse]);

  // Pantalla de tiempo agotado: entrada + bucles. Todo corre en el hilo nativo.
  useEffect(() => {
    if (phase !== 'timeup') return;
    [tuFlash, tuIn, tuTitle, tuBubble, tuClockIn, tuCard, tuBtns, tuFloat, tuShake, tuRing, tuSpark, tuGlow]
      .forEach((v) => v.setValue(0));
    tuClockFlicker.setValue(1);

    const flicker = Animated.sequence([
      Animated.timing(tuClockFlicker, { toValue: 0.15, duration: 70, useNativeDriver: true }),
      Animated.timing(tuClockFlicker, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(tuClockFlicker, { toValue: 0.3, duration: 70, useNativeDriver: true }),
      Animated.timing(tuClockFlicker, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]);

    const intro = Animated.parallel([
      Animated.timing(tuIn, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(tuFlash, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(tuFlash, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
      Animated.spring(tuTitle, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(250),
        Animated.spring(tuBubble, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(550),
        Animated.spring(tuClockIn, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.sequence([Animated.delay(600), flicker]),
      Animated.sequence([
        Animated.delay(800),
        Animated.spring(tuCard, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(1000),
        Animated.spring(tuBtns, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
    ]);

    const loops = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(tuFloat, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(tuFloat, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
      // Temblor rápido cada ~1.5 s, como si el Pokémon estuviera furioso
      Animated.loop(
        Animated.sequence([
          Animated.delay(1200),
          Animated.timing(tuShake, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(tuShake, { toValue: -1, duration: 60, useNativeDriver: true }),
          Animated.timing(tuShake, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(tuShake, { toValue: -1, duration: 60, useNativeDriver: true }),
          Animated.timing(tuShake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(Animated.timing(tuRing, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(tuSpark, { toValue: 1, duration: 1300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.delay(500),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(tuGlow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(tuGlow, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    ];

    intro.start();
    loops.forEach((l) => l.start());
    return () => { intro.stop(); loops.forEach((l) => l.stop()); };
  }, [phase, tuFlash, tuIn, tuTitle, tuBubble, tuClockIn, tuClockFlicker, tuCard, tuBtns, tuFloat, tuShake, tuRing, tuSpark, tuGlow]);

  const throwBall = (vx: number, vy: number) => {
    const pts = trajectory(x0, y0, vx, vy);
    const tx = x0 - x0 + width / 2 + offset.current.x; // el sprite está centrado en la pantalla
    const ty = ty0 + offset.current.y;
    const { index, dist } = closestApproach(pts, tx, ty);
    const hit = dist <= HIT_RADIUS;
    const quality: Quality = hit ? qualityFromScale(ringScaleAt(ringStart.current)) : 'miss';
    const end = hit ? Math.max(index, 3) : SAMPLES;
    const used = ballRef.current;

    phaseRef.current = 'flying';
    setPhase('flying');
    setThrows((t) => t + 1);
    setFeedback(quality);
    setFlight(pts.slice(0, end + 1));
    progress.setValue(0);

    const animation = new Promise<void>((resolve) => {
      flightAnim.current = Animated.timing(progress, {
        toValue: 1,
        duration: (FLIGHT_MS * end) / SAMPLES,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      flightAnim.current.start(() => resolve());
    });
    const request = captureApi.capture(target.id, used, quality, positionRef.current);

    Promise.all([animation, request]).then(([, res]) => {
      if (!mounted.current) return;
      if ('ballsLeft' in res && typeof res.ballsLeft === 'number') {
        const left = res.ballsLeft;
        setStock((s) => ({ ...s, [used]: left }));
      }
      setResult(res);
      phaseRef.current = 'result';
      setPhase('result');
    });
  };

  // El PanResponder se crea una sola vez; usa siempre la última versión de throwBall.
  const throwRef = useRef(throwBall);
  throwRef.current = throwBall;
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => phaseRef.current === 'aiming',
      onPanResponderRelease: (_, g) => {
        if (phaseRef.current !== 'aiming') return;
        if (g.vy > -0.4) return; // toque o deslizamiento hacia abajo: no es un lanzamiento
        throwRef.current(g.vx, g.vy);
      },
    }),
  ).current;

  const retry = () => {
    progress.setValue(0);
    setFlight(null);
    setResult(null);
    setFeedback(null);
    phaseRef.current = 'aiming';
    setPhase('aiming');
  };

  // Reintentar tras agotar el tiempo da un reloj nuevo completo
  const retryAfterTimeUp = () => {
    setTimeLeft(TIME_LIMIT_S);
    retry();
  };

  const flightStyle = useMemo(() => {
    if (!flight || flight.length < 2) return null;
    const n = flight.length - 1;
    const input = flight.map((_, i) => i / n);
    return {
      transform: [
        { translateX: progress.interpolate({ inputRange: input, outputRange: flight.map((p) => p.x - x0) }) },
        { translateY: progress.interpolate({ inputRange: input, outputRange: flight.map((p) => p.y - y0) }) },
        { scale: progress.interpolate({ inputRange: input, outputRange: flight.map((_, i) => 1 - 0.45 * (i / n)) }) },
      ],
    };
  }, [flight, progress, x0, y0]);

  const trailPoints = useMemo(
    () => (flight ? flight.map((p) => `${p.x},${p.y}`).join(' ') : ''),
    [flight],
  );

  if (!permission) return <View style={styles.center} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Necesitamos la cámara para el modo captura.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}><Text style={styles.btnText}>Permitir cámara</Text></Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}><Text style={styles.btnText}>Volver</Text></Pressable>
      </View>
    );
  }

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });
  const idleY = idle.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const current = BALLS.find((b) => b.id === ball)!;
  const caught = result && result.ok && result.caught ? result : null;
  const dex = String(target.dexNumber).padStart(3, '0');

  // Reloj
  const clock = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
  const tickScale = tickPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });

  // Medidas de la pantalla de tiempo agotado (se adaptan al alto del teléfono)
  const BUBBLE = Math.min(230, height * 0.27);
  const STAGE_W = BUBBLE * 1.5;
  const STAGE_H = BUBBLE * 1.25;
  const centered = (size: number) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    left: (STAGE_W - size) / 2,
    top: (STAGE_H - size) / 2,
  });

  const flashOpacity = tuFlash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });
  const titleScale = tuTitle.interpolate({ inputRange: [0, 1], outputRange: [2.6, 1] });
  const titleOpacity = tuTitle.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] });
  const stageScale = tuBubble.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const floatY = tuFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const shakeX = tuShake.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] });
  const shakeRot = tuShake.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });
  // Dos ondas desfasadas medio ciclo
  const ring1Scale = tuRing.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const ring1Opacity = tuRing.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });
  const ring2Scale = tuRing.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1.45, 1.9, 1, 1.45] });
  const ring2Opacity = tuRing.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [0.275, 0, 0.55, 0.275] });
  const clockY = tuClockIn.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] });
  const glowScale = tuGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const cardY = tuCard.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const btnsScale = tuBtns.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <View style={styles.root}>
      {/* La cámara no admite hijos: todo lo demás va como hermano con posición absoluta */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.spriteWrap,
          { top: ty0 - SPRITE_SIZE / 2, opacity: phase === 'timeup' ? 0 : 1, transform: [{ translateX: sx }, { translateY: sy }] },
        ]}
      >
        {target.spriteUrl && <Image source={{ uri: target.spriteUrl }} style={styles.sprite} resizeMode="contain" />}
        {phase === 'aiming' && (
          <>
            <View style={styles.ringStatic} />
            <Animated.View style={[styles.ring, { borderColor: ringColor, transform: [{ scale: ringScale }] }]} />
          </>
        )}
      </Animated.View>

      {/* Zona de gestos: el lanzamiento se detecta con la velocidad del dedo al soltar */}
      <View style={StyleSheet.absoluteFill} {...pan.panHandlers} />

      {/* Estela de la trayectoria */}
      {flight && phase !== 'aiming' && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, {
            opacity: progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0.55] }),
          }]}
        >
          <Svg width={width} height={height}>
            <Polyline points={trailPoints} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeDasharray="2 10" />
          </Svg>
        </Animated.View>
      )}

      {/* Ball: por fuera el vuelo, por dentro el balanceo */}
      {phase !== 'result' && phase !== 'timeup' && (
        <Animated.View
          pointerEvents="none"
          style={[styles.ball, { left: x0 - BALL_SIZE / 2, top: y0 - BALL_SIZE / 2 }, flightStyle]}
        >
          <Animated.View style={{ transform: [{ translateY: phase === 'aiming' ? idleY : 0 }] }}>
            <BallIcon size={BALL_SIZE} top={current.top} />
          </Animated.View>
        </Animated.View>
      )}

      {/* Tarjeta del Pokémon */}
      <View style={styles.card} pointerEvents="none">
        <Text style={styles.cardName} numberOfLines={1}>{target.name}</Text>
        <Text style={styles.cardSub}>Pokédex N.º {dex}</Text>
      </View>

      {/* Reloj de captura */}
      {(phase === 'aiming' || phase === 'flying') && (
        <Animated.View
          pointerEvents="none"
          style={[styles.timer, timeLeft <= 10 && styles.timerUrgent, { transform: [{ scale: tickScale }] }]}
        >
          <Ionicons name="time-outline" size={18} color="white" />
          <Text style={styles.timerText}>{clock}</Text>
        </Animated.View>
      )}

      {/* Calidad del lanzamiento */}
      {phase === 'flying' && feedback && (
        <Text style={[styles.feedback, { color: QUALITY_LABEL[feedback].color }]}>{QUALITY_LABEL[feedback].text}</Text>
      )}

      {phase === 'aiming' && <Text style={styles.hint}>Desliza hacia arriba para lanzar</Text>}

      {/* Selector de balls (vertical, izquierda) */}
      {phase !== 'timeup' && (
        <View style={styles.picker}>
          {BALLS.map((b) => {
            const qty = stock[b.id];
            const empty = qty === 0;
            return (
              <Pressable
                key={b.id}
                disabled={phase !== 'aiming' || empty}
                onPress={() => setBall(b.id)}
                style={[styles.pick, ball === b.id && styles.pickOn, empty && { opacity: 0.4 }]}
              >
                <BallIcon size={34} top={b.top} />
                <View style={styles.pickBadge}><Text style={styles.pickBadgeText}>{qty ?? '–'}</Text></View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Huir */}
      {phase !== 'timeup' && (
        <Pressable style={styles.flee} onPress={onClose} disabled={phase === 'flying'}>
          <Ionicons name="arrow-undo" size={18} color="white" />
          <Text style={styles.fleeText}>Huir</Text>
        </Pressable>
      )}

      {/* Resultado */}
      {phase === 'result' && result && (
        <View style={styles.overlay}>
          <View style={styles.panel}>
            {caught ? (
              <>
                <Ionicons name="checkmark-circle" size={54} color="#22c55e" />
                <Text style={styles.panelTitle}>¡Atrapaste a {target.name}!</Text>
                {([['Ataque', caught.iv_attack], ['Defensa', caught.iv_defense], ['PS', caught.iv_hp]] as const).map(([label, v]) => (
                  <View key={label} style={styles.ivRow}>
                    <Text style={styles.ivLabel}>{label}</Text>
                    <View style={styles.ivTrack}><View style={[styles.ivFill, { width: `${(v / 15) * 100}%` }]} /></View>
                    <Text style={styles.ivValue}>{v}</Text>
                  </View>
                ))}
                <Text style={styles.panelSub}>
                  Perfección {Math.round(((caught.iv_attack + caught.iv_defense + caught.iv_hp) / 45) * 100)}%
                </Text>
                <Pressable style={styles.btn} onPress={onClose}><Text style={styles.btnText}>Volver al mapa</Text></Pressable>
              </>
            ) : result.ok ? (
              <>
                <Ionicons name="close-circle" size={54} color="#f87171" />
                <Text style={styles.panelTitle}>¡Se escapó!</Text>
                <Pressable style={styles.btn} onPress={retry}><Text style={styles.btnText}>Reintentar</Text></Pressable>
                <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}><Text style={styles.btnText}>Volver al mapa</Text></Pressable>
              </>
            ) : (
              <>
                <Ionicons name="alert-circle" size={54} color="#fbbf24" />
                <Text style={styles.panelTitle}>{REASONS[result.reason] ?? 'Error'}</Text>
                {result.reason === 'no_balls' && (
                  <Pressable style={styles.btn} onPress={retry}><Text style={styles.btnText}>Elegir otra ball</Text></Pressable>
                )}
                <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}><Text style={styles.btnText}>Volver al mapa</Text></Pressable>
              </>
            )}
          </View>
        </View>
      )}

      {/* Tiempo agotado: va dentro de un Modal para cubrir SIEMPRE toda la pantalla */}
      <Modal
        visible={phase === 'timeup'}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <Animated.View style={[styles.tuRoot, { opacity: tuIn }]}>
          {/* Destello rojo de impacto */}
          <Animated.View pointerEvents="none" style={[styles.tuFlash, { opacity: flashOpacity }]} />

          {/* Título tipo sello */}
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.tuTitle, { opacity: titleOpacity, transform: [{ scale: titleScale }] }]}
          >
            ¡TIEMPO AGOTADO!
          </Animated.Text>

          {/* Escenario del Pokémon */}
          <Animated.View
            style={{
              width: STAGE_W, height: STAGE_H, alignItems: 'center', justifyContent: 'center',
              opacity: tuBubble, transform: [{ scale: stageScale }],
            }}
          >
            <View style={[centered(BUBBLE * 2.3), { backgroundColor: 'rgba(239,68,68,0.10)' }]} />
            <View style={[centered(BUBBLE * 1.6), { backgroundColor: 'rgba(239,68,68,0.14)' }]} />

            <Animated.View
              style={[centered(BUBBLE), styles.tuWave, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]}
            />
            <Animated.View
              style={[centered(BUBBLE), styles.tuWave, { opacity: ring2Opacity, transform: [{ scale: ring2Scale }] }]}
            />

            {SPARK_ANGLES.map((a, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.tuSpark,
                  {
                    left: STAGE_W / 2 - 4,
                    top: STAGE_H / 2 - 4,
                    opacity: tuSpark.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
                    transform: [
                      { translateX: tuSpark.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(a) * BUBBLE * 0.8] }) },
                      { translateY: tuSpark.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(a) * BUBBLE * 0.8] }) },
                    ],
                  },
                ]}
              />
            ))}

            <Animated.View style={{ transform: [{ translateY: floatY }, { translateX: shakeX }, { rotate: shakeRot }] }}>
              <View style={[styles.tuBubble, { width: BUBBLE, height: BUBBLE, borderRadius: BUBBLE / 2 }]}>
                {target.spriteUrl && (
                  <Image
                    source={{ uri: target.spriteUrl }}
                    style={{ width: BUBBLE * 0.78, height: BUBBLE * 0.78 }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </Animated.View>
          </Animated.View>

          {/* Reloj 00:00 */}
          <Animated.View style={{ opacity: tuClockIn, transform: [{ translateY: clockY }] }}>
            <Animated.View style={[styles.tuClock, { opacity: tuClockFlicker, transform: [{ scale: glowScale }] }]}>
              <Text allowFontScaling={false} style={styles.tuClockText}>00:00</Text>
            </Animated.View>
          </Animated.View>

          {/* Tarjeta de resultado y estadísticas */}
          <Animated.View style={{ alignSelf: 'stretch', alignItems: 'center', opacity: tuCard, transform: [{ translateY: cardY }] }}>
            <View style={styles.tuCard}>
              <Text style={styles.tuCardTitle}>CAPTURA FALLIDA</Text>
              <Text style={styles.tuCardSub}>{cap(target.name)} se escapó…</Text>
            </View>
            <View style={styles.tuStats}>
              <Text style={styles.tuStatLabel}>
                LANZAMIENTOS <Text style={styles.tuStatValue}>{throws}</Text>
              </Text>
              <Text style={styles.tuStatLabel}>TIEMPO AGOTADO</Text>
            </View>
          </Animated.View>

          {/* Botones */}
          <Animated.View style={[styles.tuButtons, { opacity: tuBtns, transform: [{ scale: btnsScale }] }]}>
            <Pressable style={[styles.tuBtn, styles.tuBtnGhost]} onPress={retryAfterTimeUp}>
              <Text style={styles.tuBtnGhostText}>REINTENTAR</Text>
            </Pressable>
            <Pressable style={[styles.tuBtn, styles.tuBtnSolid]} onPress={onClose}>
              <Text style={styles.tuBtnSolidText}>CERRAR</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', padding: 24, gap: 12 },
  msg: { color: 'white', fontSize: 16, textAlign: 'center' },
  spriteWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  sprite: { width: SPRITE_SIZE, height: SPRITE_SIZE },
  ring: {
    position: 'absolute', width: RING_R * 2, height: RING_R * 2, borderRadius: RING_R,
    borderWidth: 5, top: (SPRITE_SIZE - RING_R * 2) / 2,
  },
  ringStatic: {
    position: 'absolute', width: RING_R * 0.9, height: RING_R * 0.9, borderRadius: RING_R * 0.45,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.85)', top: (SPRITE_SIZE - RING_R * 0.9) / 2,
  },
  ball: { position: 'absolute', width: BALL_SIZE, height: BALL_SIZE },

  card: {
    position: 'absolute', top: 60, right: 16, minWidth: 150, maxWidth: 220,
    backgroundColor: 'rgba(17,24,39,0.72)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10,
  },
  cardName: { color: 'white', fontSize: 20, fontWeight: '800', textTransform: 'capitalize' },
  cardSub: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginTop: 2 },

  timer: {
    position: 'absolute', top: 60, left: 16, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(17,24,39,0.72)', paddingHorizontal: 14, height: 40, borderRadius: 20,
  },
  timerUrgent: { backgroundColor: 'rgba(220,38,38,0.92)' },
  timerText: { color: 'white', fontWeight: '800', fontSize: 18, fontVariant: ['tabular-nums'] },

  feedback: {
    position: 'absolute', top: '58%', alignSelf: 'center', fontSize: 30, fontWeight: '900',
    textShadowColor: 'black', textShadowRadius: 8,
  },
  hint: {
    position: 'absolute', bottom: 110, alignSelf: 'center', color: 'white', fontWeight: '600',
    textShadowColor: 'black', textShadowRadius: 6,
  },

  picker: { position: 'absolute', left: 16, bottom: 56, gap: 10 },
  pick: {
    width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(17,24,39,0.72)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  pickOn: { borderColor: '#facc15' },
  pickBadge: {
    position: 'absolute', right: -4, bottom: -4, minWidth: 22, height: 22, borderRadius: 11,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  pickBadgeText: { fontSize: 12, fontWeight: '800', color: INK },

  flee: {
    position: 'absolute', right: 16, bottom: 56, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(17,24,39,0.72)', paddingHorizontal: 18, height: 46, borderRadius: 23,
  },
  fleeText: { color: 'white', fontWeight: '700' },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 360, backgroundColor: 'rgba(17,24,39,0.96)', borderRadius: 24, padding: 22, alignItems: 'center', gap: 10 },
  panelTitle: { color: 'white', fontSize: 22, fontWeight: '800', textAlign: 'center', textTransform: 'capitalize' },
  panelSub: { color: '#d1d5db', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  ivRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  ivLabel: { color: '#d1d5db', width: 64, fontWeight: '600' },
  ivTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#374151', overflow: 'hidden' },
  ivFill: { height: '100%', backgroundColor: '#22c55e' },
  ivValue: { color: 'white', width: 24, textAlign: 'right', fontWeight: '800' },

  btn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 200, alignItems: 'center' },
  btnGhost: { backgroundColor: '#374151' },
  btnText: { color: 'white', fontWeight: '700' },

  // Tiempo agotado
  tuRoot: {
    flex: 1, backgroundColor: 'rgba(24,4,8,0.93)', alignItems: 'center', justifyContent: 'center',
    paddingTop: 48, paddingHorizontal: 24, gap: 14,
  },
  tuFlash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#ff2d2d' },
  tuTitle: {
    width: '100%', color: '#ffe4e6', fontSize: 38, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center',
    textShadowColor: '#ef4444', textShadowRadius: 20, textShadowOffset: { width: 0, height: 0 },
  },
  tuWave: { borderWidth: 3, borderColor: '#fb7185' },
  tuSpark: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#fb7185' },
  tuBubble: {
    backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 3, borderColor: 'rgba(251,113,133,0.85)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ef4444', shadowOpacity: 0.9, shadowRadius: 24, shadowOffset: { width: 0, height: 0 },
  },
  tuClock: {
    borderWidth: 3, borderColor: '#fb7185', borderRadius: 22, paddingHorizontal: 38, paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.14)',
    shadowColor: '#ef4444', shadowOpacity: 0.8, shadowRadius: 18, shadowOffset: { width: 0, height: 0 },
  },
  tuClockText: {
    color: '#fda4af', fontSize: 66, fontWeight: '800', fontVariant: ['tabular-nums'],
    textShadowColor: '#ef4444', textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 },
  },
  tuCard: {
    backgroundColor: 'rgba(15,40,70,0.88)', borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)', paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center',
  },
  tuCardTitle: { color: 'white', fontWeight: '800', fontSize: 17, letterSpacing: 0.5 },
  tuCardSub: { color: '#e5e7eb', fontSize: 15, marginTop: 2 },
  tuStats: {
    alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, paddingHorizontal: 6,
  },
  tuStatLabel: { color: '#e5e7eb', fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  tuStatValue: { color: '#fdba74', fontSize: 22, fontWeight: '900' },
  tuButtons: { flexDirection: 'row', gap: 14, marginTop: 8 },
  tuBtn: { minWidth: 140, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  tuBtnGhost: { borderWidth: 2, borderColor: '#6ee7b7', backgroundColor: 'rgba(110,231,183,0.08)' },
  tuBtnGhostText: { color: '#6ee7b7', fontWeight: '800', letterSpacing: 1 },
  tuBtnSolid: { backgroundColor: 'white' },
  tuBtnSolidText: { color: '#34a67f', fontWeight: '800', letterSpacing: 1 },
});