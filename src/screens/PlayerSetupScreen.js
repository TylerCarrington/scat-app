import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { PLAYER_COLORS } from '../constants';
import { styles } from '../styles';

// Extended color palette for custom selection
const ALL_COLORS = [
  '#2DD4BF', '#F87171', '#FBBF24', '#A78BFA', '#34D399', '#FB7185', // defaults
  '#06B6D4', '#EC4899', '#8B5CF6', '#6366F1', '#10B981', '#F59E0B', // extras
];

export function PlayerSetupScreen({ onStartGame, onExit, savedPlayers, onResetPlayers }) {
  const [numPlayers, setNumPlayers] = useState(savedPlayers?.playerCount || 3);
  const [names, setNames] = useState(
    savedPlayers?.names || PLAYER_COLORS.map((_, i) => `Player ${i + 1}`)
  );
  const [colors, setColors] = useState(
    savedPlayers?.colors || PLAYER_COLORS.slice(0, 3)
  );
  const [colorPickerIdx, setColorPickerIdx] = useState(null);

  // Update form when savedPlayers changes (e.g., after reset or returning from game)
  useEffect(() => {
    setNumPlayers(savedPlayers?.playerCount || 3);
    setNames(savedPlayers?.names || PLAYER_COLORS.map((_, i) => `Player ${i + 1}`));
    setColors(savedPlayers?.colors || PLAYER_COLORS.slice(0, 3));
  }, [savedPlayers]);

  // Sync colors array length with numPlayers
  useEffect(() => {
    if (colors.length < numPlayers) {
      setColors([...colors, ...PLAYER_COLORS.slice(colors.length, numPlayers)]);
    } else if (colors.length > numPlayers) {
      setColors(colors.slice(0, numPlayers));
    }
  }, [numPlayers]);

  const updateName = (idx, val) => {
    const n = [...names];
    n[idx] = val;
    setNames(n);
  };

  const selectColor = (color) => {
    const newColors = [...colors];
    newColors[colorPickerIdx] = color;
    setColors(newColors);
    setColorPickerIdx(null);
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
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setNumPlayers(Math.max(2, numPlayers - 1))}>
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{numPlayers}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setNumPlayers(Math.min(6, numPlayers + 1))}>
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.resetBtn} onPress={onResetPlayers}>
            <Text style={styles.resetBtnText}>RESET</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        {Array.from({ length: numPlayers }).map((_, i) => (
          <View key={i} style={styles.playerRow}>
            <TouchableOpacity
              style={[styles.colorBadge, { backgroundColor: colors[i] }]}
              onPress={() => setColorPickerIdx(i)}
            >
              <Text style={styles.colorBadgeText}>{i + 1}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.nameInput}
              value={names[i]}
              onChangeText={v => updateName(i, v)}
              placeholderTextColor={'#8A8070'}
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
                color: colors[i],
                lives: 4,
              }))
            )
          }
        >
          <Text style={styles.goldButtonText}>START GAME</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Color Picker Modal */}
      <Modal
        visible={colorPickerIdx !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setColorPickerIdx(null)}
      >
        <View style={styles.colorPickerOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Pick Color</Text>
            <View style={styles.colorGrid}>
              {ALL_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => selectColor(color)}
                />
              ))}
            </View>
            <TouchableOpacity onPress={() => setColorPickerIdx(null)} style={styles.colorPickerClose}>
              <Text style={styles.colorPickerCloseText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
