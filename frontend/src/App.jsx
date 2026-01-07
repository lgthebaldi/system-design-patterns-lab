import { useState } from 'react'

function App() {
  const [status, setStatus] = useState("Ready")
  const [logs, setLogs] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const runWeek1Integration = async () => {
    setIsLoading(true)
    setStatus("Running Triad Integration...")
    setLogs("Initializing connection with Backend...")

    try {
      // Calls the Node.js Backend endpoint
      const response = await fetch('http://localhost:3001/run-week1')
      const data = await response.json()

      if (response.ok) {
        setStatus("Success")
        // data.logs contains the 'stdout' from your Python script
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
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Triad Architecture Portal 2026</h1>
        <p>Control Center for Cross-Cloud Operations (AWS | Azure | Salesforce)</p>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2>Week 1: The Hybrid Connector</h2>
          <p style={styles.description}>
            This module triggers a Python orchestration to fetch config from <strong>AWS S3</strong>, 
            verify identity via <strong>Azure Entra ID</strong>, and create a record in <strong>Salesforce</strong>.
          </p>

          <div style={styles.statusBadge}>
            Status: <span style={{ color: status === "Success" ? "#28a745" : "#007bff" }}>{status}</span>
          </div>

          <button 
            onClick={runWeek1Integration} 
            disabled={isLoading}
            style={{
              ...styles.button,
              backgroundColor: isLoading ? "#ccc" : "#007bff",
              cursor: isLoading ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? "Executing..." : "Run Integration"}
          </button>
        </section>

        <section style={styles.terminalContainer}>
          <h3>Execution Logs</h3>
          <div style={styles.terminal}>
            <pre style={styles.pre}>{logs || "> Waiting for execution..."}</pre>
          </div>
        </section>
      </main>
    </div>
  )
}

// Simple CSS-in-JS for clean visualization
const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    borderBottom: '2px solid #dee2e6',
    paddingBottom: '20px'
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  card: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  description: {
    color: '#6c757d',
    lineHeight: '1.5'
  },
  statusBadge: {
    margin: '20px 0',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  button: {
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '5px',
    fontSize: '1rem',
    transition: '0.3s'
  },
  terminalContainer: {
    marginTop: '10px'
  },
  terminal: {
    backgroundColor: '#212529',
    color: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    minHeight: '200px',
    overflowX: 'auto'
  },
  pre: {
    margin: 0,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    fontSize: '0.9rem'
  }
}

export default App