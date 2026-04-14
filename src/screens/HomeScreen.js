import React from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { BG_DARK } from '../constants';
import { styles } from '../styles';

export function HomeScreen({ onNewGame }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BG_DARK} />
      <View style={styles.homeContainer}>
        <View style={styles.homeLogoArea}>
          <View style={styles.aceSpadesCard}>
            <Text style={styles.aceSpadesSuit}>♠</Text>
            <Text style={styles.aceSpadesNum}>31</Text>
          </View>
          <Text style={styles.homeTitle}>SCAT</Text>
          <Text style={styles.homeSubtitle}>THIRTY  ONE</Text>
        </View>
        <View style={styles.homeDecorLine} />
        <Text style={styles.homeTagline}>The card game of nerve and luck</Text>
        <TouchableOpacity style={styles.goldButton} onPress={onNewGame}>
          <Text style={styles.goldButtonText}>NEW GAME</Text>
        </TouchableOpacity>
        <View style={styles.homeRulesBox}>
          <Text style={styles.homeRulesTitle}>HOW TO PLAY</Text>
          <Text style={styles.homeRulesText}>
            Get closest to 31 with same-suit cards, or score 30.5 with three of a kind.
            Knock to end the round — just don't be lowest!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
