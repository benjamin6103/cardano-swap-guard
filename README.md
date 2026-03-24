# Cardano Swap Guard

A deterministic pre-execution simulator for secure DeFi swaps on Cardano. Built to ensure safer trades by checking high slippage, low liquidity, and extreme price deviations prior to transaction signing.

* **[Read the Full Documentation in docs/README.MD](./docs/README.MD)** for detailed setup instructions and architecture.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your keys (Charli3 API, Blockfrost Project ID).
3. Start the application:
   ```bash
   npm start
   ```

*(Note: The project uses `react-app-rewired` to support Node polyfills for Webpack 5, required by `@meshsdk/core` and other Cardano SDK dependencies).*
