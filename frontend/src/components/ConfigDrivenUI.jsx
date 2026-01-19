// frontend/src/components/ConfigDrivenUI.jsx
import React, { useEffect, useState } from 'react';
import RenderEngine from './RenderEngine';

function ConfigDrivenUI({ screenName = 'home' }) {
  const [uiConfig, setUiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3001/api/config/${screenName}`)
      .then(res => res.json())
      .then(data => {
        setUiConfig(data);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar config:", err));
  }, [screenName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('🔒 Securing data...');

    try {
      const response = await fetch(`http://localhost:3001${uiConfig.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setStatus(`✅ Success! Secret Stored. ID: ${result.id}`);
        setFormData({});
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setStatus(`❌ Connection failed: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Carregando Masterplan...</div>;
  if (!uiConfig) return <div style={{ padding: '20px' }}>Configuração não encontrada no MongoDB.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#2c3e50' }}>{uiConfig.title}</h1>
      
      <form onSubmit={handleSubmit}>
        <RenderEngine 
          data={uiConfig.layout || uiConfig.fields} 
          formData={formData} 
          setFormData={setFormData} 
        />
        
        {uiConfig.apiEndpoint && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="submit" style={{
              padding: '12px 30px', borderRadius: '5px', cursor: 'pointer', border: 'none', 
              color: 'white', backgroundColor: '#007bff', fontWeight: 'bold'
            }}>
              Encrypt & Store
            </button>
          </div>
        )}
      </form>

      {status && (
        <div style={{ 
          marginTop: '20px', padding: '15px', borderRadius: '5px', textAlign: 'center',
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          color: status.includes('✅') ? '#155724' : '#721c24'
        }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default ConfigDrivenUI;