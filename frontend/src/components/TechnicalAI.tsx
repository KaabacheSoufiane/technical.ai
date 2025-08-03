import React, { useState } from 'react';
import './TechnicalAI.css';

declare global {
  interface Window {
    Swal: any;
  }
}

const TechnicalAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async (question: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const startTime = Date.now();

    try {
      window.Swal.fire({
        title: 'Analyse en cours...',
        html: `
          <div class="loading-container">
            <div class="pulse-loader"></div>
            <p class="loading-text">${question}</p>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: { popup: 'modern-popup' }
      });

      const response = await fetch('https://localhost:5443/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (response.ok) {
        const processingTime = Date.now() - startTime;
        
        window.Swal.fire({
          html: `
            <div class="response-container">
              <div class="response-header">
                <h3>Diagnostic technique</h3>
                <span class="processing-time">${data.processing_time || processingTime}ms</span>
              </div>
              <div class="response-content">
                ${data.answer}
              </div>
            </div>
          `,
          confirmButtonText: 'Nouvelle question',
          showCancelButton: true,
          cancelButtonText: 'Fermer',
          customClass: { popup: 'response-popup' }
        }).then((result: any) => {
          if (result.isConfirmed) {
            showQuestionInput();
          }
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Erreur API:', error);
      
      let errorMessage = 'Service temporairement indisponible';
      if (error.name === 'TypeError') {
        errorMessage = 'Problème de connexion au serveur';
      } else if (error.status === 429) {
        errorMessage = 'Trop de requêtes, veuillez patienter';
      }
      
      window.Swal.fire({
        title: 'Erreur',
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showQuestionInput = () => {
    window.Swal.fire({
      html: `
        <div class="input-container">
          <h3>Posez votre question technique</h3>
          <textarea 
            id="question-input" 
            placeholder="Décrivez votre problème technique..."
            maxlength="500"
          ></textarea>
        </div>
      `,
      confirmButtonText: 'Analyser',
      showCancelButton: true,
      cancelButtonText: 'Annuler',
      customClass: { popup: 'input-popup' },
      preConfirm: () => {
        const textarea = document.getElementById('question-input') as HTMLTextAreaElement;
        const question = textarea.value.trim();
        
        if (!question || question.length < 3) {
          window.Swal.showValidationMessage('Question trop courte');
          return false;
        }
        
        return question;
      }
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        askAI(result.value);
      }
    });
  };

  // Questions prédéfinies pour éviter les re-rendus
  const quickQuestions = React.useMemo(() => [
    "Ballon d'eau chaude ne chauffe plus",
    "Chaudière ne démarre pas", 
    "Pression circuit trop basse",
    "Code erreur chaudière"
  ], []);

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
    </div>
  );
};

export default TechnicalAI;