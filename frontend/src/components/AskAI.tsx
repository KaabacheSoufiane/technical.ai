import { useState, useCallback } from 'react';

const AskAI = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>"'&]/g, '') // Supprime caractères dangereux
      .trim();
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedQuestion = sanitizeInput(question);
    
    if (sanitizedQuestion.length < 3) {
      setError('Question trop courte (minimum 3 caractères)');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const res = await fetch('https://localhost:5443/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: sanitizedQuestion }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (res.ok) {
        setAnswer(data.answer);
        setQuestion(''); // Clear après succès
      } else {
        setError(data.error || 'Erreur inconnue');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Timeout - La requête a pris trop de temps.');
      } else {
        setError('Erreur réseau ou serveur.');
      }
    } finally {
      setLoading(false);
    }
  }, [question]);

  const isValid = question.trim().length >= 3;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '2rem' }}>
      <h2>🔧 Assistant IA Technique</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Posez vos questions sur le chauffage et l'eau chaude sanitaire
      </p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex : Pourquoi mon ballon d'eau chaude ne chauffe plus ? Que vérifier sur une chaudière qui ne démarre pas ?"
            rows={4}
            style={{ 
              width: '100%', 
              padding: '12px', 
              marginBottom: '0.5rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical'
            }}
            maxLength={500}
            disabled={loading}
          />
          <div style={{ 
            fontSize: '12px', 
            color: question.length > 450 ? '#e74c3c' : '#999',
            textAlign: 'right',
            marginBottom: '1rem'
          }}>
            {question.length}/500 caractères
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !isValid}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !isValid ? '#ccc' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading || !isValid ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '🔄 Analyse en cours...' : '🚀 Analyser'}
        </button>
      </form>

      {answer && (
        <div style={{ 
          marginTop: '2rem', 
          background: '#e8f5e8', 
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid #27ae60'
        }}>
          <strong style={{ color: '#27ae60' }}>✅ Diagnostic IA :</strong>
          <div style={{ 
            marginTop: '0.5rem', 
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {answer}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#ffe6e6',
          border: '1px solid #e74c3c',
          borderRadius: '6px',
          color: '#c0392b'
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default AskAI;