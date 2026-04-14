import React from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { PlayingCard } from '../components/PlayingCard';
import { HeartsDisplay } from '../components/HeartsDisplay';
import { BG_DARK } from '../constants';
import { styles } from '../styles';

export function ScatSplashScreen({ winner, hand, onContinue }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      <View style={styles.scatContainer}>
        <Text style={styles.scatFireworks}>🃏</Text>
        <Text style={styles.scatTitle}>SCAT!</Text>
        <View style={[styles.scatBadge, { borderColor: winner.color }]}>
          <Text style={[styles.scatWinnerName, { color: winner.color }]}>{winner.name}</Text>
        </View>
        <Text style={styles.scatSubtitle}>hit 31!</Text>
        <View style={styles.scatHandRow}>
          {hand.map(card => (
            <PlayingCard key={card.id} card={card} size="lg" />
          ))}
        </View>
        <Text style={styles.scatNote}>All other players lose a life.</Text>
        <TouchableOpacity style={styles.goldButton} onPress={onContinue}>
          <Text style={styles.goldButtonText}>SEE RESULTS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
