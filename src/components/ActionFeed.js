import React from 'react';
import { View, Text } from 'react-native';
import { GOLD } from '../constants';
import { styles } from '../styles';
import { formatActionLine } from '../utils';

export function ActionFeed({ actions, players }) {
  if (!actions || actions.length === 0) return null;

  return (
    <View style={styles.feedContainer}>
      <Text style={styles.feedTitle}>SINCE YOUR LAST TURN</Text>
      {actions.map((action, i) => {
        const player = players[action.playerIdx];
        const isKnock = action.type === 'knock';
        return (
          <View key={i} style={styles.feedRow}>
            <View style={[styles.feedDot, { backgroundColor: player?.color ?? GOLD }]} />
            <Text style={[styles.feedText, isKnock && styles.feedTextKnock]}>
              {formatActionLine(action, players)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
