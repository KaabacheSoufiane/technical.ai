import React, { useState } from 'react';

const PDFUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);

    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('https://localhost:5443/api/upload-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      padding: '2rem',
      margin: '2rem 0'
    }}>
      <h3 style={{ color: '#667eea', marginBottom: '1.5rem' }}>
        📚 Charger documentation PDF
      </h3>
      
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>
            Fichier PDF:
          </label>
          <input
            type="file"
            name="pdf"
            accept=".pdf"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>
              Marque:
            </label>
            <select
              name="marque"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <option value="">Auto-détection</option>
              <option value="viessmann">Viessmann</option>
              <option value="saunier duval">Saunier Duval</option>
              <option value="bosch">Bosch</option>
              <option value="atlantic">Atlantic</option>
              <option value="thermor">Thermor</option>
              <option value="de dietrich">De Dietrich</option>
              <option value="frisquet">Frisquet</option>
              <option value="daikin">Daikin</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>
              Type:
            </label>
            <select
              name="type"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            >
              <option value="">Auto-détection</option>
              <option value="chaudiere">Chaudière</option>
              <option value="ballon">Ballon ECS</option>
              <option value="pac">Pompe à chaleur</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0' }}>
              Modèle:
            </label>
            <input
              type="text"
              name="modele"
              placeholder="Ex: Vitodens 200-W"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          style={{
            background: uploading ? '#95a5a6' : '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {uploading ? '📄 Traitement en cours...' : '📤 Charger PDF'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: result.error ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
          border: `1px solid ${result.error ? '#e74c3c' : '#2ecc71'}`,
          borderRadius: '8px'
        }}>
          {result.error ? (
            <p style={{ color: '#e74c3c', margin: 0 }}>❌ {result.error}</p>
          ) : (
            <div style={{ color: '#2ecc71' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>✅ {result.message}</p>
              <small>
                📄 {result.data.pages} pages | 
                🔧 {result.data.codes_erreur} codes erreur | 
                📋 {result.data.procedures} procédures
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFUpload;