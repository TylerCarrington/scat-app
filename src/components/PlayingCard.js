import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { RED_SUITS } from '../constants';
import { styles } from '../styles';

export function PlayingCard({ card, size = 'md', selected, onPress }) {
  const sizes = {
    sm: { w: 44, h: 62, rankFont: 10, suitFont: 14 },
    md: { w: 64, h: 90, rankFont: 14, suitFont: 22 },
    lg: { w: 80, h: 112, rankFont: 18, suitFont: 28 },
  };
  const s = sizes[size];
  const isRed = card && RED_SUITS.includes(card.suit);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[
        styles.cardBase,
        { width: s.w, height: s.h },
        selected && styles.cardSelected,
      ]}
    >
      <Text style={[styles.cardCornerText, { fontSize: s.rankFont, color: isRed ? '#DC2626' : '#111' }]}>
        {card.rank}
      </Text>
      <Text style={[styles.cardCornerSuit, { fontSize: s.rankFont, color: isRed ? '#DC2626' : '#111' }]}>
        {card.suit}
      </Text>
      <Text style={[styles.cardCenter, { fontSize: s.suitFont, color: isRed ? '#DC2626' : '#111' }]}>
        {card.suit}
      </Text>
    </TouchableOpacity>
  );
}
