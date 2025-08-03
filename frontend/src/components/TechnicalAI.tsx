import React, { useState } from 'react';
import './TechnicalAI.css';

declare global {
  interface Window {
    Swal: any;
  }
}

const TechnicalAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "Pourquoi mon ballon d'eau chaude ne chauffe plus ?",
    "Chaudière qui ne démarre pas, que vérifier ?",
    "Pression trop basse sur circuit chauffage",
    "Code erreur E10 sur chaudière"
  ];

  const askAI = async (question: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const startTime = Date.now();

    try {
      // Affichage optimisé avec métriques
      window.Swal.fire({
        title: '🤖 Assistant IA',
        html: `
          <div class="question-display">
            <p><strong>Question:</strong></p>
            <p class="question-text">${question}</p>
          </div>
          <div class="loading-spinner">
            <i class="fas fa-brain fa-pulse"></i>
            <p>Analyse IA en cours...</p>
            <small>Modèle: Mistral 7B</small>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          popup: 'ai-popup'
        }
      });

      const response = await fetch('https://localhost:5443/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (response.ok) {
        const processingTime = Date.now() - startTime;
        
        // Affichage optimisé avec métriques
        window.Swal.fire({
          title: '✅ Diagnostic IA',
          html: `
            <div class="response-display">
              <div class="question-recap">
                <p><strong>Question:</strong></p>
                <p class="question-text">${question}</p>
              </div>
              <div class="answer-section">
                <p><strong>Réponse technique:</strong></p>
                <div class="answer-text">${data.answer}</div>
              </div>
              <div class="metrics">
                <small>🕰️ Temps de traitement: ${data.processing_time || processingTime}ms | 🤖 ${data.model || 'Mistral 7B'}</small>
              </div>
            </div>
          `,
          confirmButtonText: 'Nouvelle question',
          cancelButtonText: 'Fermer',
          showCancelButton: true,
          confirmButtonColor: '#3498db',
          cancelButtonColor: '#95a5a6',
          customClass: {
            popup: 'ai-response-popup'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            showQuestionInput();
          }
        });
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      window.Swal.fire({
        title: '❌ Erreur',
        text: 'Impossible de contacter l\'IA. Vérifiez que le serveur est démarré.',
        icon: 'error',
        confirmButtonColor: '#e74c3c'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showQuestionInput = () => {
    window.Swal.fire({
      title: '🔧 Technical.AI',
      html: `
        <div class="input-section">
          <p>Posez votre question technique :</p>
          <textarea 
            id="question-input" 
            placeholder="Ex: Pourquoi mon ballon d'eau chaude ne chauffe plus ?"
            maxlength="500"
            rows="4"
          ></textarea>
          <div class="char-counter">
            <span id="char-count">0</span>/500 caractères
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Analyser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3498db',
      cancelButtonColor: '#95a5a6',
      customClass: {
        popup: 'question-input-popup'
      },
      didOpen: () => {
        const textarea = document.getElementById('question-input') as HTMLTextAreaElement;
        const charCount = document.getElementById('char-count');
        
        textarea.addEventListener('input', () => {
          if (charCount) {
            charCount.textContent = textarea.value.length.toString();
          }
        });
        
        textarea.focus();
      },
      preConfirm: () => {
        const textarea = document.getElementById('question-input') as HTMLTextAreaElement;
        const question = textarea.value.trim();
        
        if (!question) {
          window.Swal.showValidationMessage('Veuillez saisir une question');
          return false;
        }
        
        if (question.length < 3) {
          window.Swal.showValidationMessage('Question trop courte (minimum 3 caractères)');
          return false;
        }
        
        return question;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        askAI(result.value);
      }
    });
  };

  const handleQuickQuestion = (question: string) => {
    askAI(question);
  };

  return (
    <div className="technical-ai">
      <header className="ai-header">
        <div className="header-content">
          <h1>🔧 Technical.AI</h1>
          <p className="subtitle">Assistant IA spécialisé pour techniciens de maintenance</p>
          <div className="specialties">
            <span className="specialty">🔥 Chauffage</span>
            <span className="specialty">🚿 ECS</span>
            <span className="specialty">⚡ Diagnostic</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="action-section">
          <button 
            className="ask-button"
            onClick={showQuestionInput}
            disabled={isLoading}
          >
            <i className="fas fa-comments"></i>
            Poser une question
          </button>
        </div>

        <section className="quick-questions">
          <h2>⚡ Questions rapides</h2>
          <div className="questions-grid">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
                disabled={isLoading}
              >
                <i className="fas fa-question-circle"></i>
                {question}
              </button>
            ))}
          </div>
        </section>

        <section className="features">
          <h2>🚀 Fonctionnalités</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-robot"></i>
              <h3>IA Spécialisée</h3>
              <p>Diagnostic précis basé sur l'expertise technique</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bolt"></i>
              <h3>Réponses Rapides</h3>
              <p>Solutions immédiates pour vos interventions</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-search"></i>
              <h3>Diagnostic Avancé</h3>
              <p>Identification des pannes avec recommandations</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="ai-footer">
        <p>© 2024 Technical.AI - Développé avec ❤️ pour les techniciens</p>
      </footer>
    </div>
  );
};

export default TechnicalAI;