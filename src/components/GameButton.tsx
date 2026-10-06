import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: 'yellow' | 'blue' | 'red' | 'green' | 'dark';
  icon?: string;
}

export default function GameButton({
  title,
  variant = 'yellow',
  icon,
  style,
  disabled,
  ...props
}: Props) {
  const getColors = () => {
    switch (variant) {
      case 'yellow':
        return { bg: '#FFCB05', border: '#D9A400', text: '#173A73' };
      case 'blue':
        return { bg: '#2A75BB', border: '#173A73', text: '#FFFFFF' };
      case 'red':
        return { bg: '#EE1515', border: '#990000', text: '#FFFFFF' };
      case 'green':
        return { bg: '#49C16D', border: '#2B8C48', text: '#FFFFFF' };
      case 'dark':
        return { bg: '#334155', border: '#0F172A', text: '#F8FAFC' };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.buttonDepth,
        { backgroundColor: colors.border },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <View style={[styles.buttonTop, { backgroundColor: colors.bg }]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.text, { color: colors.text }]}>{title.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonDepth: {
    borderRadius: 16,
    paddingBottom: 4, // Da el efecto 3D de profundidad al presionar
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonTop: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
