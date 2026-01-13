// frontend/src/components/BatchSync.jsx
import React, { useState } from 'react';

const BatchSync = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  // Function to trigger the sync process
  const handleStartSync = async () => {
    setLoading(true);
    setStatus('Requesting sync...');
    setLogs([]);

    try {
      const response = await fetch('http://localhost:3001/api/sync/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If you re-enable auth later, add Authorization header here
        },
        body: JSON.stringify({ fileName: 'big-data-import.csv' }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('✅ Sync Started Successfully!');
        setLogs((prev) => [...prev, `Server: ${data.message}`, `File: ${data.file}`]);
      } else {
        setStatus('❌ Error starting sync');
        setLogs((prev) => [...prev, `Error: ${data.error}`]);
      }
    } catch (error) {
      setStatus('❌ Network Error');
      setLogs((prev) => [...prev, `Exception: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Week 2: High-Performance ETL</h2>
      <p style={styles.description}>
        Process large datasets from Azure Blob Storage using Node.js Streams and BullMQ.
        <br />
        <strong>Target File:</strong> big-data-import.csv
      </p>

      <div style={styles.card}>
        <div style={styles.statusIcon}>🚀</div>
        <h3>Batch Processor Engine</h3>
        
        <button 
          onClick={handleStartSync} 
          disabled={loading}
          style={loading ? styles.buttonDisabled : styles.button}
        >
          {loading ? 'Initiating...' : 'Start Batch Sync'}
        </button>

        {status && <div style={styles.status}>{status}</div>}
      </div>

      {logs.length > 0 && (
        <div style={styles.terminal}>
          {logs.map((log, index) => (
            <div key={index} style={styles.logLine}>&gt; {log}</div>
          ))}
          <div style={styles.logNote}>
            (Check your VS Code Backend Terminal to see the real-time stream logs)
          </div>
        </div>
      )}
    </div>
  );
};

// Simple inline styles for quick prototyping
const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
  title: { color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' },
  description: { color: '#7f8c8d', marginBottom: '2rem' },
  card: { 
    background: '#fff', 
    padding: '2rem', 
    borderRadius: '10px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    textAlign: 'center',
    border: '1px solid #e0e0e0'
  },
  statusIcon: { fontSize: '3rem', marginBottom: '1rem' },
  button: { 
    background: '#3498db', color: '#fff', border: 'none', padding: '12px 24px', 
    fontSize: '1rem', borderRadius: '5px', cursor: 'pointer', transition: 'background 0.3s' 
  },
  buttonDisabled: { 
    background: '#bdc3c7', color: '#fff', border: 'none', padding: '12px 24px', 
    fontSize: '1rem', borderRadius: '5px', cursor: 'not-allowed' 
  },
  status: { marginTop: '1rem', fontWeight: 'bold', color: '#27ae60' },
  terminal: {
    marginTop: '2rem',
    background: '#2c3e50',
    color: '#ecf0f1',
    padding: '1rem',
    borderRadius: '5px',
    fontFamily: 'monospace',
    textAlign: 'left'
  },
  logLine: { marginBottom: '5px' },
  logNote: { color: '#f1c40f', fontSize: '0.8rem', marginTop: '10px', fontStyle: 'italic' }
};

export default BatchSync;