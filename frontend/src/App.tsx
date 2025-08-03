import React from 'react';
import './App.css';
import AskAI from './components/AskAI';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🔧 Technical AI</h1>
        <p>Assistant IA pour techniciens de maintenance</p>
      </header>
      <main>
        <AskAI />
      </main>
    </div>
  );
}

export default App;
