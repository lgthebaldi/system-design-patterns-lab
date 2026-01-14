import React, { useState } from 'react';

const SoqlPlayground = () => {
  const [sql, setSql] = useState("SELECT * FROM User");
  const [soql, setSoql] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTranspile = async () => {
    setLoading(true);
    setError("");
    setSoql("");
    
    try {
      const response = await fetch('http://localhost:3001/api/transpile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSoql(data.soql);
      } else {
        setError(data.error || "Erro na transpilação");
      }
    } catch (err) {
      setError("Não foi possível conectar ao Backend (Porta 3001)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #34495e', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50' }}>🚀 Week 4: SOQL Transpiler Playground</h1>
        <p style={{ color: '#7f8c8d' }}>Converta consultas SQL padrão para o formato Salesforce SOQL automaticamente.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Input SQL:</label>
          <input 
            type="text" 
            value={sql} 
            onChange={(e) => setSql(e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', borderRadius: '5px', border: '1px solid #bdc3c7' }}
            placeholder="Ex: SELECT * FROM User"
          />
        </div>

        <button 
          onClick={handleTranspile}
          disabled={loading}
          style={{ 
            padding: '15px', 
            backgroundColor: loading ? '#95a5a6' : '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? "PROCESSANDO..." : "EXECUTAR TRANSPILER (AST)"}
        </button>

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#fadbd8', color: '#c0392b', borderRadius: '5px', border: '1px solid #f1948a' }}>
            <strong>❌ Erro de Sintaxe:</strong> {error}
          </div>
        )}

        {soql && (
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Output SOQL (Salesforce Format):</label>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#2c3e50', 
              color: '#2ecc71', 
              borderRadius: '5px',
              fontFamily: 'monospace',
              fontSize: '1.2rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}>
              {soql}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoqlPlayground;