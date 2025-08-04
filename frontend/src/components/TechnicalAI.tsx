import React, { useState } from 'react';
import './TechnicalAI.css';

const TechnicalAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async (question: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Simple loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <div style="width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p>Analyse en cours...</p>
            <p style="font-style: italic; color: #666;">${question}</p>
          </div>
        </div>
      `;
      document.body.appendChild(loadingDiv);

      const response = await fetch('https://localhost:5443/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      document.body.removeChild(loadingDiv);

      if (response.ok) {
        const processingTime = Date.now() - startTime;
        
        // Simple result display
        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
                <h3 style="margin: 0; color: #3498db;">Diagnostic technique</h3>
                <span style="background: #f0f0f0; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem;">${data.processing_time || processingTime}ms</span>
              </div>
              <div style="line-height: 1.6; margin-bottom: 2rem;">
                ${data.answer.replace(/\n/g, '<br>')}
              </div>
              <div style="text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="background: #3498db; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer; margin-right: 1rem;">Fermer</button>
                <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); document.querySelector('.primary-button').click();" style="background: #2ecc71; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer;">Nouvelle question</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(resultDiv);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Erreur API:', error);
      
      let errorMessage = 'Service temporairement indisponible';
      if (error.name === 'TypeError') {
        errorMessage = 'Problème de connexion au serveur';
      }
      
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
            <h3 style="color: #e74c3c; margin-bottom: 1rem;">❌ Erreur</h3>
            <p>${errorMessage}</p>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: #e74c3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer;">Fermer</button>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
    } finally {
      setIsLoading(false);
    }
  };

  const showQuestionInput = () => {
    const inputDiv = document.createElement('div');
    inputDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
        <div style="background: white; padding: 2rem; border-radius: 10px; width: 90%; max-width: 500px;">
          <h3 style="margin-bottom: 1.5rem; color: #3498db;">Posez votre question technique</h3>
          <textarea id="question-input" placeholder="Décrivez votre problème technique..." maxlength="500" style="width: 100%; min-height: 120px; padding: 1rem; border: 1px solid #ddd; border-radius: 5px; font-family: inherit; resize: vertical;"></textarea>
          <div style="text-align: center; margin-top: 1.5rem;">
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="background: #95a5a6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer; margin-right: 1rem;">Annuler</button>
            <button onclick="
              const question = document.getElementById('question-input').value.trim();
              if (question.length < 3) {
                alert('Question trop courte');
                return;
              }
              this.parentElement.parentElement.parentElement.parentElement.remove();
              window.askAIFunction(question);
            " style="background: #3498db; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer;">Analyser</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(inputDiv);
    
    // Focus on textarea
    setTimeout(() => {
      const textarea = document.getElementById('question-input') as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 100);
  };

  // Expose askAI function globally for the modal buttons
  React.useEffect(() => {
    (window as any).askAIFunction = askAI;
  }, []);

  const quickQuestions = [
    "Ballon d'eau chaude ne chauffe plus",
    "Chaudière ne démarre pas", 
    "Pression circuit trop basse",
    "Code erreur chaudière"
  ];

  return (
    <div className="app">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🔧 Technical AI</span>
          </div>
          
          <h1 className="hero-title">
            Assistant IA pour
            <span className="gradient-text"> techniciens</span>
          </h1>
          
          <p className="hero-subtitle">
            Diagnostic intelligent pour chauffage et ECS.
            Obtenez des solutions techniques précises en quelques secondes.
          </p>

          <div className="cta-section">
            <button 
              className="primary-button"
              onClick={showQuestionInput}
              disabled={isLoading}
            >
              <span>Poser une question</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 8L8 15M15 8H1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-header">
              <div className="status-dot"></div>
              <span>IA Active</span>
            </div>
            <div className="card-content">
              <div className="metric">
                <span className="metric-value">7B</span>
                <span className="metric-label">Paramètres</span>
              </div>
              <div className="metric">
                <span className="metric-value">&lt;2s</span>
                <span className="metric-label">Réponse</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-section">
        <h2>Questions fréquentes</h2>
        <div className="quick-grid">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              className="quick-card"
              onClick={() => askAI(question)}
              disabled={isLoading}
            >
              <div className="quick-icon">⚡</div>
              <span>{question}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>IA Spécialisée</h3>
            <p>Modèle Mistral 7B entraîné pour le diagnostic technique</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Réponses Rapides</h3>
            <p>Diagnostic en moins de 2 secondes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Solutions Pratiques</h3>
            <p>Recommandations concrètes et actionables</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TechnicalAI;