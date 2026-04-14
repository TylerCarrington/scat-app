import { SUITS, RANKS, RED_SUITS } from './constants';

// ─── DECK UTILITIES ──────────────────────────────────────────────────────────
export function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  return shuffle(deck);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function cardValue(card) {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

export function handScore(hand) {
  if (hand.length === 3) {
    const values = hand.map(c => c.rank);
    if (values[0] === values[1] && values[1] === values[2]) return 30.5;
  }
  let best = 0;
  for (const suit of SUITS) {
    const suitCards = hand.filter(c => c.suit === suit);
    const total = suitCards.reduce((s, c) => s + cardValue(c), 0);
    if (total > best) best = total;
  }
  return best;
}

/**
 * Create a new shuffled deck from all cards except those in players' hands
 * and the top card of the discard pile
 */
export function createReshuffledDeck(hands, discardPile) {
  // Get all cards currently in use
  const usedCards = new Set();
  
  // Add all cards from players' hands
  for (const hand of hands) {
    for (const card of hand) {
      usedCards.add(card.id);
    }
  }
  
  // Add the top card of discard pile if it exists
  if (discardPile.length > 0) {
    usedCards.add(discardPile[discardPile.length - 1].id);
  }
  
  // Build a full deck and filter out used cards
  const fullDeck = buildDeck();
  const availableCards = fullDeck.filter(card => !usedCards.has(card.id));
  
  return availableCards;
}

// ─── ACTION HISTORY ───────────────────────────────────────────────────────────
// Each action: { playerIdx, type, card? }
// Types:
//   'draw_stock'      – drew from stock pile (card is secret)
//   'pickup_discard'  – picked up from discard (card is known)
//   'discard'         – discarded a card (card is known)
//   'knock'           – knocked
//   'reshuffle'       – reshuffled remaining cards back into stock

export function formatActionLine(action, players) {
  const name = players[action.playerIdx]?.name ?? 'Someone';
  switch (action.type) {
    case 'draw_stock':
      return `${name} drew from the pile`;
    case 'pickup_discard':
      return `${name} picked up ${action.card.rank}${action.card.suit}`;
    case 'discard':
      return `${name} discarded ${action.card.rank}${action.card.suit}`;
    case 'knock':
      return `${name} knocked!`;
    case 'reshuffle':
      return `Stock was reshuffled!`;
    default:
      return '';
  }
}

// Return actions that the viewing player should see:
// - everything after their watermark
// - EXCEPT their own draw_stock (they already know what they drew from stock)
export function getActionsForPlayer(allActions, watermark, viewingPlayerIdx) {
  return allActions
    .slice(watermark)
    .filter(a => !(a.playerIdx === viewingPlayerIdx && a.type === 'draw_stock'));
}

// Append an action to the log
export function appendAction(currentLog, playerIdx, type, card = null) {
  return [...currentLog, { playerIdx, type, card }];
}

// Stamp a watermark for playerIdx at the end of the current log
export function stampWatermark(playerIdx, logLength, currentWatermarks) {
  const updated = [...currentWatermarks];
  updated[playerIdx] = logLength;
  return updated;
}

// Get the next active player index
export function nextActiveIdx(plist, from) {
  let idx = (from + 1) % plist.length;
  while (plist[idx].lives <= 0) idx = (idx + 1) % plist.length;
  return idx;
}
