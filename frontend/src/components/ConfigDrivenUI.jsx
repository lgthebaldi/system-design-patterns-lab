// frontend/src/components/ConfigDrivenUI.jsx
import { useEffect, useState } from 'react';
import { RenderEngine } from './RenderEngine';

function ConfigDrivenUI() {
  const [uiConfig, setUiConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch layout configuration from Backend (MongoDB)
    fetch('http://localhost:3001/api/config/home')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch config");
        return res.json();
      })
      .then(data => {
        setUiConfig(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{padding: 20}}>Loading Interface Layout...</div>;
  if (error) return <div style={{padding: 20, color: 'red'}}>Error: {error}</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Segoe UI' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50' }}>{uiConfig.title}</h1>
        <p style={{ color: '#7f8c8d' }}>
          This page is 100% rendered from a JSON stored in MongoDB. <br/>
          <strong>Version: {uiConfig.version}</strong>
        </p>
      </header>

      {/* THE MAGIC HAPPENS HERE */}
      <main>
        <RenderEngine config={uiConfig.layout} />
      </main>
    </div>
  );
}

export default ConfigDrivenUI;