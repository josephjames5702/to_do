# React Native (Expo) Todo

Mobile client for the existing Express API in `../server` — same accounts and tasks as the web app.
Features: register / sign in / sign out, add, complete, delete, search and All/Active/Completed filter.

## Run
1. Start the API from the repo root: `npm run server` (or with `DEMO_MODE=true` for the in-memory demo;
   login `todo.demo@example.com` / `TodoDemo123!`).
2. `cd react-native-todo && npm install && npm start`
3. Press `i` (iOS simulator), `a` (Android emulator) or scan the QR code with Expo Go.

## API URL (`src/config.ts`)
| Target | Setup |
| --- | --- |
| iOS simulator / web | works with default `http://localhost:5000` |
| Android emulator | `adb reverse tcp:5000 tcp:5000` |
| Physical phone | `EXPO_PUBLIC_API_URL=http://<pc-lan-ip>:5000` (server must listen on 0.0.0.0, i.e. not local DEMO_MODE) |
| Hosted (Render) | `EXPO_PUBLIC_API_URL=https://<service>.onrender.com` |

Auth uses the server's session cookie, which the native network stack stores automatically.
