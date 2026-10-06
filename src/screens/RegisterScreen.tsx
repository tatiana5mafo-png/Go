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
import { useAuth } from '../context/AuthContext';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: Props) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    const res = await signUp(email.trim(), password, username.trim());
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
        <View style={styles.logoCircle}>
          <PokeBall size={64} type="great" />
        </View>

        <Text style={styles.badge}>NUEVO ENTRENADOR</Text>
        <Text style={styles.title}>Registro de Cuenta</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de Entrenador</Text>
          <TextInput
            style={styles.input}
            placeholder="AshKetchumSabana"
            placeholderTextColor="#94A3B8"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@unisabana.edu.co"
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
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.btnBox}>
          {loading ? (
            <ActivityIndicator size="large" color="#49C16D" />
          ) : (
            <GameButton
              title="CREAR MI PERFIL"
              variant="green"
              icon="✨"
              onPress={handleRegister}
            />
          )}
        </View>

        <TouchableOpacity style={styles.switchLink} onPress={onSwitchToLogin}>
          <Text style={styles.switchText}>
            ¿Ya tienes cuenta? <Text style={styles.boldText}>Inicia sesión</Text>
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
    borderColor: '#49C16D',
    alignItems: 'center',
    shadowColor: '#49C16D',
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
    borderColor: '#49C16D',
  },
  badge: {
    color: '#49C16D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 2,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
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
    color: '#49C16D',
    fontWeight: '900',
  },
});
