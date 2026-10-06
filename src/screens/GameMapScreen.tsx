import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import OutOfBoundsModal from '../components/OutOfBoundsModal';
import PokestopModal from '../components/PokestopModal';
import { CAMPUS_POLYGON } from '../constants/campus';
import { LAKES } from '../constants/lake';
import { POINTS_OF_INTEREST } from '../constants/pois';
import { useInventory } from '../context/InventoryContext';
import { useLocation } from '../hooks/useLocation';
import { INTERACTION_RADIUS_M, useNearestPoi } from '../hooks/useNearestPoi';
import { useSpawns } from '../hooks/useSpawns';
import BattleScreen from './BattleScreen'; // NUEVO
import CaptureScreen, { CaptureTarget } from './CaptureScreen';
import { pokestopApi, SpinResult } from '../services/pokestopApi';
import { Spawn } from '../services/spawnApi';
import { PointOfInterest } from '../types';
import { isPointInPolygon } from '../utils/geofence';
import { PointM, makeProjector } from '../utils/projection';
import { DEBUG_FAKE_POSITION, DEBUG_FOLLOW_SPAWN } from '../constants/debug';
import { useDebugSpawnPosition } from '../hooks/useDebugSpawnPosition';

const VIEW_WIDTH_M = 260; // metros visibles a lo ancho de la pantalla
const SPAWN_VISIBLE_RADIUS_M = 30; // solo se ven criaturas a 30 m o menos

// Se calcula UNA vez al cargar el módulo (datos constantes).
const ORIGIN = {
  latitude: CAMPUS_POLYGON.reduce((s, p) => s + p.latitude, 0) / CAMPUS_POLYGON.length,
  longitude: CAMPUS_POLYGON.reduce((s, p) => s + p.longitude, 0) / CAMPUS_POLYGON.length,
};
const project = makeProjector(ORIGIN);
const POLYGON_M: PointM[] = CAMPUS_POLYGON.map(project);
const POIS_M = POINTS_OF_INTEREST.map((poi) => ({ poi, m: project(poi.coordinate) }));
const LAKES_M: PointM[][] = LAKES.map((ring) =>
  ring.map(([latitude, longitude]) => project({ latitude, longitude })),
);

interface MarkerProps {
  poi: PointOfInterest;
  x: number;
  y: number;
  inRange: boolean;
  bob: Animated.Value;
}

const GameMarker = memo(function GameMarker({ poi, x, y, inRange, bob }: MarkerProps) {
  const isGym = poi.kind === 'gym';
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  return (
    <Animated.View style={[styles.marker, { left: x - 50, top: y - 64, transform: [{ translateY }] }]}>
      {inRange && <Text style={styles.range}>¡EN RANGO!</Text>}
      <View style={[styles.pin, isGym ? styles.gym : styles.stop, inRange && styles.pinActive]}>
        <Text style={styles.pinIcon}>{isGym ? '🏟️' : '🔵'}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>{poi.name}</Text>
    </Animated.View>
  );
});

interface SpawnMarkerProps {
  spawn: Spawn;
  x: number;
  y: number;
  bob: Animated.Value;
  selected: boolean;
  onPress: (id: string) => void;
}

const SpawnMarker = memo(function SpawnMarker({ spawn, x, y, bob, selected, onPress }: SpawnMarkerProps) {
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return (
    <Animated.View style={[styles.spawn, { left: x - 50, top: y - 36, transform: [{ translateY }] }]}>
      <Pressable
        onPress={() => onPress(spawn.id)}
        hitSlop={10}
        style={[styles.spawnBubble, selected && styles.spawnBubbleActive]}
      >
        {spawn.spriteUrl ? (
          <Image source={{ uri: spawn.spriteUrl }} style={styles.spawnSprite} resizeMode="contain" />
        ) : (
          <Text style={styles.pinIcon}>❓</Text>
        )}
      </Pressable>
      <Text style={styles.spawnLabel} numberOfLines={1}>{spawn.name}</Text>
    </Animated.View>
  );
});

export default function GameMapScreen() {
  const { width, height } = useWindowDimensions();
  const { position: realPosition, status } = useLocation();
  const debugSpawnPosition = useDebugSpawnPosition(DEBUG_FOLLOW_SPAWN);
  const position = DEBUG_FAKE_POSITION ?? debugSpawnPosition ?? realPosition;
  const { refresh } = useInventory();

  const inside = useMemo(
    () => (position ? isPointInPolygon(position, CAMPUS_POLYGON) : null),
    [position],
  );
  const nearby = useNearestPoi(inside ? position : null);

  const denied = status === 'denied';
  const blocked = denied || inside === false;

  // Spawns del servidor (solo se consultan dentro del campus)
  const { spawns, reload } = useSpawns(!blocked && inside === true);
  const [selectedSpawnId, setSelectedSpawnId] = useState<string | null>(null);
  const handleSpawnPress = useCallback(
    (id: string) => setSelectedSpawnId((prev) => (prev === id ? null : id)),
    [],
  );

  // Modo captura
  const [captureTarget, setCaptureTarget] = useState<CaptureTarget | null>(null);
  const closeCapture = useCallback(() => {
    setCaptureTarget(null);
    setSelectedSpawnId(null);
    reload(); // si lo capturaste, desaparece del mapa de inmediato
  }, [reload]);

  // Interacción con Poképaradas
  const [spinOpen, setSpinOpen] = useState(false);
  const spinTarget = nearby && nearby.poi.kind === 'pokestop' ? nearby.poi : null;

  const handleSpin = useCallback(async (): Promise<SpinResult> => {
    if (!spinTarget || !position) return { ok: false, reason: 'too_far' };
    const res = await pokestopApi.spin(spinTarget.id, position);
    if (res.ok) refresh();// los premios van a la mochila
    return res;
  }, [spinTarget, position, refresh]);
  const closeSpin = useCallback(() => setSpinOpen(false), []);

  // NUEVO: combates en gimnasios
  const gymTarget = nearby && nearby.poi.kind === 'gym' ? nearby.poi : null;
  const [battleGym, setBattleGym] = useState<{ id: string; name: string } | null>(null);
  const openBattle = useCallback(() => {
    if (gymTarget) setBattleGym({ id: gymTarget.id, name: gymTarget.name });
  }, [gymTarget]);
  const closeBattle = useCallback(() => setBattleGym(null), []);

  // NUEVO: si sales del campus (o se niega el GPS) con un combate abierto, se cierra
  // para que no reaparezca solo al volver a entrar.
  useEffect(() => {
    if (blocked) setBattleGym(null);
  }, [blocked]);

  const scale = width / VIEW_WIDTH_M;
  const playerM = useMemo(() => (position ? project(position) : null), [position]);
  // La cámara sigue al jugador si está dentro; si no, queda en el centro del campus.
  const camera: PointM = inside && playerM ? playerM : { x: 0, y: 0 };

  // Criaturas a 30 m o menos del jugador. Coste O(k) con k spawns vivos (~12).
  const visibleSpawns = useMemo(() => {
    if (!playerM || !inside || blocked) return [];
    const now = Date.now();
    return spawns
      .filter((sp) => sp.expiresAt > now)
      .map((sp) => {
        const m = project(sp.coordinate);
        return { spawn: sp, m, distance: Math.hypot(m.x - playerM.x, m.y - playerM.y) };
      })
      .filter((v) => v.distance <= SPAWN_VISIBLE_RADIUS_M);
  }, [spawns, playerM, inside, blocked]);

  // Si la criatura seleccionada sale del rango o vence, el aviso desaparece solo.
  const selectedSpawn = visibleSpawns.find((v) => v.spawn.id === selectedSpawnId) ?? null;

  const startCapture = useCallback(() => {
    if (!selectedSpawn) return;
    const { spawn } = selectedSpawn;
    setCaptureTarget({ id: spawn.id, dexNumber: spawn.dexNumber, name: spawn.name, spriteUrl: spawn.spriteUrl });
  }, [selectedSpawn]);

  const toScreen = useCallback(
    (p: PointM) => ({
      x: width / 2 + (p.x - camera.x) * scale,
      y: height / 2 + (p.y - camera.y) * scale,
    }),
    [width, height, scale, camera.x, camera.y],
  );

  const polygonPoints = useMemo(
    () => POLYGON_M.map((p) => { const s = toScreen(p); return `${s.x},${s.y}`; }).join(' '),
    [toScreen],
  );

  const lakePoints = useMemo(
    () => LAKES_M.map((ring) =>
      ring.map((p) => { const s = toScreen(p); return `${s.x},${s.y}`; }).join(' '),
    ),
    [toScreen],
  );

  // Animaciones: un solo valor compartido para todos los marcadores + pulso del jugador.
  const bob = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const pulseLoop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    bobLoop.start();
    pulseLoop.start();
    return () => {
      bobLoop.stop();
      pulseLoop.stop();
    };
  }, [bob, pulse]);

  const player = playerM ? toScreen(playerM) : null;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.root}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Polygon points={polygonPoints} fill="#5ccf7f" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
        {lakePoints.map((pts, i) => (
          <Polygon key={i} points={pts} fill="#4aa8e8" stroke="#bfe6ff" strokeWidth={3} strokeLinejoin="round" />
        ))}
        {player && inside && (
          <Circle
            cx={player.x}
            cy={player.y}
            r={INTERACTION_RADIUS_M * scale}
            fill="rgba(250,204,21,0.12)"
            stroke="#facc15"
            strokeWidth={2}
          />
        )}
      </Svg>

      {POIS_M.map(({ poi, m }) => {
        const s = toScreen(m);
        if (s.x < -60 || s.x > width + 60 || s.y < -80 || s.y > height + 60) return null; // culling
        return (
          <GameMarker
            key={poi.id}
            poi={poi}
            x={s.x}
            y={s.y}
            inRange={nearby?.poi.id === poi.id}
            bob={bob}
          />
        );
      })}

      {visibleSpawns.map(({ spawn, m }) => {
        const s = toScreen(m);
        return (
          <SpawnMarker
            key={spawn.id}
            spawn={spawn}
            x={s.x}
            y={s.y}
            bob={bob}
            selected={spawn.id === selectedSpawnId}
            onPress={handleSpawnPress}
          />
        );
      })}

      {player && !blocked && (
        <View pointerEvents="none" style={[styles.avatarWrap, { left: player.x - 28, top: player.y - 28 }]}>
          <Animated.View style={[styles.pulse, { opacity: pulseOpacity, transform: [{ scale: pulseScale }] }]} />
          <View style={styles.avatar}><Text style={styles.avatarIcon}>🧢</Text></View>
        </View>
      )}

      {/* Aviso de la criatura tocada, con el botón de captura */}
      {selectedSpawn && !blocked && (
        <View style={styles.spawnBanner}>
          <Text style={styles.spawnBannerText}>
            ¡{selectedSpawn.spawn.name} salvaje! · {selectedSpawn.distance.toFixed(0)} m
          </Text>
          <Pressable style={styles.captureBtn} onPress={startCapture}>
            <Text style={styles.captureBtnText}>Capturar</Text>
          </Pressable>
        </View>
      )}

      {nearby && !blocked && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{nearby.poi.name} · {nearby.distance.toFixed(0)} m</Text>
          {spinTarget && (
            <Pressable style={styles.spinBtn} onPress={() => setSpinOpen(true)}>
              <Text style={styles.spinBtnText}>Girar</Text>
            </Pressable>
          )}
          {/* NUEVO: botón de combate cuando estás cerca de un gimnasio */}
          {gymTarget && (
            <Pressable style={styles.fightBtn} onPress={openBattle}>
              <Text style={styles.fightBtnText}>⚔️  Combatir</Text>
            </Pressable>
          )}
        </View>
      )}

      <PokestopModal
        visible={spinOpen && !!spinTarget && !blocked}
        name={spinTarget?.name ?? ''}
        onClose={closeSpin}
        onSpin={handleSpin}
      />

      {/* La pantalla de captura se monta solo mientras está abierta (así cámara y sensor se liberan al cerrar) */}
      <Modal
        visible={!!captureTarget && !!position}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeCapture}
      >
        {captureTarget && position ? (
          <CaptureScreen target={captureTarget} position={position} onClose={closeCapture} />
        ) : null}
      </Modal>

      {/* NUEVO: igual que la captura, el combate se monta solo mientras está abierto,
          así el canal de Realtime se cierra al salir */}
      <Modal
        visible={!!battleGym && !!position && !blocked}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeBattle}
      >
        {battleGym && position ? (
          <BattleScreen
            gymId={battleGym.id}
            gymName={battleGym.name}
            position={position}
            onClose={closeBattle}
          />
        ) : null}
      </Modal>

      <OutOfBoundsModal visible={blocked} reason={denied ? 'denied' : 'outside'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2f7d5b' },
  marker: { position: 'absolute', width: 100, alignItems: 'center' },
  range: {
    backgroundColor: '#facc15', color: '#713f12', fontWeight: '800', fontSize: 11,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginBottom: 2, overflow: 'hidden',
  },
  pin: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: 'white',
    alignItems: 'center', justifyContent: 'center',
  },
  pinActive: { borderColor: '#facc15' },
  stop: { backgroundColor: '#0ea5e9' },
  gym: { backgroundColor: '#ef4444' },
  pinIcon: { fontSize: 18 },
  label: {
    marginTop: 3, backgroundColor: 'rgba(255,255,255,0.92)', color: '#1e3a8a',
    fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden',
  },
  spawn: { position: 'absolute', width: 100, alignItems: 'center' },
  spawnBubble: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  spawnBubbleActive: { borderColor: '#facc15' },
  spawnSprite: { width: 60, height: 60 },
  spawnLabel: {
    marginTop: 3, backgroundColor: 'rgba(255,255,255,0.92)', color: '#7c2d12',
    fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
    overflow: 'hidden', textTransform: 'capitalize',
  },
  spawnBanner: {
    position: 'absolute', top: 56, left: 16, right: 16,
    backgroundColor: 'rgba(124,45,18,0.92)', padding: 12, borderRadius: 12,
  },
  spawnBannerText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  captureBtn: { marginTop: 10, backgroundColor: '#facc15', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  captureBtnText: { color: '#713f12', fontWeight: '800', fontSize: 16 },
  avatarWrap: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6' },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'white', borderWidth: 3,
    borderColor: '#3b82f6', alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 22 },
  banner: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)', padding: 12, borderRadius: 10,
  },
  bannerText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '700' },
  spinBtn: { marginTop: 10, backgroundColor: '#facc15', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  spinBtnText: { color: '#713f12', fontWeight: '800', fontSize: 16 },
  // NUEVO: botón de combate
  fightBtn: { marginTop: 10, backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  fightBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
});