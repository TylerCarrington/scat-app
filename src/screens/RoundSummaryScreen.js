import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { PlayingCard } from '../components/PlayingCard';
import { HeartsDisplay } from '../components/HeartsDisplay';
import { styles } from '../styles';
import { handScore } from '../utils';

export function RoundSummaryScreen({ players, hands, knockerId, instantWinnerIdx, onNextRound, onExit }) {
  const scores = hands.map(h => handScore(h));
  const activePlayers = players.filter(p => p.lives > 0);
  const activeScores = scores.filter((_, i) => players[i].lives > 0);
  const minScore = Math.min(...activeScores);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.summaryContainer}>
        <View style={styles.screenTopBar}>
          <Text style={styles.screenTitle}>ROUND SUMMARY</Text>
          <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
            <Text style={styles.exitBtnText}>✕ EXIT</Text>
          </TouchableOpacity>
        </View>

        {players.map((player, i) => {
          const score = scores[i];
          const isWinner = i === instantWinnerIdx;
          const wasKnocker = i === knockerId;

          let lostLives = 0;
          if (instantWinnerIdx !== null) {
            if (!isWinner && player.lives > 0) lostLives = 1;
          } else {
            const isLowest = player.lives > 0 && score === minScore;
            if (wasKnocker && isLowest && activePlayers.length > 1) {
              lostLives = 2;
            } else if (isLowest) {
              lostLives = 1;
            }
          }

          return (
            <View key={i} style={[styles.summaryCard, player.lives <= 0 && styles.eliminatedCard]}>
              <View style={styles.summaryCardHeader}>
                <View style={[styles.colorDot, { backgroundColor: player.color }]} />
                <Text style={[styles.summaryPlayerName, { color: player.color }]}>{player.name}</Text>
                {isWinner && <Text style={styles.scatTag}>SCAT!</Text>}
                {wasKnocker && !isWinner && <Text style={styles.knockerTag}>KNOCKED</Text>}
                {player.lives <= 0 && <Text style={styles.eliminatedTag}>OUT</Text>}
              </View>
              <View style={styles.summaryHandRow}>
                {hands[i].map(card => (
                  <PlayingCard key={card.id} card={card} size="sm" />
                ))}
                <View style={styles.summaryScoreBadge}>
                  <Text style={styles.summaryScore}>{score === 30.5 ? '30½' : score}</Text>
                </View>
              </View>
              <View style={styles.summaryLifeRow}>
                <HeartsDisplay lives={player.lives} />
                {lostLives === 2 && <Text style={styles.lostLifeText}>−2 lives (knocked lowest!)</Text>}
                {lostLives === 1 && <Text style={styles.lostLifeText}>−1 life</Text>}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={[styles.goldButton, { marginTop: 24 }]} onPress={onNextRound}>
          <Text style={styles.goldButtonText}>NEXT ROUND</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
