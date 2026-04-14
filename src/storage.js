import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLAYER_COLORS } from './constants';

const PLAYERS_STORAGE_KEY = 'scat_app_players';

/**
 * Get saved player settings from storage
 * Returns an object with { playerCount, names, colors } or null if not found
 */
export async function getSavedPlayers() {
  try {
    const data = await AsyncStorage.getItem(PLAYERS_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading saved players:', error);
    return null;
  }
}

/**
 * Save player settings to persistent storage
 * Saves the count, names, and colors to reuse on next game
 */
export async function savePlayers(players) {
  try {
    const playerData = {
      playerCount: players.length,
      names: players.map(p => p.name),
      colors: players.map(p => p.color),
    };
    await AsyncStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(playerData));
  } catch (error) {
    console.error('Error saving players:', error);
  }
}

/**
 * Get default player setup based on saved data or fallback to hardcoded defaults
 */
export function getDefaultPlayers(savedPlayers) {
  if (!savedPlayers) {
    // Fallback defaults
    return {
      playerCount: 3,
      names: Array.from({ length: 3 }).map((_, i) => `Player ${i + 1}`),
      colors: PLAYER_COLORS,
    };
  }

  return {
    playerCount: savedPlayers.playerCount,
    names: savedPlayers.names,
    colors: PLAYER_COLORS, // Always use default colors from constants
  };
}

/**
 * Clear saved player data (for testing or manual reset)
 */
export async function clearSavedPlayers() {
  try {
    await AsyncStorage.removeItem(PLAYERS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing saved players:', error);
  }
}
