import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import GameButton from '../components/GameButton';
import PokeBall from '../components/PokeBall';
import TypeBadge from '../components/TypeBadge';
import { POKEMON_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { ActiveSpawn, ItemType, ThrowQuality } from '../types';
import { attemptCatchRoll, calculateCatchProbability } from '../utils/catchProbability';
import { calculateCP } from '../utils/cpCalculator';
import { generateIVs } from '../utils/ivGenerator';
import { calculateThrow } from '../utils/throwPhysics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_X = SCREEN_WIDTH / 2;
const TARGET_Y = SCREEN_HEIGHT * 0.35;
const TARGET_RADIUS = 75;

interface Props {
  spawn: ActiveSpawn;
  onClose: () => void;
  onCaptured: () => void;
}

export default function CatchScreen({ spawn, onClose, onCaptured }: Props) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedBall, setSelectedBall] = useState<ItemType>('poke_ball');
  const [ballCount, setBallCount] = useState(25);
  const [statusText, setStatusText] = useState<string>('¡Desliza la Pokéball hacia arriba!');
  const [lastQuality, setLastQuality] = useState<ThrowQuality | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [capturedDetails, setCapturedDetails] = useState<{ cp: number; ivs: { hp: number; attack: number; defense: number } } | null>(null);

  // Animaciones balísticas
  const ballPan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const qualityOpacity = useRef(new Animated.Value(0)).current;

  // Variables del gesto de swipe
  const gestureStartTime = useRef(0);
  const gestureStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (user) {
      supabase
        .from('user_inventory')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('item_type', selectedBall)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setBallCount(data.quantity);
        });
    }
  }, [user, selectedBall]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isCapturing && ballCount > 0,
      onPanResponderGrant: (evt) => {
        gestureStartTime.current = Date.now();
        gestureStartPos.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      },
      onPanResponderMove: Animated.event([null, { dx: ballPan.x, dy: ballPan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (evt) => {
        const duration = Date.now() - gestureStartTime.current;
        const endX = evt.nativeEvent.pageX;
        const endY = evt.nativeEvent.pageY;

        processThrow(
          gestureStartPos.current.x,
          gestureStartPos.current.y,
          endX,
          endY,
          duration,
        );
      },
    }),
  ).current;

  const processThrow = async (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    durationMs: number,
  ) => {
    if (isCapturing) return;
    setIsCapturing(true);

    const throwMetrics = calculateThrow(
      startX,
      startY,
      endY,
      endX,
      durationMs,
      TARGET_X,
      TARGET_Y,
      TARGET_RADIUS,
    );

    setLastQuality(throwMetrics.quality);

    // Animación de aparición del texto de calidad de tiro
    Animated.sequence([
      Animated.timing(qualityOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(qualityOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Animación balística parabólica
    Animated.parallel([
      Animated.timing(ballPan, {
        toValue: {
          x: endX - SCREEN_WIDTH / 2,
          y: endY - SCREEN_HEIGHT + 180,
        },
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(ballScale, {
        toValue: 0.45,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if (throwMetrics.quality === 'miss') {
        setStatusText('❌ ¡Has fallado el tiro! Inténtalo de nuevo.');
        resetBall();
        return;
      }

      setStatusText(`🎯 ¡Lanzamiento ${throwMetrics.quality.toUpperCase()}! Verificando...`);

      // Descontar una Pokéball del inventario
      const newQty = Math.max(0, ballCount - 1);
      setBallCount(newQty);
      if (user) {
        await supabase
          .from('user_inventory')
          .update({ quantity: newQty })
          .eq('user_id', user.id)
          .eq('item_type', selectedBall);
      }

      // Calcular probabilidad y ejecutar la captura
      const baseCatchRate = spawn.pokemon_base?.base_catch_rate || 0.4;
      const prob = calculateCatchProbability(baseCatchRate, throwMetrics.quality, selectedBall);
      const isCaught = attemptCatchRoll(prob);

      if (isCaught) {
        const ivs = generateIVs();
        const cp = calculateCP(
          spawn.pokemon_base?.base_hp || 45,
          spawn.pokemon_base?.base_attack || 50,
          spawn.pokemon_base?.base_defense || 50,
          ivs.attack,
          ivs.defense,
          ivs.hp,
          Math.floor(Math.random() * 15) + 1,
        );

        setCapturedDetails({ cp, ivs });
        setShowCelebration(true);

        if (user && spawn.pokemon_base) {
          await supabase.from('captured_instances').insert([
            {
              user_id: user.id,
              pokemon_id: spawn.pokemon_base.id,
              level: 10,
              iv_hp: ivs.hp,
              iv_attack: ivs.attack,
              iv_defense: ivs.defense,
              cp,
              latitude: spawn.latitude,
              longitude: spawn.longitude,
            },
          ]);

          await supabase
            .from('active_spawns')
            .update({ is_captured: true })
            .eq('id', spawn.id);
        }
      } else {
        setStatusText('💨 ¡Oh no! Se ha escapado de la bola.');
        resetBall();
      }
    });
  };

  const resetBall = () => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(ballPan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
        Animated.spring(ballScale, { toValue: 1, useNativeDriver: true }),
      ]).start(() => {
        setIsCapturing(false);
      });
    }, 1200);
  };

  const getQualityBadgeColor = () => {
    if (lastQuality === 'excellent') return '#FFCB05';
    if (lastQuality === 'great') return '#2A75BB';
    if (lastQuality === 'nice') return '#49C16D';
    return '#EE1515';
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFCB05" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permTitle}>Permiso de Cámara Requerido</Text>
        <Text style={styles.permBody}>
          Para capturar Pokémon en el Campus mediante AR, necesitamos acceso a tu cámara.
        </Text>
        <GameButton title="CONCEDER PERMISO" variant="yellow" onPress={requestPermission} />
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>VOLVER AL MAPA</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vista de Cámara Nativa Requisito 21 */}
      <CameraView style={StyleSheet.absoluteFill} facing="back">
        {/* Pokémon Superpuesto en Vista 2D sobre la Cámara */}
        <View style={styles.pokemonOverlay}>
          <View style={styles.nameTag}>
            <Text style={styles.pokemonName}>{spawn.pokemon_base?.name || 'Pokémon'}</Text>
          </View>

          {/* Anillo de Target Hitbox */}
          <View style={[styles.hitboxCircle, { width: TARGET_RADIUS * 2, height: TARGET_RADIUS * 2 }]}>
            <Image
              source={{ uri: spawn.pokemon_base?.front_sprite_url || 'https://img.pokemondb.net/sprites/home/normal/pikachu.png' }}
              style={styles.pokemonSprite}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Indicador Flotante de Calidad de Lanzamiento (NICE / GREAT / EXCELLENT) */}
        {lastQuality ? (
          <Animated.View
            style={[
              styles.qualityBadge,
              { backgroundColor: getQualityBadgeColor(), opacity: qualityOpacity },
            ]}
          >
            <Text style={styles.qualityText}>{lastQuality.toUpperCase()}!</Text>
          </Animated.View>
        ) : null}

        {/* Panel Superior de Estado */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕ HUIR</Text>
          </TouchableOpacity>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        {/* Trayectoria y Selector de Pokéball Inferior */}
        <View style={styles.bottomBar}>
          {/* Selector de Tipo de Pokéball */}
          <View style={styles.ballSelectorRow}>
            <TouchableOpacity
              style={[styles.ballTypeOption, selectedBall === 'poke_ball' && styles.ballTypeActive]}
              onPress={() => setSelectedBall('poke_ball')}
            >
              <PokeBall size={32} type="poke" />
              <Text style={styles.ballOptionText}>Poké</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ballTypeOption, selectedBall === 'great_ball' && styles.ballTypeActive]}
              onPress={() => setSelectedBall('great_ball')}
            >
              <PokeBall size={32} type="great" />
              <Text style={styles.ballOptionText}>Super</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ballTypeOption, selectedBall === 'ultra_ball' && styles.ballTypeActive]}
              onPress={() => setSelectedBall('ultra_ball')}
            >
              <PokeBall size={32} type="ultra" />
              <Text style={styles.ballOptionText}>Ultra</Text>
            </TouchableOpacity>
          </View>

          {/* Objeto Lanzable Animado */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.ballContainer,
              {
                transform: [
                  { translateX: ballPan.x },
                  { translateY: ballPan.y },
                  { scale: ballScale },
                ],
              },
            ]}
          >
            <PokeBall
              size={64}
              type={selectedBall === 'ultra_ball' ? 'ultra' : selectedBall === 'great_ball' ? 'great' : 'poke'}
            />
          </Animated.View>

          <Text style={styles.ballCounter}>CANTIDAD DISPONIBLE: x{ballCount}</Text>
        </View>

        {/* Modal de Celebración / Gotcha Victory Screen */}
        {showCelebration && capturedDetails && (
          <View style={styles.celebrationOverlay}>
            <View style={styles.celebrationCard}>
              <Text style={styles.gotchaTitle}>🎉 ¡GOTCHA!</Text>
              <Text style={styles.gotchaSub}>Pokémon capturado con éxito</Text>

              <Image
                source={{ uri: spawn.pokemon_base?.animated_sprite_url || spawn.pokemon_base?.front_sprite_url }}
                style={styles.celebrationSprite}
                resizeMode="contain"
              />

              <Text style={styles.celebrationName}>{spawn.pokemon_base?.name}</Text>
              <Text style={styles.celebrationCP}>CP {capturedDetails.cp}</Text>

              <View style={styles.celebrationIvBox}>
                <Text style={styles.ivTitle}>GENÉTICA / IVs OBTENIDOS</Text>
                <Text style={styles.ivText}>
                  HP: {capturedDetails.ivs.hp}/15 • ATK: {capturedDetails.ivs.attack}/15 • DEF: {capturedDetails.ivs.defense}/15
                </Text>
              </View>

              <GameButton
                title="CONTINUAR"
                variant="yellow"
                onPress={() => {
                  setShowCelebration(false);
                  onCaptured();
                }}
              />
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 24 },
  permTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 12 },
  permBody: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  cancelBtn: { marginTop: 16 },
  cancelBtnText: { color: '#94A3B8', fontWeight: '800' },
  topBar: { position: 'absolute', top: 50, left: 16, right: 16, flexDirection: 'row', alignItems: 'center' },
  closeButton: { backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginRight: 10, borderWidth: 1.5, borderColor: '#334155' },
  closeText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  statusBox: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, borderColor: '#334155' },
  statusText: { color: '#FFCB05', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  pokemonOverlay: { position: 'absolute', top: SCREEN_HEIGHT * 0.26, left: 0, right: 0, alignItems: 'center' },
  nameTag: { backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: '#FFCB05', marginBottom: 8 },
  pokemonName: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  hitboxCircle: { borderRadius: 100, borderWidth: 3, borderColor: 'rgba(255, 203, 5, 0.7)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 203, 5, 0.1)' },
  pokemonSprite: { width: 130, height: 130 },
  qualityBadge: { position: 'absolute', top: SCREEN_HEIGHT * 0.20, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16, borderWidth: 2, borderColor: '#FFF', elevation: 10 },
  qualityText: { color: '#173A73', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  ballSelectorRow: { flexDirection: 'row', backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 6, borderRadius: 20, marginBottom: 16, borderWidth: 1.5, borderColor: '#334155' },
  ballTypeOption: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14 },
  ballTypeActive: { backgroundColor: 'rgba(255, 203, 5, 0.3)' },
  ballOptionText: { color: '#FFF', fontSize: 10, fontWeight: '800', marginTop: 2 },
  ballContainer: { marginBottom: 12 },
  ballCounter: { color: '#FFF', fontSize: 12, fontWeight: '900', backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  celebrationOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  celebrationCard: { width: '100%', maxWidth: 360, backgroundColor: '#1E293B', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#FFCB05' },
  gotchaTitle: { color: '#FFCB05', fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  gotchaSub: { color: '#F8FAFC', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  celebrationSprite: { width: 140, height: 140, marginVertical: 8 },
  celebrationName: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  celebrationCP: { color: '#38BDF8', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  celebrationIvBox: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  ivTitle: { color: '#FFCB05', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  ivText: { color: '#49C16D', fontSize: 12, fontWeight: '800' },
});
