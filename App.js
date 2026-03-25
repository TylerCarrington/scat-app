import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
  BackHandler,
  Modal,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = ['♥', '♦'];

const PLAYER_COLORS = ['#2DD4BF', '#F87171', '#FBBF24', '#A78BFA', '#34D399', '#FB7185'];
const PLAYER_COLOR_NAMES = ['Teal', 'Coral', 'Amber', 'Violet', 'Emerald', 'Rose'];

const GOLD = '#D4A843';
const GOLD_LIGHT = '#F0C96A';
const BG_DARK = '#0F0F0F';
const BG_CARD = '#1A1A1A';
const BG_SURFACE = '#222222';
const TEXT_PRIMARY = '#F5F0E8';
const TEXT_MUTED = '#8A8070';

// ─── DECK UTILITIES ──────────────────────────────────────────────────────────
function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  return shuffle(deck);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

function handScore(hand) {
  // Three of a kind = 30.5
  const values = hand.map(c => c.rank);
  if (values[0] === values[1] && values[1] === values[2]) return 30.5;
  // Best same-suit total
  let best = 0;
  for (const suit of SUITS) {
    const suitCards = hand.filter(c => c.suit === suit);
    const total = suitCards.reduce((s, c) => s + cardValue(c), 0);
    if (total > best) best = total;
  }
  return best;
}

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────
function PlayingCard({ card, size = 'md', selected, onPress, faceDown }) {
  const sizes = {
    sm: { w: 44, h: 62, rankFont: 10, suitFont: 14 },
    md: { w: 64, h: 90, rankFont: 14, suitFont: 22 },
    lg: { w: 80, h: 112, rankFont: 18, suitFont: 28 },
  };
  const s = sizes[size];
  const isRed = card && RED_SUITS.includes(card.suit);

  if (faceDown) {
    return (
      <View style={[styles.cardBase, { width: s.w, height: s.h }, styles.cardFaceDown]}>
        <View style={styles.cardBackPattern}>
          <Text style={{ color: GOLD, fontSize: 18 }}>♠</Text>
        </View>
      </View>
    );
  }

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

// ─── HEARTS DISPLAY ──────────────────────────────────────────────────────────
function HeartsDisplay({ lives, max = 4 }) {
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

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// HOME SCREEN
function HomeScreen({ onNewGame }) {
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

// PLAYER SETUP SCREEN
function PlayerSetupScreen({ onStartGame, onExit }) {
  const [numPlayers, setNumPlayers] = useState(3);
  const [names, setNames] = useState(
    PLAYER_COLORS.map((_, i) => `Player ${i + 1}`)
  );

  const updateName = (idx, val) => {
    const n = [...names];
    n[idx] = val;
    setNames(n);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screenTopBar}>
        <Text style={styles.screenTitle}>PLAYER SETUP</Text>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>✕ BACK</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.setupContainer}>

        <View style={styles.stepperRow}>
          <Text style={styles.stepperLabel}>Players</Text>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setNumPlayers(Math.max(2, numPlayers - 1))}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{numPlayers}</Text>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setNumPlayers(Math.min(6, numPlayers + 1))}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {Array.from({ length: numPlayers }).map((_, i) => (
          <View key={i} style={styles.playerRow}>
            <View style={[styles.colorBadge, { backgroundColor: PLAYER_COLORS[i] }]}>
              <Text style={styles.colorBadgeText}>{i + 1}</Text>
            </View>
            <TextInput
              style={styles.nameInput}
              value={names[i]}
              onChangeText={v => updateName(i, v)}
              placeholderTextColor={TEXT_MUTED}
              maxLength={16}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.goldButton, { marginTop: 32 }]}
          onPress={() =>
            onStartGame(
              Array.from({ length: numPlayers }).map((_, i) => ({
                name: names[i] || `Player ${i + 1}`,
                color: PLAYER_COLORS[i],
                lives: 4,
              }))
            )
          }
        >
          <Text style={styles.goldButtonText}>START GAME</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// TURN GATE SCREEN
function TurnGateScreen({ player, onReveal, onExit }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screenTopBar}>
        <TouchableOpacity onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>✕ EXIT</Text>
        </TouchableOpacity>
      </View>
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
        <TouchableOpacity
          style={[styles.goldButton, { borderColor: player.color }]}
          onPress={onReveal}
        >
          <Text style={styles.goldButtonText}>REVEAL CARDS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// GAME BOARD SCREEN
function GameBoardScreen({ player, hand, topDiscard, stockCount, onDraw, onPickUp, onKnock, onDiscard, mustDiscard, hasKnocked, knockerName, onExit }) {
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
        {/* Top bar with exit */}
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

        {/* Piles */}
        <View style={styles.pilesRow}>
          {/* Stock pile — tap to draw */}
          <View style={styles.pileArea}>
            <TouchableOpacity
              onPress={!mustDiscard ? onDraw : undefined}
              activeOpacity={mustDiscard ? 1 : 0.7}
              style={styles.stackedCardWrapper}
            >
              {stockCount > 1 && <View style={[styles.cardBase, styles.cardFaceDown, styles.stackShadow2]} />}
              {stockCount > 0 && <View style={[styles.cardBase, styles.cardFaceDown, styles.stackShadow1]} />}
              <View style={[
                styles.cardBase,
                styles.cardFaceDown,
                styles.pileTopCard,
                !mustDiscard && styles.pileTappable,
              ]}>
                <Text style={{ color: GOLD, fontSize: 20 }}>♠</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.pileLabel}>STOCK ({stockCount})</Text>
            {!mustDiscard && <Text style={styles.pileTapHint}>tap to draw</Text>}
          </View>

          {/* Discard pile — tap to pick up */}
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

        {/* Actions */}
        {!mustDiscard ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.knockBtn]} onPress={onKnock}>
              <Text style={styles.knockBtnText}>KNOCK</Text>
            </TouchableOpacity>
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

        {/* Hand */}
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

// ROUND SUMMARY SCREEN
function RoundSummaryScreen({ players, hands, knockerId, onNextRound, onExit }) {
  const scores = hands.map(h => handScore(h));
  const minScore = Math.min(...scores.filter((_, i) => players[i].lives > 0));

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
          const isLowest = score === minScore;
          const wasKnocker = i === knockerId;
          const lostTwo = wasKnocker && isLowest && players.filter(p => p.lives > 0).length > 1;
          const lostLife = isLowest && player.lives > 0;

          return (
            <View key={i} style={[styles.summaryCard, player.lives <= 0 && styles.eliminatedCard]}>
              <View style={styles.summaryCardHeader}>
                <View style={[styles.colorDot, { backgroundColor: player.color }]} />
                <Text style={[styles.summaryPlayerName, { color: player.color }]}>{player.name}</Text>
                {wasKnocker && <Text style={styles.knockerTag}>KNOCKED</Text>}
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
                {lostTwo && <Text style={styles.lostLifeText}>−2 lives (knocked lowest!)</Text>}
                {lostLife && !lostTwo && <Text style={styles.lostLifeText}>−1 life</Text>}
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

// GAME OVER SCREEN
function GameOverScreen({ winner, onPlayAgain }) {
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

// ─── EXIT CONFIRMATION MODAL ─────────────────────────────────────────────────
function ExitConfirmModal({ visible, onConfirm, onCancel }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>EXIT GAME?</Text>
          <Text style={styles.modalBody}>
            Your current game will be lost. Return to the main menu?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel}>
              <Text style={styles.modalCancelText}>STAY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={onConfirm}>
              <Text style={styles.modalConfirmText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home'); // home | setup | gate | board | summary | gameover
  const [showExitModal, setShowExitModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [dealerIdx, setDealerIdx] = useState(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [hands, setHands] = useState([]);
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [knockerId, setKnockerId] = useState(null);
  const [knockRound, setKnockRound] = useState(false); // others taking last turn
  const [knockTurnsLeft, setKnockTurnsLeft] = useState(0);
  const [mustDiscard, setMustDiscard] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [instantWinnerIdx, setInstantWinnerIdx] = useState(null);

  // ── Back button handling
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home') return false; // let OS handle (exit app)
      setShowExitModal(true);
      return true; // consume the event
    });
    return () => sub.remove();
  }, [screen]);

  // ── Start new game
  const handleStartGame = useCallback((setupPlayers) => {
    setPlayers(setupPlayers);
    setDealerIdx(0);
    startRound(setupPlayers, 0);
  }, []);

  // ── Start a round
  const startRound = (currentPlayers, dealer) => {
    const activePlayers = currentPlayers.filter(p => p.lives > 0);
    if (activePlayers.length < 2) return; // should not happen here

    const newDeck = buildDeck();
    const newHands = currentPlayers.map(() => []);

    // Deal 3 cards each (only to active)
    let di = 0;
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < currentPlayers.length; i++) {
        if (currentPlayers[i].lives > 0) {
          newHands[i].push(newDeck[di++]);
        }
      }
    }

    const firstDiscard = newDeck[di++];
    const remaining = newDeck.slice(di);

    setHands(newHands);
    setDeck(remaining);
    setDiscardPile([firstDiscard]);
    setKnockerId(null);
    setKnockRound(false);
    setKnockTurnsLeft(0);
    setMustDiscard(false);
    setRoundOver(false);
    setInstantWinnerIdx(null);

    // First turn = player after dealer
    const firstIdx = nextActiveIdx(currentPlayers, dealer);
    setCurrentPlayerIdx(firstIdx);
    setScreen('gate');
  };

  // ── Helpers
  const nextActiveIdx = (plist, from) => {
    let idx = (from + 1) % plist.length;
    while (plist[idx].lives <= 0) idx = (idx + 1) % plist.length;
    return idx;
  };

  const activePlayers = players.filter(p => p.lives > 0);

  // ── Draw from stock
  const handleDraw = () => {
    if (deck.length === 0) return;
    const [drawn, ...rest] = deck;
    const newHands = hands.map((h, i) =>
      i === currentPlayerIdx ? [...h, drawn] : h
    );
    setDeck(rest);
    setHands(newHands);
    setMustDiscard(true);
    // Check 31
    if (handScore(newHands[currentPlayerIdx]) === 31) {
      endRound(newHands, currentPlayerIdx);
    }
  };

  // ── Pick up discard
  const handlePickUp = () => {
    if (discardPile.length === 0) return;
    const top = discardPile[discardPile.length - 1];
    const newDiscard = discardPile.slice(0, -1);
    const newHands = hands.map((h, i) =>
      i === currentPlayerIdx ? [...h, top] : h
    );
    setDiscardPile(newDiscard);
    setHands(newHands);
    setMustDiscard(true);
    if (handScore(newHands[currentPlayerIdx]) === 31) {
      endRound(newHands, currentPlayerIdx);
    }
  };

  // ── Discard a card
  const handleDiscard = (cardIdx) => {
    const newHands = hands.map((h, i) => {
      if (i !== currentPlayerIdx) return h;
      return h.filter((_, ci) => ci !== cardIdx);
    });
    setHands(newHands);
    setMustDiscard(false);
    const discarded = hands[currentPlayerIdx][cardIdx];
    setDiscardPile([...discardPile, discarded]);

    if (roundOver) {
      triggerSummary(newHands, instantWinnerIdx);
      return;
    }

    if (knockRound) {
      const remaining = knockTurnsLeft - 1;
      if (remaining <= 0) {
        triggerSummary(newHands);
      } else {
        setKnockTurnsLeft(remaining);
        advanceTurn(newHands, remaining > 0);
      }
    } else {
      advanceTurn(newHands, true);
    }
  };

  // ── Knock
  const handleKnock = () => {
    setKnockerId(currentPlayerIdx);
    // Count remaining active players (excluding knocker)
    const othersCount = players.filter((p, i) => p.lives > 0 && i !== currentPlayerIdx).length;
    setKnockRound(true);
    setKnockTurnsLeft(othersCount);
    advanceTurn(hands, true, true);
  };

  const advanceTurn = (currentHands, stillGoing, justKnocked = false) => {
    if (!stillGoing) {
      triggerSummary(currentHands);
      return;
    }
    const nextIdx = nextActiveIdx(players, currentPlayerIdx);
    setCurrentPlayerIdx(nextIdx);
    setScreen('gate');
  };

  const endRound = (currentHands, winnerIdx) => {
    setRoundOver(true);
    setInstantWinnerIdx(winnerIdx ?? null);
    triggerSummary(currentHands, winnerIdx ?? null);
  };

  const triggerSummary = (finalHands, instantWinnerIdx = null) => {
    let updatedPlayers;

    if (instantWinnerIdx !== null) {
      // Instant 31 win — every OTHER active player loses 1 life
      updatedPlayers = players.map((p, i) => {
        if (p.lives <= 0) return p;          // already out
        if (i === instantWinnerIdx) return p; // winner loses nothing
        return { ...p, lives: Math.max(0, p.lives - 1) };
      });
    } else {
      // Normal round end — find the lowest score among active players
      const scores = finalHands.map((h, i) =>
        players[i].lives > 0 ? handScore(h) : Infinity
      );
      const activeScores = scores.filter(s => s !== Infinity);
      const minScore = Math.min(...activeScores);
      const knocker = knockerId;

      updatedPlayers = players.map((p, i) => {
        if (p.lives <= 0) return p;
        const isLowest = scores[i] === minScore;
        const wasKnocker = i === knocker;
        const lostTwo = wasKnocker && isLowest && activePlayers.length > 1;
        const lostOne = isLowest && !lostTwo;
        let newLives = p.lives;
        if (lostTwo) newLives = Math.max(0, newLives - 2);
        else if (lostOne) newLives = Math.max(0, newLives - 1);
        return { ...p, lives: newLives };
      });
    }

    setPlayers(updatedPlayers);
    setScreen('summary');
  };

  // ── Next round / game over check
  const handleNextRound = () => {
    const stillAlive = players.filter(p => p.lives > 0);
    if (stillAlive.length === 1) {
      setScreen('gameover');
      return;
    }
    const newDealer = nextActiveIdx(players, dealerIdx);
    setDealerIdx(newDealer);
    startRound(players, newDealer);
  };

  // ── Exit to home
  const handleExitToHome = () => {
    setShowExitModal(false);
    setScreen('home');
    setPlayers([]);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  const inGame = ['gate', 'board', 'summary'].includes(screen);

  if (screen === 'home') {
    return <HomeScreen onNewGame={() => setScreen('setup')} />;
  }

  if (screen === 'setup') {
    return (
      <>
        <PlayerSetupScreen onStartGame={handleStartGame} onExit={() => setShowExitModal(true)} />
        <ExitConfirmModal
          visible={showExitModal}
          onConfirm={handleExitToHome}
          onCancel={() => setShowExitModal(false)}
        />
      </>
    );
  }

  if (screen === 'gate') {
    return (
      <>
        <TurnGateScreen
          player={players[currentPlayerIdx]}
          onReveal={() => setScreen('board')}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal
          visible={showExitModal}
          onConfirm={handleExitToHome}
          onCancel={() => setShowExitModal(false)}
        />
      </>
    );
  }

  if (screen === 'board') {
    const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
    return (
      <>
        <GameBoardScreen
          player={players[currentPlayerIdx]}
          hand={hands[currentPlayerIdx] || []}
          topDiscard={topDiscard}
          stockCount={deck.length}
          onDraw={handleDraw}
          onPickUp={handlePickUp}
          onKnock={handleKnock}
          onDiscard={handleDiscard}
          mustDiscard={mustDiscard}
          hasKnocked={knockRound}
          knockerName={knockerId !== null ? players[knockerId]?.name : ''}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal
          visible={showExitModal}
          onConfirm={handleExitToHome}
          onCancel={() => setShowExitModal(false)}
        />
      </>
    );
  }

  if (screen === 'summary') {
    return (
      <>
        <RoundSummaryScreen
          players={players}
          hands={hands}
          knockerId={knockerId}
          onNextRound={handleNextRound}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal
          visible={showExitModal}
          onConfirm={handleExitToHome}
          onCancel={() => setShowExitModal(false)}
        />
      </>
    );
  }

  if (screen === 'gameover') {
    const winner = players.find(p => p.lives > 0);
    return <GameOverScreen winner={winner} onPlayAgain={() => setScreen('home')} />;
  }

  return null;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DARK,
    paddingTop: STATUSBAR_HEIGHT,
  },

  // ── EXIT BUTTON & TOP BAR ──
  screenTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  exitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1A1A1A',
  },
  exitBtnText: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'Georgia',
  },

  // ── MODAL ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalBox: {
    backgroundColor: BG_SURFACE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GOLD,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  modalBody: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Georgia',
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  modalCancelText: {
    color: TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#3A0000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  modalConfirmText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },

  // ── CARD ──
  cardBase: {
    backgroundColor: '#FAFAF7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cardFaceDown: {
    backgroundColor: '#1A1A2E',
    borderColor: GOLD,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackPattern: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: 4,
    margin: 2,
  },
  cardSelected: {
    borderColor: GOLD,
    borderWidth: 3,
    transform: [{ translateY: -10 }],
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 12,
  },
  cardCornerText: {
    position: 'absolute',
    top: 3,
    left: 4,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  cardCornerSuit: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  cardCenter: {
    fontWeight: '400',
    fontFamily: 'Georgia',
  },

  // ── HEARTS ──
  heartsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  heart: {
    fontSize: 16,
  },
  heartFull: {
    color: '#EF4444',
  },
  heartEmpty: {
    color: '#444',
  },

  // ── SHARED ──
  goldButton: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  goldButtonText: {
    color: '#0F0F0F',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  screenTitle: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 20,
  },

  // ── HOME ──
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  homeLogoArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  aceSpadesCard: {
    width: 90,
    height: 120,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  aceSpadesSuit: {
    fontSize: 40,
    color: '#F5F0E8',
    fontFamily: 'Georgia',
  },
  aceSpadesNum: {
    fontSize: 22,
    color: GOLD,
    fontWeight: '800',
    fontFamily: 'Georgia',
    letterSpacing: 2,
  },
  homeTitle: {
    fontSize: 52,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 12,
    fontFamily: 'Georgia',
  },
  homeSubtitle: {
    fontSize: 14,
    color: GOLD,
    letterSpacing: 6,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  homeDecorLine: {
    width: 120,
    height: 2,
    backgroundColor: GOLD,
    marginVertical: 20,
    opacity: 0.7,
  },
  homeTagline: {
    color: TEXT_MUTED,
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 40,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  homeRulesBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: BG_SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    width: '100%',
  },
  homeRulesTitle: {
    color: GOLD,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  homeRulesText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },

  // ── SETUP ──
  setupContainer: {
    padding: 24,
    paddingTop: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG_SURFACE,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  stepperLabel: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: '#0F0F0F',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  stepperValue: {
    color: GOLD,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Georgia',
    minWidth: 28,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  colorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBadgeText: {
    color: '#0F0F0F',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  nameInput: {
    flex: 1,
    backgroundColor: BG_SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    color: TEXT_PRIMARY,
    fontSize: 16,
    padding: 12,
    fontFamily: 'Georgia',
  },

  // ── GATE ──
  gateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  gateDecor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BG_SURFACE,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  gateCardSymbol: {
    fontSize: 36,
    color: GOLD,
    fontFamily: 'Georgia',
  },
  gateLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    letterSpacing: 4,
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  gateBadge: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  gatePlayerName: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Georgia',
    letterSpacing: 2,
  },
  gateInstructions: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 24,
    lineHeight: 22,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },

  // ── BOARD ──
  boardContainer: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  boardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: BG_SURFACE,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  boardRightCluster: {
    alignItems: 'flex-end',
    gap: 8,
  },
  boardPlayerName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Georgia',
    letterSpacing: 1,
  },
  boardScoreBadge: {
    alignItems: 'center',
    backgroundColor: BG_CARD,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: GOLD,
    minWidth: 64,
  },
  boardScoreLabel: {
    color: TEXT_MUTED,
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  boardScoreValue: {
    color: GOLD,
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  knockBanner: {
    backgroundColor: '#2A1A00',
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  knockBannerText: {
    color: GOLD_LIGHT,
    fontSize: 13,
    fontFamily: 'Georgia',
    letterSpacing: 1,
  },
  pilesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
    padding: 16,
    backgroundColor: BG_SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  pileArea: {
    alignItems: 'center',
    gap: 8,
  },
  stackedCardWrapper: {
    width: 64,
    height: 90,
    position: 'relative',
  },
  pileTopCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackShadow1: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 64,
    height: 90,
    opacity: 0.7,
  },
  stackShadow2: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 64,
    height: 90,
    opacity: 0.4,
  },
  emptyPile: {
    width: 64,
    height: 90,
    backgroundColor: '#1A1A1A',
    borderStyle: 'dashed',
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPileText: {
    color: '#444',
    fontSize: 8,
    letterSpacing: 1,
  },
  pileLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  pileTappable: {
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pileTapHint: {
    color: GOLD,
    fontSize: 9,
    letterSpacing: 1,
    fontFamily: 'Georgia',
    opacity: 0.7,
    marginTop: -2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: BG_SURFACE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD,
  },
  actionBtnDisabled: {
    borderColor: '#333',
    opacity: 0.4,
  },
  actionBtnText: {
    color: GOLD,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  knockBtn: {
    backgroundColor: '#2A1400',
    borderColor: '#FF8C00',
  },
  knockBtnText: {
    color: '#FF8C00',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: 'Georgia',
  },
  discardInstruction: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  discardInstructionText: {
    color: GOLD_LIGHT,
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  handSection: {
    backgroundColor: BG_SURFACE,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
  },
  handLabel: {
    color: TEXT_MUTED,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  handRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },

  // ── SUMMARY ──
  summaryContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: BG_SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  eliminatedCard: {
    opacity: 0.45,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryPlayerName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    flex: 1,
  },
  knockerTag: {
    backgroundColor: '#2A1400',
    color: '#FF8C00',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: 'Georgia',
  },
  eliminatedTag: {
    backgroundColor: '#2A0000',
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontFamily: 'Georgia',
  },
  summaryHandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryScoreBadge: {
    backgroundColor: BG_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  summaryScore: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Georgia',
  },
  summaryLifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lostLifeText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },

  // ── GAME OVER ──
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  gameOverEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  gameOverLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    letterSpacing: 6,
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  gameOverBadge: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  gameOverName: {
    fontSize: 36,
    fontWeight: '800',
    fontFamily: 'Georgia',
    letterSpacing: 2,
  },
  gameOverSub: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    marginBottom: 12,
  },
});