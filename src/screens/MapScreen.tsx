import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import OutOfBoundsModal from '../components/OutOfBoundsModal';
import PokeBall from '../components/PokeBall';
import { CAMPUS_POLYGON } from '../constants/campus';
import { DEBUG_FAKE_POSITION } from '../constants/debug';
import { POKEMON_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { PokestopService } from '../services/pokestopService';
import { SpawnEngine } from '../services/spawnEngine';
import { ActiveSpawn, Gymnasium, PokeStop } from '../types';
import { isPointInPolygon } from '../utils/geofence';
import { haversineMeters } from '../utils/haversine';
import BattleScreen from './BattleScreen';
import CatchScreen from './CatchScreen';
import InventoryScreen from './InventoryScreen';
import PokedexScreen from './PokedexScreen';
import ProfileScreen from './ProfileScreen';

export default function MapScreen() {
  const { user, profile } = useAuth();
  const { position: realPosition, status } = useLocation();

  // Permite simular estar en el campus o usar GPS real
  const position = DEBUG_FAKE_POSITION ?? realPosition;

  // Estados de mapa y juego
  const [spawns, setSpawns] = useState<ActiveSpawn[]>([]);
  const [pokestops, setPokestops] = useState<PokeStop[]>([]);
  const [selectedSpawn, setSelectedSpawn] = useState<ActiveSpawn | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gymnasium | null>(null);

  // Modales de navegación
  const [showPokedex, setShowPokedex] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Cargar Poképaradas del campus al iniciar
  useEffect(() => {
    PokestopService.getPokestops().then(setPokestops);
  }, []);

  // Cargar Spawns cercanos (<= 30m) cuando cambia la posición
  useEffect(() => {
    if (position) {
      SpawnEngine.getNearbySpawns(position).then(setSpawns);
    }
  }, [position]);

  const initialRegion = useMemo(() => {
    const n = CAMPUS_POLYGON.length;
    const latitude = CAMPUS_POLYGON.reduce((s, p) => s + p.latitude, 0) / n;
    const longitude = CAMPUS_POLYGON.reduce((s, p) => s + p.longitude, 0) / n;
    return { latitude, longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 };
  }, []);

  const polygonCoords = useMemo(() => [...CAMPUS_POLYGON], []);

  // Algoritmo de Geofencing Ray-Casting Requisito 12
  const insideCampus = useMemo(
    () => (position ? isPointInPolygon(position, CAMPUS_POLYGON) : null),
    [position],
  );

  const denied = status === 'denied';
  const blocked = denied || insideCampus === false;
  const gesturesOn = !blocked;

  const teamColor = POKEMON_COLORS.teams[profile?.team || 'Valor'] || POKEMON_COLORS.teams.Valor;

  const handlePokestopTap = async (stop: PokeStop) => {
    if (!position || !user) return;

    const res = await PokestopService.spinPokestop(stop, position, user.id);
    if (res.success) {
      const itemsSummary = res.itemsReceived
        ?.map((i) => `• ${i.quantity}x ${i.itemType.toUpperCase()}`)
        .join('\n');
      Alert.alert('📍 Poképarada Girada', `${res.message}\n\nRecompensas:\n${itemsSummary}`);
    } else {
      Alert.alert('📍 Poképarada', res.message);
    }
  };

  const handleGymTap = (gym: Gymnasium) => {
    if (!position) return;
    const dist = haversineMeters(position, { latitude: gym.latitude, longitude: gym.longitude });
    if (dist > 30) {
      Alert.alert('🏟️ Gimnasio Ad Portas', `Estás a ${Math.round(dist)} m. Acércate a menos de 30 metros para combatir.`);
      return;
    }
    setSelectedGym(gym);
  };

  const handleSpawnTap = (spawn: ActiveSpawn) => {
    if (!position) return;
    const dist = haversineMeters(position, { latitude: spawn.latitude, longitude: spawn.longitude });
    if (dist > 30) {
      Alert.alert('🔴 Pokémon Salvaje', 'Estás demasiado lejos para intentar la captura (Máx 30 m).');
      return;
    }
    setSelectedSpawn(spawn);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        mapType="mutedStandard"
        showsUserLocation={status === 'granted'}
        scrollEnabled={gesturesOn}
        zoomEnabled={gesturesOn}
        rotateEnabled={gesturesOn}
        pitchEnabled={gesturesOn}
      >
        {/* Polígono del Campus UniSabana */}
        <Polygon
          coordinates={polygonCoords}
          strokeColor="#2563eb"
          strokeWidth={3}
          fillColor="rgba(37, 99, 235, 0.15)"
        />

        {/* Renderizado de Poképaradas */}
        {pokestops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.name}
            description="Poképarada Campus (<= 20m)"
            onPress={() => handlePokestopTap(stop)}
          >
            <View style={styles.stopMarkerBadge}>
              <Text style={styles.stopMarkerIcon}>📍</Text>
            </View>
          </Marker>
        ))}

        {/* Renderizado de Gimnasios */}
        <Marker
          coordinate={{ latitude: 4.862600, longitude: -74.032900 }}
          title="Gimnasio Ad Portas"
          description="Gimnasio de Combate PvP"
          onPress={() =>
            handleGymTap({
              id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              name: 'Gimnasio Ad Portas',
              latitude: 4.8626,
              longitude: -74.0329,
              controlling_team: 'Valor',
              is_active: true,
            })
          }
        >
          <View style={styles.gymMarkerBadge}>
            <Text style={styles.gymMarkerIcon}>🏟️</Text>
          </View>
        </Marker>

        {/* Renderizado de Pokémon Spawns Activos (<= 30m) */}
        {spawns.map((spawn) => (
          <Marker
            key={spawn.id}
            coordinate={{ latitude: spawn.latitude, longitude: spawn.longitude }}
            title={spawn.pokemon_base?.name || 'Pokémon'}
            onPress={() => handleSpawnTap(spawn)}
          >
            <View style={styles.spawnAuraRing}>
              <Image
                source={{ uri: spawn.pokemon_base?.front_sprite_url || 'https://img.pokemondb.net/sprites/home/normal/pikachu.png' }}
                style={styles.pkmnMarkerSprite}
                resizeMode="contain"
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header HUD Superior (Tarjeta de Entrenador Flotante) */}
      <View style={styles.topHud}>
        <TouchableOpacity
          style={styles.profileBadgeCard}
          onPress={() => setShowProfile(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.avatarCircle, { borderColor: teamColor }]}>
            <Text style={styles.avatarEmoji}>🧢</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile?.username || 'Entrenador'}</Text>
            <View style={styles.subRow}>
              <View style={[styles.levelTag, { backgroundColor: POKEMON_COLORS.yellow }]}>
                <Text style={styles.levelTagText}>NIVEL {profile?.level || 12}</Text>
              </View>
              <Text style={styles.stardustText}>✨ {profile?.stardust || 5000}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Botones de Navegación Flotantes Inferiores */}
      <View style={styles.bottomHudContainer}>
        {/* Botón Flotante Pokédex */}
        <TouchableOpacity
          style={styles.sideFab}
          onPress={() => setShowPokedex(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>📖</Text>
          <Text style={styles.fabLabel}>Pokédex</Text>
        </TouchableOpacity>

        {/* Botón Central Flotante Pokéball */}
        <TouchableOpacity
          style={styles.centerBallFab}
          onPress={() => setShowProfile(true)}
          activeOpacity={0.85}
        >
          <PokeBall size={60} type="poke" />
        </TouchableOpacity>

        {/* Botón Flotante Mochila */}
        <TouchableOpacity
          style={styles.sideFab}
          onPress={() => setShowInventory(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>🎒</Text>
          <Text style={styles.fabLabel}>Mochila</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Fuera de Límites */}
      <OutOfBoundsModal visible={blocked} reason={denied ? 'denied' : 'outside'} />

      {/* Modal del Modo de Captura con Cámara Real */}
      {selectedSpawn && (
        <Modal animationType="slide">
          <CatchScreen
            spawn={selectedSpawn}
            onClose={() => setSelectedSpawn(null)}
            onCaptured={() => {
              setSelectedSpawn(null);
              if (position) SpawnEngine.getNearbySpawns(position).then(setSpawns);
            }}
          />
        </Modal>
      )}

      {/* Modal de Pokédex */}
      {showPokedex && (
        <Modal animationType="slide">
          <PokedexScreen onClose={() => setShowPokedex(false)} />
        </Modal>
      )}

      {/* Modal de Mochila */}
      {showInventory && (
        <Modal animationType="slide">
          <InventoryScreen onClose={() => setShowInventory(false)} />
        </Modal>
      )}

      {/* Modal de Perfil de Entrenador */}
      {showProfile && (
        <Modal animationType="slide">
          <ProfileScreen onClose={() => setShowProfile(false)} />
        </Modal>
      )}

      {/* Modal de Batalla en Gimnasio Realtime */}
      {selectedGym && (
        <Modal animationType="slide">
          <BattleScreen gym={selectedGym} onClose={() => setSelectedGym(null)} />
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stopMarkerBadge: {
    padding: 6,
    backgroundColor: '#2A75BB',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 6,
  },
  stopMarkerIcon: { fontSize: 20 },
  gymMarkerBadge: {
    padding: 8,
    backgroundColor: '#EE1515',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFCB05',
    elevation: 8,
  },
  gymMarkerIcon: { fontSize: 24 },
  spawnAuraRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 203, 5, 0.25)',
    borderWidth: 1.5,
    borderColor: '#FFCB05',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pkmnMarkerSprite: { width: 50, height: 50 },
  topHud: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2A75BB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: { fontSize: 24 },
  profileDetails: { justifyContent: 'center' },
  profileName: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  levelTag: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, marginRight: 8 },
  levelTagText: { color: '#173A73', fontSize: 10, fontWeight: '900' },
  stardustText: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  bottomHudContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sideFab: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    elevation: 6,
  },
  fabIcon: { fontSize: 24 },
  fabLabel: { color: '#F8FAFC', fontWeight: '900', fontSize: 11, marginTop: 2 },
  centerBallFab: {
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
});