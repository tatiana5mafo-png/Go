import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { POKEMON_COLORS } from '../constants/theme';

interface Props {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

export default function TypeBadge({ type, size = 'medium' }: Props) {
  const color = POKEMON_COLORS.types[type] || POKEMON_COLORS.types.Normal;

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color },
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSmall && styles.textSmall,
          isLarge && styles.textLarge,
        ]}
      >
        {type.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textSmall: {
    fontSize: 9,
  },
  textLarge: {
    fontSize: 14,
  },
});
