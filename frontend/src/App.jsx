// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// IMPORT YOUR PAGES
import Dashboard from './components/Dashboard'; 
import BatchSync from './components/BatchSync'; 
import ConfigDrivenUI from './components/ConfigDrivenUI';
import SoqlPlayground from './components/SoqlPlayground'; // Importação do componente real da Semana 4

// Navigation Bar Component
const NavBar = () => (
  <nav style={styles.nav}>
    <h2 style={styles.brand}>Triad Architecture</h2>
    <div style={styles.links}>
      <Link to="/" style={styles.link}>Week 1: Connector</Link>
      <Link to="/batch-sync" style={styles.link}>Week 2: Batch Sync</Link>
      <Link to="/server-driven" style={styles.link}>Week 3: Config UI</Link>
      {/* ATUALIZADO: Semana 4 com o nome correto */}
      <Link to="/soql-transpiler" style={styles.activeLink}>Week 4: SOQL Transpiler</Link>
    </div>
  </nav>
);

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        <NavBar />
        
        <div style={styles.content}>
          <Routes>
            {/* Route for Week 1 (Default Home) */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Route for Week 2 */}
            <Route path="/batch-sync" element={<BatchSync />} />

            {/* Route for Week 3 */}
            <Route path="/server-driven" element={<ConfigDrivenUI />} />

            {/* ATUALIZADO: Rota para o Transpiler real da Semana 4 */}
            <Route path="/soql-transpiler" element={<SoqlPlayground />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: { fontFamily: 'Segoe UI, sans-serif' },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: '#2c3e50',
    color: 'white'
  },
  brand: { margin: 0, fontSize: '1.2rem' },
  links: { display: 'flex', gap: '20px' },
  link: { color: '#bdc3c7', textDecoration: 'none', fontWeight: 'bold' },
  // Estilo para destacar a entrega atual
  activeLink: { color: '#2ecc71', textDecoration: 'none', fontWeight: 'bold' },
  content: { padding: '20px' }
};

export default App;