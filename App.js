import React, { useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

// Import constants, utilities, and styles
import { SCREEN_NAMES } from './src/constants';
import {
  buildDeck,
  handScore,
  appendAction,
  stampWatermark,
  nextActiveIdx,
  getActionsForPlayer,
  createReshuffledDeck,
} from './src/utils';
import { getSavedPlayers, savePlayers, clearSavedPlayers } from './src/storage';
import { styles } from './src/styles';

// Import screen components
import { HomeScreen } from './src/screens/HomeScreen';
import { PlayerSetupScreen } from './src/screens/PlayerSetupScreen';
import { TurnGateScreen } from './src/screens/TurnGateScreen';
import { GameBoardScreen } from './src/screens/GameBoardScreen';
import { ScatSplashScreen } from './src/screens/ScatSplashScreen';
import { RoundSummaryScreen } from './src/screens/RoundSummaryScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';

// Import UI components
import { ExitConfirmModal } from './src/components/ExitConfirmModal';

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(SCREEN_NAMES.HOME);
  const [showExitModal, setShowExitModal] = useState(false);
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState(null);
  const [dealerIdx, setDealerIdx] = useState(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [hands, setHands] = useState([]);
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [knockerId, setKnockerId] = useState(null);
  const [knockRound, setKnockRound] = useState(false);
  const [knockTurnsLeft, setKnockTurnsLeft] = useState(0);
  const [mustDiscard, setMustDiscard] = useState(false);
  const [roundOver, setRoundOver] = useState(false);
  const [instantWinnerIdx, setInstantWinnerIdx] = useState(null);
  const [finalHands, setFinalHands] = useState([]);

  // ── Action history state
  // actionLog: flat array of { playerIdx, type, card? } for the whole round
  // watermarks: actionLog index per player — they see log[watermark[i]..] when their turn arrives
  const [actionLog, setActionLog] = useState([]);
  const [watermarks, setWatermarks] = useState([]);

  // Load saved players on app startup
  useEffect(() => {
    const loadSavedPlayers = async () => {
      const saved = await getSavedPlayers();
      setSavedPlayers(saved);
    };
    loadSavedPlayers();
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === SCREEN_NAMES.HOME) return false;
      setShowExitModal(true);
      return true;
    });
    return () => sub.remove();
  }, [screen]);

  const handleStartGame = useCallback((setupPlayers) => {
    setPlayers(setupPlayers);
    setDealerIdx(0);
    // Save player settings for next time
    savePlayers(setupPlayers);
    // Update savedPlayers state to stay in sync
    setSavedPlayers({
      playerCount: setupPlayers.length,
      names: setupPlayers.map(p => p.name),
      colors: setupPlayers.map(p => p.color),
    });
    startRound(setupPlayers, 0);
  }, []);

  const startRound = (currentPlayers, dealer) => {
    const newDeck = buildDeck();
    const newHands = currentPlayers.map(() => []);

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
    setFinalHands([]);

    // Reset action log — empty log, watermarks all at 0 (see everything from start)
    setActionLog([]);
    setWatermarks(currentPlayers.map(() => 0));

    const firstIdx = nextActiveIdx(currentPlayers, dealer);
    setCurrentPlayerIdx(firstIdx);
    setScreen(SCREEN_NAMES.GATE);
  };

  // ── Draw from stock
  const handleDraw = () => {
    let currentDeck = deck;
    let currentLog = actionLog;

    // Reshuffle if stock is empty
    if (currentDeck.length === 0) {
      const reshuffled = createReshuffledDeck(hands, discardPile);
      if (reshuffled.length === 0) return; // No cards available to reshuffle
      
      currentDeck = reshuffled;
      setDeck(reshuffled);
      
      // Log the reshuffle action
      currentLog = appendAction(actionLog, currentPlayerIdx, 'reshuffle');
      setActionLog(currentLog);
    }

    const [drawn, ...rest] = currentDeck;
    const newHands = hands.map((h, i) =>
      i === currentPlayerIdx ? [...h, drawn] : h
    );
    setDeck(rest);
    setHands(newHands);

    const newLog = appendAction(currentLog, currentPlayerIdx, 'draw_stock');
    setActionLog(newLog);

    if (handScore(newHands[currentPlayerIdx]) === 31) {
      endRound(newHands, currentPlayerIdx, newLog);
    } else {
      setMustDiscard(true);
    }
  };

  // ── Pick up from discard pile
  const handlePickUp = () => {
    if (discardPile.length === 0) return;
    const top = discardPile[discardPile.length - 1];
    const newDiscard = discardPile.slice(0, -1);
    const newHands = hands.map((h, i) =>
      i === currentPlayerIdx ? [...h, top] : h
    );
    setDiscardPile(newDiscard);
    setHands(newHands);

    const newLog = appendAction(actionLog, currentPlayerIdx, 'pickup_discard', top);
    setActionLog(newLog);

    if (handScore(newHands[currentPlayerIdx]) === 31) {
      endRound(newHands, currentPlayerIdx, newLog);
    } else {
      setMustDiscard(true);
    }
  };

  // ── Discard a card from hand
  const handleDiscard = (cardIdx) => {
    const discarded = hands[currentPlayerIdx][cardIdx];
    const newHands = hands.map((h, i) => {
      if (i !== currentPlayerIdx) return h;
      return h.filter((_, ci) => ci !== cardIdx);
    });
    setHands(newHands);
    setMustDiscard(false);
    setDiscardPile([...discardPile, discarded]);

    const newLog = appendAction(actionLog, currentPlayerIdx, 'discard', discarded);
    setActionLog(newLog);

    // Check if this player now has 31 after discarding
    if (handScore(newHands[currentPlayerIdx]) === 31) {
      endRound(newHands, currentPlayerIdx, newLog);
      return;
    }

    if (roundOver) {
      triggerSummary(newHands, instantWinnerIdx, newLog);
      return;
    }

    if (knockRound) {
      const remaining = knockTurnsLeft - 1;
      if (remaining <= 0) {
        triggerSummary(newHands, null, newLog);
      } else {
        setKnockTurnsLeft(remaining);
        advanceTurn(currentPlayerIdx, newLog);
      }
    } else {
      advanceTurn(currentPlayerIdx, newLog);
    }
  };

  // ── Knock
  const handleKnock = () => {
    const newLog = appendAction(actionLog, currentPlayerIdx, 'knock');
    setActionLog(newLog);
    setKnockerId(currentPlayerIdx);
    const othersCount = players.filter((p, i) => p.lives > 0 && i !== currentPlayerIdx).length;
    setKnockRound(true);
    setKnockTurnsLeft(othersCount);
    advanceTurn(currentPlayerIdx, newLog);
  };

  // Stamp this player's watermark at end of log, then move to next player
  const advanceTurn = (finishedPlayerIdx, currentLog) => {
    const newWatermarks = stampWatermark(finishedPlayerIdx, currentLog.length, watermarks);
    setWatermarks(newWatermarks);

    const nextIdx = nextActiveIdx(players, finishedPlayerIdx);
    setCurrentPlayerIdx(nextIdx);
    setScreen(SCREEN_NAMES.GATE);
  };

  const endRound = (currentHands, winnerIdx, currentLog) => {
    setRoundOver(true);
    setInstantWinnerIdx(winnerIdx ?? null);
    setFinalHands(currentHands);
    setActionLog(currentLog);
    setScreen(SCREEN_NAMES.SCAT);
  };

  const triggerSummary = (finalHandsArg, winnerIdx = null) => {
    const activePlayers = players.filter(p => p.lives > 0);
    let updatedPlayers;

    if (winnerIdx !== null) {
      // Scat: every other active player loses 1 life
      updatedPlayers = players.map((p, i) => {
        if (p.lives <= 0 || i === winnerIdx) return p;
        return { ...p, lives: Math.max(0, p.lives - 1) };
      });
    } else {
      // Normal: lowest score loses (or knocker loses 2 if they had the lowest)
      const scores = finalHandsArg.map((h, i) =>
        players[i].lives > 0 ? handScore(h) : Infinity
      );
      const minScore = Math.min(...scores.filter(s => s !== Infinity));
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
    setScreen(SCREEN_NAMES.SUMMARY);
  };

  const handleNextRound = () => {
    const stillAlive = players.filter(p => p.lives > 0);
    if (stillAlive.length === 1) {
      setScreen(SCREEN_NAMES.GAMEOVER);
      return;
    }
    const newDealer = nextActiveIdx(players, dealerIdx);
    setDealerIdx(newDealer);
    startRound(players, newDealer);
  };

  const handleExitToHome = async () => {
    setShowExitModal(false);
    setScreen(SCREEN_NAMES.SETUP);
    setPlayers([]);
    // Reload saved players to ensure fresh state when returning to setup
    const saved = await getSavedPlayers();
    setSavedPlayers(saved);
  };

  const handleResetPlayers = async () => {
    await clearSavedPlayers();
    setSavedPlayers(null);
  };

  // Build the action feed for the upcoming player at the gate screen
  const buildFeedFor = (playerIdx) => {
    const watermark = watermarks[playerIdx] ?? 0;
    return getActionsForPlayer(actionLog, watermark, playerIdx);
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  if (screen === SCREEN_NAMES.HOME) {
    return <HomeScreen onNewGame={() => setScreen(SCREEN_NAMES.SETUP)} />;
  }

  if (screen === SCREEN_NAMES.SETUP) {
    return (
      <>
        <PlayerSetupScreen onStartGame={handleStartGame} onExit={() => setShowExitModal(true)} savedPlayers={savedPlayers} onResetPlayers={handleResetPlayers} />
        <ExitConfirmModal visible={showExitModal} onConfirm={handleExitToHome} onCancel={() => setShowExitModal(false)} />
      </>
    );
  }

  if (screen === SCREEN_NAMES.GATE) {
    const feedActions = buildFeedFor(currentPlayerIdx);
    return (
      <>
        <TurnGateScreen
          player={players[currentPlayerIdx]}
          actions={feedActions}
          players={players}
          onReveal={() => setScreen(SCREEN_NAMES.BOARD)}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal visible={showExitModal} onConfirm={handleExitToHome} onCancel={() => setShowExitModal(false)} />
      </>
    );
  }

  if (screen === SCREEN_NAMES.BOARD) {
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
          knockRound={knockRound}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal visible={showExitModal} onConfirm={handleExitToHome} onCancel={() => setShowExitModal(false)} />
      </>
    );
  }

  if (screen === SCREEN_NAMES.SCAT) {
    return (
      <>
        <ScatSplashScreen
          winner={players[instantWinnerIdx]}
          hand={finalHands[instantWinnerIdx] || []}
          onContinue={() => triggerSummary(finalHands, instantWinnerIdx)}
        />
        <ExitConfirmModal visible={showExitModal} onConfirm={handleExitToHome} onCancel={() => setShowExitModal(false)} />
      </>
    );
  }

  if (screen === SCREEN_NAMES.SUMMARY) {
    const summaryHands = finalHands.length > 0 ? finalHands : hands;
    return (
      <>
        <RoundSummaryScreen
          players={players}
          hands={summaryHands}
          knockerId={knockerId}
          instantWinnerIdx={instantWinnerIdx}
          onNextRound={handleNextRound}
          onExit={() => setShowExitModal(true)}
        />
        <ExitConfirmModal visible={showExitModal} onConfirm={handleExitToHome} onCancel={() => setShowExitModal(false)} />
      </>
    );
  }

  if (screen === SCREEN_NAMES.GAMEOVER) {
    const winner = players.find(p => p.lives > 0);
    return <GameOverScreen winner={winner} onPlayAgain={() => setScreen(SCREEN_NAMES.HOME)} />;
  }

  return null;
}
