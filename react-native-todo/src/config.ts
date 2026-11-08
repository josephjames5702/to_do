/**
 * Base URL of the existing Express API (server/index.js, port 5000).
 *
 * - iOS simulator / Expo web: http://localhost:5000 works as-is.
 * - Android emulator: run `adb reverse tcp:5000 tcp:5000`, then localhost works too.
 *   (The server binds to 127.0.0.1 in local demo mode, so 10.0.2.2 will NOT reach it.)
 * - Physical phone: set EXPO_PUBLIC_API_URL=http://<your-pc-lan-ip>:5000 and run the
 *   server without local DEMO_MODE (or with NODE_ENV=production) so it listens on 0.0.0.0.
 * - Render demo: EXPO_PUBLIC_API_URL=https://<your-service>.onrender.com
 */
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
