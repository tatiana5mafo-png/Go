import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  current: number;
  max: number;
  label?: string;
  showText?: boolean;
}

export default function HealthBar({ current, max, label = 'HP', showText = true }: Props) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  let fillColor = '#49C16D'; // Verde por defecto
  if (percentage <= 25) fillColor = '#EE1515'; // Rojo
  else if (percentage <= 55) fillColor = '#FF8C32'; // Naranja

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: fillColor }]} />
      </View>
      {showText ? (
        <Text style={styles.text}>
          {label}: {current} / {max}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  barBackground: {
    height: 14,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  text: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textAlign: 'right',
  },
});
