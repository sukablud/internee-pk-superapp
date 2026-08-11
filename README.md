# Internee.pk SuperApp

A single Expo (React Native) app with five bottom-tab modules, built as a UI prototype. Below is an honest breakdown of what's real vs. mocked in each module, and — for the two pieces that need a paid/verified third-party account I don't have — exactly what's already wired so plugging in real credentials is a drop-in, no-code-changes operation.

## Modules

- **Analytics** — the figures and the written insight are **generated at runtime by the Gemini API**, so they change on each load and on "Refresh data". They are **AI-generated sample figures, not real Instagram or X data**. Real integration with those platforms is intentionally out of scope: Instagram's Graph API requires Meta Business Verification and X's API requires a paid tier, neither reachable for an individual student project — `services/analyticsService.js` documents exactly what a real implementation would call. Without an API key the screen falls back to fixed sample numbers. "Download report" produces a real file (a PDF via `expo-print` on device, an HTML file in the browser).
- **LMS** — mock course catalog. Enroll/unenroll is real and persists via `AsyncStorage`. "Download materials" generates and saves a real file containing the course outline (`.txt` in the browser, PDF via the share sheet on device). There's no per-lesson progress tracking, only an enrolled/not-enrolled state.
- **AI Chat** — real Gemini API integration in `services/aiService.js`. **Set `EXPO_PUBLIC_GEMINI_API_KEY`** (free, no credit card, from [aistudio.google.com](https://aistudio.google.com)) and replies are genuinely generated. With no key set, it falls back to a simulated delay plus one of a few hardcoded replies. Note the free tier is rate-limited; on a 429 the app surfaces an error rather than failing silently.
- **Job Portal** — mock job listings with working search, category filter, and location filter (`@react-native-picker/picker`). Favorites are real, persisted in a local SQLite database (`expo-sqlite`). "Apply with resume" opens a real document picker so you choose the file to attach, then confirms — but nothing is transmitted, since there's no employer backend to send it to.
- **Projects** — real Firebase Storage wiring in `services/storageService.js`. **Set the `EXPO_PUBLIC_FIREBASE_*` vars** (see `.env.example`) and file uploads become real — no other code changes needed. With no config set, it falls back to a simulated 2-second upload, and the screen tells you which mode it's in. Submission history (filenames, dates, status) persists locally via `AsyncStorage` either way. Note: Firebase Storage requires the project's **Blaze (pay-as-you-go) plan**, which requires a billing account/card even though typical prototype usage stays within the no-cost quota — that's a Firebase requirement, not something this app can work around. There's also no admin-review mechanism, since reviewing submissions needs a second, admin-facing surface that doesn't exist here.

## Configuration (optional — the app runs fully mocked with zero setup)

```bash
cp .env.example .env
# fill in whichever keys you have; leave the rest blank
```

See `.env.example` for where to get each value and a security note about `EXPO_PUBLIC_*` variables being visible in the built app.

## Tech stack

- Expo / React Native
- `@react-navigation/native` + `@react-navigation/bottom-tabs`
- `react-native-screens`, `react-native-safe-area-context`
- `@react-native-async-storage/async-storage`, `expo-sqlite`
- `expo-document-picker`, `expo-print`, `expo-sharing`
- `@react-native-picker/picker`
- `firebase` (client SDK, used only if configured)

## Running locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` to run in the browser.
