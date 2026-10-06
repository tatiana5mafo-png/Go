import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GameButton from '../components/GameButton';
import { POKEMON_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Props {
  onClose: () => void;
}

export default function ProfileScreen({ onClose }: Props) {
  const { profile, signOut } = useAuth();

  const teamColor = POKEMON_COLORS.teams[profile?.team || 'Valor'] || POKEMON_COLORS.teams.Valor;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧢 Tarjeta de Entrenador</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕ CERRAR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Tarjeta de Entrenador Principal */}
        <View style={[styles.trainerCard, { borderColor: teamColor }]}>
          {/* Badge del Equipo */}
          <View style={[styles.teamBadge, { backgroundColor: teamColor }]}>
            <Text style={styles.teamText}>EQUIPO {profile?.team?.toUpperCase() || 'VALOR'}</Text>
          </View>

          <View style={styles.avatarSection}>
            <View style={[styles.avatarRing, { borderColor: teamColor }]}>
              <Text style={styles.avatarEmoji}>🧢</Text>
            </View>
            <View style={styles.nameBox}>
              <Text style={styles.username}>{profile?.username || 'Entrenador'}</Text>
              <Text style={styles.userTitle}>Maestro del Campus</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>NIVEL {profile?.level || 12}</Text>
              </View>
            </View>
          </View>

          {/* Barra de Experiencia */}
          <View style={styles.expSection}>
            <View style={styles.expHeader}>
              <Text style={styles.expLabel}>EXPERIENCIA (EXP)</Text>
              <Text style={styles.expVal}>34,500 / 50,000 XP</Text>
            </View>
            <View style={styles.expBarBg}>
              <View style={[styles.expBarFill, { width: '69%', backgroundColor: teamColor }]} />
            </View>
          </View>

          {/* Recursos (Polvo Estelar / Monedas) */}
          <View style={styles.resourceRow}>
            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>✨</Text>
              <View>
                <Text style={styles.resourceVal}>{profile?.stardust || 5000}</Text>
                <Text style={styles.resourceLabel}>Polvo Estelar</Text>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>🪙</Text>
              <View>
                <Text style={styles.resourceVal}>350</Text>
                <Text style={styles.resourceLabel}>PokéMonedas</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medallas y Logros */}
        <Text style={styles.sectionTitle}>🏆 Medallas del Campus</Text>
        <View style={styles.badgesGrid}>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>🏛️</Text>
            <Text style={styles.badgeName}>Explorador</Text>
            <Text style={styles.badgeSub}>UniSabana</Text>
          </View>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>⚡</Text>
            <Text style={styles.badgeName}>Cazador</Text>
            <Text style={styles.badgeSub}>50 Pokémon</Text>
          </View>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>🏟️</Text>
            <Text style={styles.badgeName}>Campeón</Text>
            <Text style={styles.badgeSub}>Ad Portas</Text>
          </View>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>📍</Text>
            <Text style={styles.badgeName}>Visitante</Text>
            <Text style={styles.badgeSub}>10 Poképaradas</Text>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        <View style={styles.logoutSection}>
          <GameButton
            title="CERRAR SESIÓN DE ENTRENADOR"
            variant="red"
            icon="🚪"
            onPress={signOut}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
  },
  closeBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  closeText: { color: '#F8FAFC', fontWeight: '800', fontSize: 12 },
  scroll: { paddingBottom: 40 },
  trainerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  teamBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamText: { color: '#FFF', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F172A',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarEmoji: { fontSize: 44 },
  nameBox: { flex: 1 },
  username: { color: '#F8FAFC', fontSize: 24, fontWeight: '900' },
  userTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  levelBadge: {
    backgroundColor: '#FFCB05',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  levelText: { color: '#173A73', fontWeight: '900', fontSize: 12 },
  expSection: { marginBottom: 16 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  expLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800' },
  expVal: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  expBarBg: { height: 10, backgroundColor: '#0F172A', borderRadius: 5, overflow: 'hidden' },
  expBarFill: { height: '100%', borderRadius: 5 },
  resourceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resourceCard: {
    flex: 0.48,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resourceIcon: { fontSize: 24, marginRight: 10 },
  resourceVal: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  resourceLabel: { color: '#94A3B8', fontSize: 11 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 14 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  badgeCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeIcon: { fontSize: 32, marginBottom: 4 },
  badgeName: { color: '#F8FAFC', fontWeight: '800', fontSize: 14 },
  badgeSub: { color: '#38BDF8', fontSize: 11 },
  logoutSection: { marginTop: 12 },
});
