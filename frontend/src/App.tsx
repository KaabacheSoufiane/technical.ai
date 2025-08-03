// mon-application-fullstack/frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Gardez l'importation du fichier CSS si vous voulez conserver le style par défaut

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // IMPORTANT : Utilisez 'backend' comme nom d'hôte car c'est le nom du service Docker Compose
        const response = await fetch('http://backend:5000/api/message');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessage(data.message);
      } catch (e: any) {
        console.error("Erreur lors de la récupération du message:", e);
        setError(`Impossible de se connecter au backend ou erreur: ${e.message}. Assurez-vous que le backend est en cours d'exécution.`);
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mon Application Fullstack</h1>
        {error ? (
          <p style={{ color: 'red' }}>Erreur: {error}</p>
        ) : (
          <p>Message du backend : {message ? message : 'Chargement...'}</p>
        )}
      </header>
    </div>
  );
}

export default App;
