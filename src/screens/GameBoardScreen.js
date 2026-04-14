import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { PlayingCard } from '../components/PlayingCard';
import { HeartsDisplay } from '../components/HeartsDisplay';
import { styles } from '../styles';
import { handScore } from '../utils';

export function GameBoardScreen({
  player,
  hand,
  topDiscard,
  stockCount,
  onDraw,
  onPickUp,
  onKnock,
  onDiscard,
  mustDiscard,
  hasKnocked,
  knockerName,
  knockRound,
  onExit,
}) {
  const score = handScore(hand);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardTap = (idx) => {
    if (!mustDiscard) return;
    setSelectedCard(idx);
  };

  const handleDiscard = () => {
    if (selectedCard === null) return;
    onDiscard(selectedCard);
    setSelectedCard(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.boardContainer}>
        <View style={styles.boardTopBar}>
          <View>
            <Text style={[styles.boardPlayerName, { color: player.color }]}>{player.name}</Text>
            <HeartsDisplay lives={player.lives} />
          </View>
          <View style={styles.boardRightCluster}>
            <View style={styles.boardScoreBadge}>
              <Text style={styles.boardScoreLabel}>SCORE</Text>
              <Text style={styles.boardScoreValue}>{score === 30.5 ? '30½' : score}</Text>
            </View>
            <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
              <Text style={styles.exitBtnText}>✕ EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {hasKnocked && (
          <View style={styles.knockBanner}>
            <Text style={styles.knockBannerText}>
              ⚡ {knockerName} knocked! Last chance to improve.
            </Text>
          </View>
        )}

        <View style={styles.pilesRow}>
          <View style={styles.pileArea}>
            <TouchableOpacity
              onPress={!mustDiscard ? onDraw : undefined}
              activeOpacity={mustDiscard ? 1 : 0.7}
              style={styles.stackedCardWrapper}
            >
              {stockCount > 1 && <View style={[styles.cardBase, styles.cardFaceDown, styles.stackShadow2]} />}
              {stockCount > 0 && <View style={[styles.cardBase, styles.cardFaceDown, styles.stackShadow1]} />}
              <View style={[styles.cardBase, styles.cardFaceDown, styles.pileTopCard, !mustDiscard && styles.pileTappable]}>
                <Text style={{ color: '#D4A843', fontSize: 20 }}>♠</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.pileLabel}>STOCK ({stockCount})</Text>
            {!mustDiscard && <Text style={styles.pileTapHint}>tap to draw</Text>}
          </View>

          <View style={styles.pileArea}>
            {topDiscard ? (
              <PlayingCard
                card={topDiscard}
                size="md"
                onPress={!mustDiscard ? onPickUp : undefined}
              />
            ) : (
              <View style={[styles.cardBase, styles.emptyPile]}>
                <Text style={styles.emptyPileText}>EMPTY</Text>
              </View>
            )}
            <Text style={styles.pileLabel}>DISCARD</Text>
            {!mustDiscard && topDiscard && <Text style={styles.pileTapHint}>tap to pick up</Text>}
          </View>
        </View>

        {!mustDiscard ? (
          <View style={styles.actionsRow}>
            {!knockRound && (
              <TouchableOpacity style={[styles.actionBtn, styles.knockBtn]} onPress={onKnock}>
                <Text style={styles.knockBtnText}>KNOCK</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.discardInstruction}>
            <Text style={styles.discardInstructionText}>Tap a card to select, then discard it</Text>
            {selectedCard !== null && (
              <TouchableOpacity style={styles.goldButton} onPress={handleDiscard}>
                <Text style={styles.goldButtonText}>DISCARD SELECTED</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.handSection}>
          <Text style={styles.handLabel}>YOUR HAND</Text>
          <View style={styles.handRow}>
            {hand.map((card, idx) => (
              <PlayingCard
                key={card.id}
                card={card}
                size="lg"
                selected={mustDiscard && selectedCard === idx}
                onPress={mustDiscard ? () => handleCardTap(idx) : undefined}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
