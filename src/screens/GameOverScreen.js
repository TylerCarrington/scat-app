import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { HeartsDisplay } from '../components/HeartsDisplay';
import { styles } from '../styles';

export function GameOverScreen({ winner, onPlayAgain }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gameOverContainer}>
        <Text style={styles.gameOverEmoji}>🏆</Text>
        <Text style={styles.gameOverLabel}>WINNER</Text>
        <View style={[styles.gameOverBadge, { borderColor: winner.color }]}>
          <Text style={[styles.gameOverName, { color: winner.color }]}>{winner.name}</Text>
        </View>
        <Text style={styles.gameOverSub}>Last player standing!</Text>
        <HeartsDisplay lives={winner.lives} />
        <TouchableOpacity style={[styles.goldButton, { marginTop: 48 }]} onPress={onPlayAgain}>
          <Text style={styles.goldButtonText}>PLAY AGAIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
