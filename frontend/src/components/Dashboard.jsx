// frontend/src/components/Dashboard.jsx
import { useState } from 'react';

// RENAMED from 'App' to 'Dashboard'
function Dashboard() { 
  const [status, setStatus] = useState("Ready");
  const [logs, setLogs] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const runWeek1Integration = async () => {
    // ... (MANTENHA SUA LÓGICA IDENTICA AQUI) ...
    setIsLoading(true)
    setStatus("Running Triad Integration...")
    setLogs("Initializing connection with Backend...")

    try {
      const response = await fetch('http://localhost:3001/run-week1')
      const data = await response.json()

      if (response.ok) {
        setStatus("Success")
        setLogs(data.logs || "Integration executed successfully. No output returned.")
      } else {
        setStatus("Failed")
        setLogs(`Error Details: ${data.details || 'Unknown Error'}`)
      }
    } catch (error) {
      setStatus("Connection Error")
      setLogs("Could not reach the Backend server. Make sure node server.js is running on port 3001.")
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div style={styles.container}>
      {/* ... (MANTENHA SEU JSX IDENTICO AQUI) ... */}
       <header style={styles.header}>
        <h1>Week 1: The Hybrid Connector</h1>
        {/* ... restante do seu código ... */}
      </header>
      
      <main style={styles.main}>
          {/* ... botões, logs, etc ... */}
          <section style={styles.card}>
             {/* ... certifique-se de copiar tudo ... */}
             <button onClick={runWeek1Integration} disabled={isLoading}>
                {isLoading ? "Executing..." : "Run Integration"}
             </button>
             {/* ... */}
          </section>
          
          <section style={styles.terminalContainer}>
            <h3>Execution Logs</h3>
            <div style={styles.terminal}>
                <pre style={styles.pre}>{logs || "> Waiting for execution..."}</pre>
            </div>
          </section>
      </main>
    </div>
  );
}

// MANTENHA OS SEUS ESTILOS AQUI EMBAIXO
const styles = {
  // ... (copie seus estilos exatamente como estão) ...
  container: { padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' },
  // ... etc
  terminal: { backgroundColor: '#212529', color: '#f8f9fa', padding: '15px', borderRadius: '5px' },
  pre: { margin: 0, whiteSpace: 'pre-wrap' }
};

export default Dashboard; // EXPORT AS DASHBOARD