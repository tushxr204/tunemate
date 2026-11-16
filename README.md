# Tunemate 🎧

Find friends through the music you love. Match with people who share your taste, play real song previews, chat privately and play music games.

**Stack (all free tiers):** static site + serverless API on **Vercel**, accounts / database / realtime on **Supabase**, songs from the **Apple iTunes Search API**, optional full songs via the **YouTube Data API**.

## Features
- Sign in with Google or email + password, then a 5-step profile setup (genres, artists, moods, Instagram and Spotify links)
- Taste matching with a match % (genres, artists, moods, liked songs, energy)
- Connect requests → friends → private 1-to-1 chat (live), block users
- Library: 12 artist playlists + 4 mixes + search, 30-sec previews, Liked Songs, full songs from YouTube
- Tunemate Radio: endless music generated in the browser, "listen along" with friends
- 8 games: Guess the Song, Guess the Artist, Beat Maker, Rhythm Tap, Melody Memory, Tap the Tempo, Ear Test, live Tic-Tac-Toe; leaderboards

## Deploy (short version)
1. Create a Supabase project → SQL Editor → run `supabase/schema.sql`.
2. Supabase → Authentication: Email on with **Confirm email off**; Google provider on (Google Cloud OAuth client, redirect = Supabase callback URL).
3. Import this repo into Vercel (preset **Other**) with env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `YOUTUBE_API_KEY`.
4. Supabase → Authentication → URL Configuration: Site URL + Redirect URL `https://your-app.vercel.app/**`.

The full step-by-step guide is in the Tunemate Launch Guide doc.

## Phone apps (Android & iPhone)
- **Installable app (PWA):** open the live site on a phone → Android: *Install app*; iPhone Safari: *Share → Add to Home Screen*. Includes `manifest.webmanifest`, `sw.js` (offline start) and `icons/`.
- **Android APK:** set the repo variable `TUNEMATE_SITE` (Settings → Secrets and variables → Actions → Variables), then Actions → *Build Android app* → Run workflow → download the `Tunemate-Android` artifact. Built with Capacitor (`capacitor.config.json`, `scripts/build-web.mjs`, `scripts/patch-native.mjs`).
- **iPhone app:** on a Mac with Xcode: `npm install`, `TUNEMATE_SITE=https://your-app.vercel.app npm run build:web`, `npx cap add ios`, `node scripts/patch-native.mjs`, `npx cap open ios`.
- Add `com.tunemate.app://login-callback` to Supabase → Authentication → URL Configuration → Redirect URLs so Google sign-in works inside the apps.

## Local
- Open `index.html` directly → **demo mode** (saved in your browser, demo profiles).
- Full stack: `npm i -g vercel`, copy `.env.example` to `.env`, fill it in, run `vercel dev`.

## Notes
- The Supabase anon key is public by design; Row Level Security in `schema.sql` protects the data. Never use the service_role key in this app.
- Spotify only allows 5 test users for apps without extended access, and Instagram no longer lets apps connect personal accounts. So Tunemate stores profile links and opens songs in Spotify rather than logging in with them.
- Vercel Hobby is for personal, non-commercial use.
