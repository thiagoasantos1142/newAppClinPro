# Copilot instructions for this codebase

## Project overview
- Expo + React Native app (entry: [index.js](index.js), root component: [App.js](App.js)).
- Navigation is centralized in [src/navigation/AppNavigator.js](src/navigation/AppNavigator.js): Drawer -> Stack -> Bottom Tabs with a custom drawer content component.
- UI building blocks live in [src/components/ui.jsx](src/components/ui.jsx) (AppCard/AppButton/Badge/ProgressBar).
- Theme tokens live in [src/theme/tokens.js](src/theme/tokens.js) and are imported directly into screens.
- Mock content comes from [src/data/mockData.js](src/data/mockData.js) (services, trails, quiz questions, profile).

## Architecture & data flow
- Auth gate happens in [src/context/AuthContext.tsx](src/context/AuthContext.tsx): SecureStore token, `isAuthenticated` drives AppNavigator between auth flow and app shell.
- App flow uses `MainTabs` inside `AppStack`, both routed from the Root Drawer in [src/navigation/AppNavigator.js](src/navigation/AppNavigator.js).
- Auth flow is a small stack: [src/screens/auth/PhoneLoginScreen.tsx](src/screens/auth/PhoneLoginScreen.tsx) -> [src/screens/auth/OtpVerificationScreen.tsx](src/screens/auth/OtpVerificationScreen.tsx).
- API calls go through [src/services/api.ts](src/services/api.ts) with auth header injection and 401 -> logout handler.

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
- Environment base URL is set in [src/config/env.ts](src/config/env.ts) and toggles by `__DEV__`.
- Service modules in [src/services/modules](src/services/modules) own endpoints (auth, health, profile).
- Auth endpoints: `requestOtp` and `verifyOtp` in [src/services/modules/auth.service.ts](src/services/modules/auth.service.ts).
- Health check hook: [src/hooks/useHealthCheck.ts](src/hooks/useHealthCheck.ts).
- Debug screens hit real endpoints: [src/screens/dev/BackendConnectionTestScreen.tsx](src/screens/dev/BackendConnectionTestScreen.tsx) and [src/screens/dev/ProfileDebugScreen.tsx](src/screens/dev/ProfileDebugScreen.tsx).
- Navigation stack uses `@react-navigation/*` + Drawer, Tabs, Stack; icons use `@expo/vector-icons`.
