import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GameButton from '../components/GameButton';
import PokeBall from '../components/PokeBall';
import { POKEMON_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Header Pokéball */}
        <View style={styles.logoCircle}>
          <PokeBall size={64} type="poke" />
        </View>

        <Text style={styles.badge}>UNISABANA CAMPUS EDITION</Text>
        <Text style={styles.title}>POKÉMON GO</Text>
        <Text style={styles.subtitle}>Iniciar Sesión de Entrenador</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Institucional / Personal</Text>
          <TextInput
            style={styles.input}
            placeholder="entrenador@unisabana.edu.co"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.btnBox}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFCB05" />
          ) : (
            <GameButton
              title="INGRESAR AL CAMPUS"
              variant="yellow"
              icon="⚡"
              onPress={handleLogin}
            />
          )}
        </View>

        <TouchableOpacity style={styles.switchLink} onPress={onSwitchToRegister}>
          <Text style={styles.switchText}>
            ¿Eres nuevo entrenador? <Text style={styles.boldText}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#2A75BB',
    alignItems: 'center',
    shadowColor: '#2A75BB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoCircle: {
    marginBottom: 12,
    marginTop: -44,
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#2A75BB',
  },
  badge: {
    color: '#FFCB05',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 2,
  },
  title: {
    color: '#2A75BB',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FFCB05',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(238, 21, 21, 0.15)',
    borderColor: '#EE1515',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    color: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  btnBox: {
    width: '100%',
    marginTop: 8,
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  boldText: {
    color: '#FFCB05',
    fontWeight: '900',
  },
});
