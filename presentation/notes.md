# Presentation Notes: Cardano Swap Guard

## Slide 1: Intro (10 sec)
- Hi, I'm Benjamin Ngumba, beginner blockchain dev.
- Problem: Cardano DeFi is fragile—users lose money from high slippage, price shifts in low-liquidity pools. E.g., recent $6M ADA loss stories.
- Solution: My "Swap Guard" app—a safety layer that simulates swaps and enforces rules before execution.

## Slide 2: How It Works (30 sec)
- User connects wallet (Eternl or UTXOs.dev social login).
- Enters swap (e.g., 2 ADA to USDM).
- Fetches data: Current/24h prices from Charli3 (SteelSwap API).
- Guard checks: Slippage <1%, deviation <2%, liquidity >threshold, min output.
- If safe: Builds tx with Mesh.js, signs, submits.
- If not: Rejects with reason (logs on screen).

## Slide 3: Demo (1 min)
- Live show: Connect wallet.
- Bad swap: High deviation → Rejected.
- Good swap: Passes → Tx hash (link to explorer).
- Code highlight: Guard logic in utils/guard.ts.

## Slide 4: Why Cool? (20 sec)
- Aligns with Cardano's deterministic EUTXO—no hype, just logic.
- Uses hackathon tools: SteelSwap, Mesh.js, UTXOs.dev.
- Impact: Builds trust, scales DeFi adoption.

## Slide 5: Next & Ask (10 sec)
- Future: Full DEX routes, React Native mobile.
- Thanks! Questions? (Mention GitHub link).

Tips: Use free tools like Canva or Google Slides for visuals. Time yourself.