# Copilot instructions for this codebase

## Project overview
- Expo + React Native app (entry: [index.js](index.js), root component: [App.js](App.js)).
- Navigation is centralized in [src/navigation/AppNavigator.js](src/navigation/AppNavigator.js): Drawer -> Stack -> Bottom Tabs (safe area aware).
- UI building blocks live in [src/components/ui.jsx](src/components/ui.jsx) (AppCard/AppButton/Badge/ProgressBar).
- Theme tokens live in [src/theme/tokens.js](src/theme/tokens.js) and are imported directly into screens.
- Mock content comes from [src/data/mockData.js](src/data/mockData.js) (services, trails, quiz questions, profile).

## Architecture & data flow
- App renders `AppNavigator`, which wires all screens and routes in one place.
- Tabs are defined as `HomeTab`, `ServicesTab`, `TrainingTab`, `CommunityTab`, `ProfileTab`.
- Most screens are presentational and use `navigation.navigate('RouteName')` to move between stack routes declared in `AppNavigator`.
- Styling is inline + `StyleSheet.create` per screen; colors and radii come from `tokens.js`.

## Conventions & patterns
- Prefer `AppCard` and `AppButton` for consistent look and spacing, instead of ad hoc card/button styles.
- Import `colors`, `radius`, `spacing`, `typography` from [src/theme/tokens.js](src/theme/tokens.js) rather than hard-coded values.
- Use route names exactly as declared in [src/navigation/AppNavigator.js](src/navigation/AppNavigator.js) to avoid navigation bugs.
- Screens are colocated in [src/screens/](src/screens/) and are default exports of a function component.

## Dev workflows
- Start Metro: `npm run start` (Expo).
- Run on Android: `npm run android`.
- Run on iOS: `npm run ios`.
- Run on web: `npm run web`.

## Integration points
- Navigation stack uses `@react-navigation/*` + Drawer, Tabs, Stack.
- Icons use `@expo/vector-icons` (see [src/screens/HomeScreen.jsx](src/screens/HomeScreen.jsx)).
- Safe area insets from `react-native-safe-area-context` (used in tab bar).
