import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { ActionFeed } from '../components/ActionFeed';
import { HeartsDisplay } from '../components/HeartsDisplay';

export function TurnGateScreen({ player, actions, players, onReveal, onExit }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screenTopBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>✕ EXIT</Text>
        </TouchableOpacity>
      </View>

      <ActionFeed actions={actions} players={players} />

      <View style={styles.gateContainer}>
        <View style={styles.gateDecor}>
          <Text style={styles.gateCardSymbol}>♠</Text>
        </View>
        <Text style={styles.gateLabel}>NEXT UP</Text>
        <View style={[styles.gateBadge, { borderColor: player.color }]}>
          <Text style={[styles.gatePlayerName, { color: player.color }]}>{player.name}</Text>
        </View>
        <HeartsDisplay lives={player.lives} />
        <Text style={styles.gateInstructions}>
          Pass the device to {player.name}, then tap to reveal your cards.
        </Text>
        <TouchableOpacity style={styles.goldButton} onPress={onReveal}>
          <Text style={styles.goldButtonText}>REVEAL CARDS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
