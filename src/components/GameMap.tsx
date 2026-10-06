import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { CAMPUS_POLYGON } from '../constants/campus';
import { LAKES } from '../constants/lake';
import { MAP_HTML } from '../map/mapHtml';
import { Coordinate, PointOfInterest } from '../types';

export type MapTheme = 'day' | 'night';

export interface MapSpawn {
  id: string;
  name: string;
  spriteUrl: string | null;
  coordinate: Coordinate;
}

export interface GameMapHandle {
  recenter: () => void;
}

interface Props {
  theme: MapTheme;
  player: Coordinate | null;
  frozen: boolean;                  // fuera de límites: el mapa se congela
  pois: readonly PointOfInterest[];
  nearPoiId: string | null;
  spawns: MapSpawn[];
  selectedSpawnId: string | null;
  bearing: number | null;           // grados de la brújula; null = norte arriba
  interactionRadiusM: number;
  onSpawnPress: (id: string) => void;
  onFollowChange: (following: boolean) => void;
}

const LOAD_TIMEOUT_MS = 20000;

const GameMap = forwardRef<GameMapHandle, Props>(function GameMap(props, ref) {
  const {
    theme, player, frozen, pois, nearPoiId, spawns, selectedSpawnId,
    bearing, interactionRadiusM, onSpawnPress, onFollowChange,
  } = props;

  const web = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const send = useCallback((msg: object) => {
    web.current?.injectJavaScript('window.__rn && window.__rn(' + JSON.stringify(msg) + '); true;');
  }, []);

  useImperativeHandle(ref, () => ({ recenter: () => send({ type: 'recenter' }) }), [send]);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: any;
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (msg.type === 'ready') { setReady(true); setFailed(false); }
      else if (msg.type === 'spawn') onSpawnPress(msg.id);
      else if (msg.type === 'follow') onFollowChange(!!msg.value);
      else if (msg.type === 'error') setFailed(true);
      else if (msg.type === 'log') console.warn('[mapa]', msg.message);
    },
    [onSpawnPress, onFollowChange],
  );

  // Si el mapa no termina de cargar (sin internet, por ejemplo), se ofrece reintentar
  useEffect(() => {
    if (ready) return;
    const id = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [ready, attempt]);

  // Datos fijos: se mandan una vez, cuando la página avisa que está lista
  useEffect(() => {
    if (!ready) return;
    send({
      type: 'init',
      theme,
      campus: CAMPUS_POLYGON,
      lakes: LAKES,
      radiusM: interactionRadiusM,
      pois: pois.map((p) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
        lat: p.coordinate.latitude,
        lng: p.coordinate.longitude,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => { if (ready) send({ type: 'theme', theme }); }, [ready, theme, send]);

  useEffect(() => {
    if (!ready || !player) return;
    send({ type: 'player', lat: player.latitude, lng: player.longitude, visible: !frozen });
  }, [ready, player, frozen, send]);

  useEffect(() => {
    if (!ready) return;
    send({
      type: 'spawns',
      selectedId: selectedSpawnId,
      items: spawns.map((s) => ({
        id: s.id,
        name: s.name,
        sprite: s.spriteUrl,
        lat: s.coordinate.latitude,
        lng: s.coordinate.longitude,
      })),
    });
  }, [ready, spawns, selectedSpawnId, send]);

  useEffect(() => { if (ready) send({ type: 'near', id: nearPoiId }); }, [ready, nearPoiId, send]);
  useEffect(() => { if (ready) send({ type: 'frozen', value: frozen }); }, [ready, frozen, send]);
  useEffect(() => { if (ready) send({ type: 'bearing', value: bearing }); }, [ready, bearing, send]);

  const retry = useCallback(() => {
    setReady(false);
    setFailed(false);
    setAttempt((a) => a + 1);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        key={attempt}
        ref={web}
        originWhitelist={['*']}
        source={{ html: MAP_HTML, baseUrl: 'https://localhost/' }}
        onMessage={onMessage}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        allowsLinkPreview={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        style={styles.web}
      />

      {!ready && !failed && (
        <View style={styles.cover}>
          <ActivityIndicator size="large" color="#7dd3fc" />
          <Text style={styles.coverText}>Cargando mapa…</Text>
        </View>
      )}

      {failed && !ready && (
        <View style={styles.cover}>
          <Text style={styles.coverText}>No se pudo cargar el mapa. Revisa tu conexión a internet.</Text>
          <Pressable style={styles.retryBtn} onPress={retry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

export default GameMap;

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#0b1030' },
  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0b1030',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 14,
  },
  coverText: { color: 'white', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  retryBtn: { backgroundColor: '#2563eb', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryText: { color: 'white', fontWeight: '800' },
});