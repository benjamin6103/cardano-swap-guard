# Cardano Swap Guard

## Overview
A safety tool for Cardano DeFi swaps. It checks for high slippage, low liquidity, and large price deviations before executing—preventing user losses. Built with React, Mesh.js, Charli3 API (from SteelSwap), and designed with a premium, dynamic glassmorphism UI.

## Features
- Fetches real-time and 24h average prices via Charli3.
- Enforces strict safety rules: Max 1% slippage margins, depth liquidity thresholds, etc.
- **Premium UX/UI**: Beautiful, responsive layout with glassmorphic depth, dynamic background gradients, micro-animations, and a highly polished "crypto terminal" event log.
- Builds and signs transactions using Mesh.js only if it passes the safety guards.
- Testnet (Preprod) ready.

## Setup
1. Clone repo: `git clone https://github.com/yourusername/cardano-swap-guard.git`
2. Install dependencies: `npm install`
3. Add `.env` with keys (see `.env.example`).
4. Run locally: `npm start` (Powered by `react-app-rewired`).

## Architecture & Build Details

This project uses React 19 wrapped with **react-app-rewired** (config-overrides.js) to fix common Webpack 5 Node core polyfill issues present in crypto libraries.
- Added fallbacks for core Node modules: `buffer`, `stream`, `crypto`, `process`.
- Excluded unnecessary `vm` dependency resolution (specifically for `asn1.js` sub-dependencies).
- Suppressed harmless source-map warnings emitted by external SDK dependencies (`@utxos/sdk`, `@biglup`).

### Environment Notes:
- Uses **Cardano Preprod**.
- Ensure `REACT_APP_BLOCKFROST_ID` and `REACT_APP_CHARLI3_KEY` are valid.
- Never commit the real `.env`!

## How It Works
1. **User Input:** Enter Swap request inside the newly designed input fields ("You Pay" -> "To Address").
2. **Oracle Request:** Fetches current metric data from Charli3.
3. **Safety Simulation:** The Guard validates slippage constraints and expected output.
4. **Tx Generation & Logging:** Detailed output gets printed into the sleek Terminal output. If safe, uses Mesh.js to build tx and signs via the chosen connected wallet (e.g., Eternl).

## Tech Stack
- Frontend: React + TypeScript + Glassmorphism vanilla CSS overhaul
- Blockchain: Mesh.js, Blockfrost (Preprod)
- API: Charli3 (SteelSwap aggregator)
- Signing: CIP-30 standard Cardano Wallets (Eternl, etc)

## Credits
Built by Benjamin Ngumba for the Blockchain Centre Hackathon.