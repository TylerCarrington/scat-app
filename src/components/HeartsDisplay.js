import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

export function HeartsDisplay({ lives, max = 4 }) {
  return (
    <View style={styles.heartsRow}>
      {Array.from({ length: max }).map((_, i) => (
        <Text key={i} style={[styles.heart, i < lives ? styles.heartFull : styles.heartEmpty]}>
          {i < lives ? '♥' : '♡'}
        </Text>
      ))}
    </View>
  );
}
