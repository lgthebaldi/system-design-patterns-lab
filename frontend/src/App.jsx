// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// IMPORT YOUR PAGES
import Dashboard from './components/Dashboard'; 
import BatchSync from './components/BatchSync'; 
import ConfigDrivenUI from './components/ConfigDrivenUI';
import SoqlPlayground from './components/SoqlPlayground';

// Navigation Bar Component
const NavBar = () => (
  <nav style={styles.nav}>
    <h2 style={styles.brand}>Triad Architecture</h2>
    <div style={styles.links}>
      <Link to="/" style={styles.link}>Week 1: Connector</Link>
      <Link to="/batch-sync" style={styles.link}>Week 2: Batch Sync</Link>
      <Link to="/server-driven" style={styles.link}>Week 3: Config UI</Link>
      <Link to="/soql-transpiler" style={styles.link}>Week 4: SOQL Transpiler</Link>
      {/* ADDED: Week 5 Secure Vault Link */}
      <Link to="/secure-vault" style={styles.activeLink}>Week 5: Secure Vault</Link>
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/batch-sync" element={<BatchSync />} />

            {/* Week 3 remains as home config */}
            <Route path="/server-driven" element={<ConfigDrivenUI screenName="home" />} />

            {/* Week 4 */}
            <Route path="/soql-transpiler" element={<SoqlPlayground />} />

            {/* ADDED: Week 5 using the ConfigDrivenUI engine with 'vault' metadata */}
            <Route path="/secure-vault" element={<ConfigDrivenUI screenName="vault" />} />
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
  // Styled to highlight the latest delivery
  activeLink: { color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }, 
  content: { padding: '20px' }
};

export default App;