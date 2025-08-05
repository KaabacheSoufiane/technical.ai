import React, { useState } from 'react';
import './TechnicalAI.css';
import PDFUpload from './PDFUpload';

const TechnicalAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // URL API HTTP simple
  const getApiUrl = () => {
    return 'http://localhost:8080';
  };

  // Gestion des erreurs console
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Manifest') || args[0]?.includes?.('icon')) {
        return; // Ignore les erreurs d'icônes
      }
      originalError.apply(console, args);
    };
  }, []);

  const askAI = async (question: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Loading modal
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'loading-modal';
      loadingDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 15px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
            <div style="width: 50px; height: 50px; border: 3px solid rgba(102, 126, 234, 0.3); border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <h3 style="margin: 0 0 1rem 0; color: #667eea;">🤖 Analyse IA en cours...</h3>
            <p style="margin: 0; font-style: italic; color: #a0a0a0; max-width: 300px;">${question}</p>
            <small style="display: block; margin-top: 1rem; color: #666;">Protocole: ${window.location.protocol}</small>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      document.body.appendChild(loadingDiv);

      const apiUrl = getApiUrl();
      console.log('🔗 Connexion à:', apiUrl);

      const response = await fetch(`${apiUrl}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      document.body.removeChild(loadingDiv);

      if (response.ok) {
        const processingTime = Date.now() - startTime;
        
        // Result modal
        const resultDiv = document.createElement('div');
        resultDiv.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 15px; max-width: 700px; max-height: 80vh; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin: 0; color: #667eea;">✅ Diagnostic technique</h3>
                <div style="display: flex; gap: 1rem; align-items: center;">
                  <span style="background: rgba(102, 126, 234, 0.2); color: #667eea; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem;">${data.processing_time || processingTime}ms</span>
                  <span style="background: rgba(46, 204, 113, 0.2); color: #2ecc71; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem;">${data.protocol || 'http'}</span>
                </div>
              </div>
              <div style="line-height: 1.6; margin-bottom: 2rem; white-space: pre-wrap;">
                ${data.answer.replace(/\n/g, '<br>')}
              </div>
              <div style="text-align: center; display: flex; gap: 1rem; justify-content: center;">
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #95a5a6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Fermer</button>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove(); document.querySelector('.primary-button').click();" style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Nouvelle question</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(resultDiv);
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('❌ Erreur API:', error);
      
      // Remove loading if still present
      const loading = document.getElementById('loading-modal');
      if (loading) document.body.removeChild(loading);
      
      let errorMessage = 'Service temporairement indisponible';
      if (error.name === 'TypeError') {
        errorMessage = `Problème de connexion au serveur (${getApiUrl()})`;
      }
      
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
          <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 15px; text-align: center; border: 1px solid rgba(231, 76, 60, 0.3);">
            <h3 style="color: #e74c3c; margin-bottom: 1rem;">❌ Erreur de connexion</h3>
            <p style="margin-bottom: 1rem;">${errorMessage}</p>
            <small style="color: #666; display: block; margin-bottom: 1.5rem;">URL: ${getApiUrl()}</small>
            <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #e74c3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Fermer</button>
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
        <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 15px; width: 90%; max-width: 500px; border: 1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-bottom: 1.5rem; color: #667eea;">🔧 Posez votre question technique</h3>
          <textarea id="question-input" placeholder="Décrivez votre problème technique..." maxlength="500" style="width: 100%; min-height: 120px; padding: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; font-family: inherit; resize: vertical;"></textarea>
          <div style="text-align: center; margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
            <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #95a5a6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Annuler</button>
            <button onclick="
              const question = document.getElementById('question-input').value.trim();
              if (question.length < 3) {
                alert('Question trop courte (minimum 3 caractères)');
                return;
              }
              this.closest('div[style*=\"position: fixed\"]').remove();
              window.askAIFunction(question);
            " style="background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">🚀 Analyser</button>
          </div>
          <small style="display: block; text-align: center; margin-top: 1rem; color: #666;">Connexion: ${getApiUrl()}</small>
        </div>
      </div>
    `;
    document.body.appendChild(inputDiv);
    
    setTimeout(() => {
      const textarea = document.getElementById('question-input') as HTMLTextAreaElement;
      if (textarea) textarea.focus();
    }, 100);
  };

  // Expose function globally
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
            <span style={{marginLeft: '1rem', fontSize: '0.8rem', opacity: 0.7}}>
              {window.location.protocol === 'https:' ? '🔒 HTTPS' : '🌐 HTTP'}
            </span>
          </div>
          
          <h1 className="hero-title">
            Assistant IA pour
            <span className="gradient-text"> techniciens</span>
          </h1>
          
          <p className="hero-subtitle">
            Diagnostic intelligent pour chauffage et ECS.
            Connexion sécurisée {window.location.protocol === 'https:' ? 'HTTPS' : 'HTTP'}.
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

      <PDFUpload />

      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>IA Spécialisée</h3>
            <p>Modèle Mistral 7B avec documentation technique</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Documentation PDF</h3>
            <p>Analyse automatique des manuels techniques</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Solutions Pratiques</h3>
            <p>Recommandations basées sur la documentation officielle</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAI;