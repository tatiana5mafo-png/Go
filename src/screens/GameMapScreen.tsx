import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import GameMap, { GameMapHandle, MapSpawn } from '../components/GameMap';
import OutOfBoundsModal from '../components/OutOfBoundsModal';
import PokestopModal from '../components/PokestopModal';
import { CAMPUS_POLYGON } from '../constants/campus';
import { DEBUG_FAKE_POSITION, DEBUG_FOLLOW_SPAWN } from '../constants/debug';
import { POINTS_OF_INTEREST } from '../constants/pois';
import { useInventory } from '../context/InventoryContext';
import { useAutoTheme } from '../hooks/useAutoTheme';
import { useDebugSpawnPosition } from '../hooks/useDebugSpawnPosition';
import { useHeading } from '../hooks/useHeading';
import { useLocation } from '../hooks/useLocation';
import { INTERACTION_RADIUS_M, useNearestPoi } from '../hooks/useNearestPoi';
import { useSpawns } from '../hooks/useSpawns';
import { pokestopApi, SpinResult } from '../services/pokestopApi';
import { isPointInPolygon } from '../utils/geofence';
import { makeProjector } from '../utils/projection';
import BattleScreen from './BattleScreen';
import CaptureScreen, { CaptureTarget } from './CaptureScreen';

const SPAWN_VISIBLE_RADIUS_M = 30; // solo se ven criaturas a 30 m o menos

type ThemeMode = 'auto' | 'night' | 'day';
const NEXT_MODE: Record<ThemeMode, ThemeMode> = { auto: 'night', night: 'day', day: 'auto' };
const MODE_ICON = { auto: 'contrast-outline', night: 'moon', day: 'sunny' } as const;

// Se calcula UNA vez al cargar el módulo (datos constantes).
// La proyección a metros se usa solo para medir distancias; el dibujo lo hace el motor del mapa.
const ORIGIN = {
  latitude: CAMPUS_POLYGON.reduce((s, p) => s + p.latitude, 0) / CAMPUS_POLYGON.length,
  longitude: CAMPUS_POLYGON.reduce((s, p) => s + p.longitude, 0) / CAMPUS_POLYGON.length,
};
const project = makeProjector(ORIGIN);

export default function GameMapScreen() {
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

  // Mapa: tema día/noche, brújula y seguimiento
  const mapRef = useRef<GameMapHandle>(null);
  const autoTheme = useAutoTheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const theme = themeMode === 'auto' ? autoTheme : themeMode;
  const [compassOn, setCompassOn] = useState(false);
  const heading = useHeading(compassOn && !blocked);
  const [following, setFollowing] = useState(true);

  const cycleTheme = useCallback(() => setThemeMode((m) => NEXT_MODE[m]), []);
  const toggleCompass = useCallback(() => setCompassOn((v) => !v), []);
  const recenter = useCallback(() => {
    mapRef.current?.recenter();
    setFollowing(true);
  }, []);

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
    if (res.ok) refresh(); // los premios van a la mochila
    return res;
  }, [spinTarget, position, refresh]);
  const closeSpin = useCallback(() => setSpinOpen(false), []);

  // Combates en gimnasios
  const gymTarget = nearby && nearby.poi.kind === 'gym' ? nearby.poi : null;
  const [battleGym, setBattleGym] = useState<{ id: string; name: string } | null>(null);
  const openBattle = useCallback(() => {
    if (gymTarget) setBattleGym({ id: gymTarget.id, name: gymTarget.name });
  }, [gymTarget]);
  const closeBattle = useCallback(() => setBattleGym(null), []);

  // Si sales del campus (o se niega el GPS) con un combate abierto, se cierra
  useEffect(() => {
    if (blocked) setBattleGym(null);
  }, [blocked]);

  const playerM = useMemo(() => (position ? project(position) : null), [position]);

  // Criaturas a 30 m o menos del jugador. Coste O(k) con k spawns vivos (~12).
  const visibleSpawns = useMemo(() => {
    if (!playerM || !inside || blocked) return [];
    const now = Date.now();
    return spawns
      .filter((sp) => sp.expiresAt > now)
      .map((sp) => {
        const m = project(sp.coordinate);
        return { spawn: sp, distance: Math.hypot(m.x - playerM.x, m.y - playerM.y) };
      })
      .filter((v) => v.distance <= SPAWN_VISIBLE_RADIUS_M);
  }, [spawns, playerM, inside, blocked]);

  const mapSpawns = useMemo<MapSpawn[]>(
    () =>
      visibleSpawns.map(({ spawn }) => ({
        id: spawn.id,
        name: spawn.name,
        spriteUrl: spawn.spriteUrl,
        coordinate: spawn.coordinate,
      })),
    [visibleSpawns],
  );

  // Si la criatura seleccionada sale del rango o vence, el aviso desaparece solo.
  const selectedSpawn = visibleSpawns.find((v) => v.spawn.id === selectedSpawnId) ?? null;

  const startCapture = useCallback(() => {
    if (!selectedSpawn) return;
    const { spawn } = selectedSpawn;
    setCaptureTarget({ id: spawn.id, dexNumber: spawn.dexNumber, name: spawn.name, spriteUrl: spawn.spriteUrl });
  }, [selectedSpawn]);

  return (
    <View style={styles.root}>
      <GameMap
        ref={mapRef}
        theme={theme}
        player={position}
        frozen={blocked}
        pois={POINTS_OF_INTEREST}
        nearPoiId={nearby && !blocked ? nearby.poi.id : null}
        spawns={mapSpawns}
        selectedSpawnId={selectedSpawnId}
        bearing={compassOn ? heading : null}
        interactionRadiusM={INTERACTION_RADIUS_M}
        onSpawnPress={handleSpawnPress}
        onFollowChange={setFollowing}
      />

      {/* Botones del mapa: brújula, tema y recentrar */}
      {!blocked && (
        <View style={styles.tools} pointerEvents="box-none">
          <Pressable style={[styles.tool, compassOn && styles.toolOn]} onPress={toggleCompass}>
            <Ionicons
              name={compassOn ? 'compass' : 'compass-outline'}
              size={22}
              color={compassOn ? 'white' : '#0b4f9c'}
            />
          </Pressable>
          <Pressable style={styles.tool} onPress={cycleTheme}>
            <Ionicons name={MODE_ICON[themeMode]} size={22} color="#0b4f9c" />
          </Pressable>
          {!following && (
            <Pressable style={styles.tool} onPress={recenter}>
              <Ionicons name="locate" size={22} color="#0b4f9c" />
            </Pressable>
          )}
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

      {/* El combate se monta solo mientras está abierto, así el canal de Realtime se cierra al salir */}
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
  root: { flex: 1, backgroundColor: '#0b1030' },
  tools: { position: 'absolute', right: 14, top: 170, gap: 10 },
  tool: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  toolOn: { backgroundColor: '#0b4f9c' },
  spawnBanner: {
    position: 'absolute', top: 56, left: 16, right: 16,
    backgroundColor: 'rgba(124,45,18,0.92)', padding: 12, borderRadius: 12,
  },
  spawnBannerText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '800', textTransform: 'capitalize' },
  captureBtn: { marginTop: 10, backgroundColor: '#facc15', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  captureBtnText: { color: '#713f12', fontWeight: '800', fontSize: 16 },
  banner: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)', padding: 12, borderRadius: 10,
  },
  bannerText: { color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '700' },
  spinBtn: { marginTop: 10, backgroundColor: '#facc15', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  spinBtnText: { color: '#713f12', fontWeight: '800', fontSize: 16 },
  fightBtn: { marginTop: 10, backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  fightBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
});