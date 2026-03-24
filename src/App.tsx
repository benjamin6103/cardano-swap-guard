import React from 'react';
import { MeshProvider } from '@meshsdk/react';
import SwapForm from './components/SwapForm';
import './App.css';

function App() {
  return (
    <MeshProvider>
      <div className="App">
        <main className="app-shell">
          <SwapForm />
        </main>
      </div>
    </MeshProvider>
  );
}

export default App;
