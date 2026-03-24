# Presentation Notes: Cardano Swap Guard

## Slide 1: Intro (10 sec)
- Hi, I'm Benjamin Ngumba, beginner blockchain dev.
- Problem: Cardano DeFi is fragile—users lose money from high slippage, price shifts in low-liquidity pools. E.g., recent $6M ADA loss stories.
- Solution: My "Swap Guard Protocol"—a robust safety layer that visually simulates swaps and enforces deterministic rules before transaction execution.

## Slide 2: How It Works (30 sec)
- User connects a CIP-30 wallet (like Eternl).
- Enters a swap inside a premium, glassmorphic UI meant to rival high-end Web3 DApps.
- Fetches data: Current/24h prices from Charli3 (SteelSwap API).
- Guard checks: Slippage <1%, deviation <2%, liquidity >threshold.
- Evaluates constraints and either cleanly passes execution to Mesh.js or firmly rejects with terminal-style logs.

## Slide 3: Demo (1 min)
- Live show: Showcase the dynamic background and micro-animations upon load. Connect the wallet.
- Bad swap: Show high deviation rejection inside the built-in "Terminal Output" log panel.
- Good swap: UI spins processing state, passes the guard, builds Mesh.js Tx, successfully hashes to Cardanoscan!
- Code highlight: Guard logic in `utils/guard.ts`, along with the `config-overrides.js` needed for clean Webpack 5 builds.

## Slide 4: Why Cool? (20 sec)
- Aligns with Cardano's deterministic EUTXO model—we verify outcome *before* paying fees!
- Flawless, highly responsive aesthetic utilizing standard vanilla CSS variables and animations to create depth and glass effects.
- Integrates hackathon tools efficiently: SteelSwap data logic, Mesh.js tx building.

## Slide 5: Next & Ask (10 sec)
- Future: Connect to fully functional generic DEX routes and React Native mobile extension.
- Ask: Questions? (Mention GitHub link).

Tips: Focus on showing off the smooth animations when demonstrating the Swap checks. Time yourself.