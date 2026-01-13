// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// IMPORT YOUR PAGES
import Dashboard from './components/Dashboard'; // Your old App.jsx code is here now
import BatchSync from './components/BatchSync'; // The new Week 2 code

import ConfigDrivenUI from './components/ConfigDrivenUI';
import FinancialDashboard from './components/FinancialDashboard';
// Navigation Bar Component
const NavBar = () => (
  <nav style={styles.nav}>
    <h2 style={styles.brand}>Triad Architecture</h2>
    <div style={styles.links}>
      <Link to="/" style={styles.link}>Week 1: Connector</Link>
      <Link to="/batch-sync" style={styles.link}>Week 2: Batch Sync</Link>
      <Link to="/server-driven" style={styles.link}>Week 3: Config UI</Link>
      <Link to="/finance" style={styles.link}>Week 4: FinService</Link>
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

            <Route path="/server-driven" element={<ConfigDrivenUI />} />

            <Route path="/finance" element={<FinancialDashboard />} />

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
  content: { padding: '20px' }
};

export default App;