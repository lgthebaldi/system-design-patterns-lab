// frontend/src/components/RenderEngine.jsx
import React from 'react';

// 1. Component Map
// This dictionary maps the JSON 'type' string to a real React Component
const ComponentMap = {
  // Simple Component: Alert Box
  alert: ({ message, variant }) => (
    <div style={{
      padding: '15px', 
      backgroundColor: variant === 'info' ? '#d1ecf1' : '#f8d7da',
      color: variant === 'info' ? '#0c5460' : '#721c24',
      borderRadius: '5px',
      marginBottom: '15px',
      border: '1px solid currentColor'
    }}>
      <strong>ℹ️ System Message:</strong> {message}
    </div>
  ),

  // Simple Component: Button
  button: ({ label, color }) => (
    <button style={{
      padding: '10px 20px',
      backgroundColor: color === 'primary' ? '#007bff' : '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px'
    }}>
      {label}
    </button>
  ),

  // Simple Component: Metric Card
  card: ({ title, value, icon }) => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: '200px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
        {icon === 'users' ? '👥' : '💰'}
      </div>
      <h3 style={{ margin: 0, color: '#666' }}>{title}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0' }}>{value}</p>
    </div>
  ),

  // Complex Component: Section (It has children!)
  section: ({ title, children }) => (
    <div style={{ marginBottom: '30px' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>{title}</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* RECURSION HAPPENS HERE: The section renders its own children */}
        {children} 
      </div>
    </div>
  )
};

// 2. The Recursive Engine
// It receives a JSON block and decides which component to use
export const RenderEngine = ({ config }) => {
  if (!config) return null;

  return config.map((block, index) => {
    // block = { type: "alert", props: {...} }
    const Component = ComponentMap[block.type];

    if (!Component) {
      return <div key={index} style={{color: 'red'}}>Unknown component: {block.type}</div>;
    }

    // If the block has children (like a section), we pass them through the Engine again!
    const children = block.children ? (
      <RenderEngine config={block.children} />
    ) : null;

    return (
      <Component key={index} {...block.props}>
        {children}
      </Component>
    );
  });
};