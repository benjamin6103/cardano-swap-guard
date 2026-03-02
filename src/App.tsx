import React from 'react';
import { MeshProvider} from '@meshsdk/react';
import SwapForm from './components/SwapForm';
import './App.css'; // Optional for styling

function App() {
  return (
    <MeshProvider > {/* No network prop; configured in providers */}
      <div className="App">
        <header className="App-header">
          <h1>Cardano Swap Guard</h1>
          <p>A deterministic pre-execution simulator for safe DeFi swaps on Cardano.</p>
        </header>
        <main>
          <SwapForm />
        </main>
      </div>
    </MeshProvider>
  );
}

export default App; // Ensures it's a module
