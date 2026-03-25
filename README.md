# SCAT - Thirty One Card Game

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A multiplayer card game app built with React Native and Expo. Play the classic "Thirty One" (SCAT) game with 2-6 players on a single device.

## 🎮 Game Overview

SCAT is a fast-paced card game where players compete to get the highest score in a single suit (or exactly 31). The last player with lives remaining wins!

### Key Features

- **Multiplayer Support**: 2-6 players on a single device
- **Privacy Gates**: Pass-and-play with turn privacy screens
- **Dynamic Scoring**: Real-time score calculation and display
- **Lives System**: Strategic gameplay with life management
- **Knock Mechanic**: Early round ending with risk/reward
- **Cross-Platform**: iOS, Android, and Web support
- **Dark Theme**: Elegant dark UI with gold accents

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) 0.81.5
- **Platform**: [Expo](https://expo.dev/) ~54.0.33
- **UI Library**: [React Native Paper](https://callstack.github.io/react-native-paper/) 4.9.2
- **Icons**: [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- **Web Support**: [React Native Web](https://necolas.github.io/react-native-web/)

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TylerCarrington/scat-app.git
   cd scat-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

## 🚀 Running the App

### Development Mode
```bash
npm start
```
This opens the Expo development tools. Scan the QR code with the Expo Go app on your phone, or use an emulator.

### Platform-Specific
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Production Build
```bash
# Android APK
eas build --platform android --profile production

# iOS App Store
eas build --platform ios --profile production
```

## 📋 Game Rules

### Objective
Be the last player with lives remaining by scoring higher than opponents in each round.

### Setup
- 2-6 players
- Each player starts with 4 lives (♥️)
- Standard 52-card deck

### Gameplay
1. **Deal**: Each player receives 3 cards face down
2. **Turns**: Players take turns drawing from stock or discard pile, then discard one card
3. **Scoring**: Hand value is the highest total in any single suit, or 30.5 for three-of-a-kind
4. **Knock**: A player can "knock" to end the round early. If they don't have a score higher than at least one other player, they lose 2 lives
5. **Round End**: When a player knocks, all players take one final turn
6. **Life Loss**: Player with lowest score loses 1 life (or 2 if they knocked)
7. **Win**: Last player with lives remaining wins

### Card Values
- Ace: 11 points
- Face cards (K, Q, J): 10 points each
- Number cards: Face value
- Three-of-a-kind: 30.5 points (beats any suit total except 31)

## 🏗️ Development

### Project Structure
```
scat-app/
├── App.js          # Main app component (~1500 lines)
├── index.js        # Entry point
├── package.json    # Dependencies and scripts
├── app.json        # Expo configuration
├── eas.json        # Build configuration
├── assets/         # App icons and assets
└── .github/        # CI/CD workflows
```

### Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

### Building for Production
This project uses [Expo Application Services (EAS)](https://docs.expo.dev/eas/) for builds:

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Environment Variables
For CI/CD, set these secrets in your GitHub repository:
- `EXPO_TOKEN` - Expo access token
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google Play service account JSON

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

### Development Guidelines
- Follow React Native best practices
- Test on multiple platforms (iOS, Android, Web)
- Ensure accessibility compliance
- Add comments for complex game logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI components from [React Native Paper](https://callstack.github.io/react-native-paper/)
- Icons from [Expo Vector Icons](https://docs.expo.dev/guides/icons/)

---

**Enjoy playing SCAT!** 🎴
