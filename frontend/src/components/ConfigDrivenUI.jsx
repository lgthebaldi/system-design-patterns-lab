import React, { useEffect, useState } from 'react';
import RenderEngine from './RenderEngine';

function ConfigDrivenUI() {
  const [uiConfig, setUiConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/config/home')
      .then(res => res.json())
      .then(data => {
        setUiConfig(data);
        setLoading(false);
      })
      .catch(err => console.error("Erro ao carregar config:", err));
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Carregando Masterplan...</div>;
  if (!uiConfig) return <div style={{ padding: '20px' }}>Configuração não encontrada no MongoDB.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#2c3e50' }}>{uiConfig.title}</h1>
      <RenderEngine data={uiConfig.layout} />
    </div>
  );
}

export default ConfigDrivenUI;