import { memo } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  reason: 'outside' | 'denied';
}

// Referencia estable: no se crea una función nueva en cada render.
const noop = () => {};

function OutOfBoundsModal({ visible, reason }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={noop} // en Android, el botón "atrás" no lo cierra
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>
          {reason === 'denied' ? 'Ubicación requerida' : 'Fuera de Límites'}
        </Text>
        <Text style={styles.body}>
          {reason === 'denied'
            ? 'Activa el permiso de ubicación en Ajustes para jugar.'
            : 'Este juego solo funciona dentro del campus de la Universidad de La Sabana.'}
        </Text>
      </View>
    </Modal>
  );
}

export default memo(OutOfBoundsModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  title: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  body: { color: '#d1d5db', fontSize: 16, textAlign: 'center' },
});