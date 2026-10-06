import { CameraView, useCameraPermissions } from 'expo-camera';
import { DeviceMotion } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const SHIFT_PX = 400; // píxeles de desplazamiento por radián de inclinación

export default function CameraProbe() {
  const [permission, requestPermission] = useCameraPermissions();
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!permission?.granted) return;
    DeviceMotion.setUpdateInterval(50);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      x.setValue(-rotation.gamma * SHIFT_PX); // inclinar a la derecha mueve el sprite a la izquierda
      y.setValue(-(rotation.beta - 1.2) * SHIFT_PX); // 1.2 rad ≈ teléfono casi vertical
    });
    return () => sub.remove(); // cleanup: detiene el sensor al salir
  }, [permission?.granted, x, y]);

  if (!permission) return <View style={styles.center} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.msg}>Necesitamos la cámara para el modo captura.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      <View style={styles.overlay} pointerEvents="none">
        <Animated.View style={[styles.sprite, { transform: [{ translateX: x }, { translateY: y }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'black' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  sprite: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ef4444', borderWidth: 6, borderColor: 'white' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', padding: 24 },
  msg: { color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: 'white', fontWeight: '700' },
});