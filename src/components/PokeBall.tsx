import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  size?: number;
  type?: 'poke' | 'great' | 'ultra';
}

export default function PokeBall({ size = 40, type = 'poke' }: Props) {
  const topColor = type === 'ultra' ? '#FFCB05' : type === 'great' ? '#2A75BB' : '#EE1515';
  const radius = size / 2;
  const innerSize = size * 0.35;
  const buttonSize = size * 0.18;

  return (
    <View style={[styles.ball, { width: size, height: size, borderRadius: radius }]}>
      {/* Mitad Superior */}
      <View style={[styles.topHalf, { backgroundColor: topColor, height: radius }]} />
      {/* Línea Central */}
      <View style={[styles.centerLine, { height: size * 0.12 }]} />
      {/* Botón Central */}
      <View
        style={[
          styles.outerRing,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: radius - innerSize / 2,
            left: radius - innerSize / 2,
          },
        ]}
      >
        <View
          style={[
            styles.innerButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  topHalf: {
    width: '100%',
  },
  centerLine: {
    width: '100%',
    backgroundColor: '#0F172A',
    position: 'absolute',
    top: '44%',
  },
  outerRing: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  innerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
});
