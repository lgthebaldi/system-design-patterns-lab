// frontend/src/components/RenderEngine.jsx
import React from 'react';

const ComponentMap = {
  section: ({ title, children }) => (
    <div style={{ marginBottom: '30px', width: '100%' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#2c3e50' }}>{title}</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>{children}</div>
    </div>
  ),
  alert: ({ message, variant }) => (
    <div style={{
      padding: '15px', backgroundColor: variant === 'info' ? '#d1ecf1' : '#f8d7da',
      color: variant === 'info' ? '#0c5460' : '#721c24',
      borderRadius: '5px', marginBottom: '15px', border: '1px solid currentColor', width: '100%'
    }}>
      <strong>ℹ️ System:</strong> {message}
    </div>
  ),
  card: ({ title, value, icon }) => (
    <div style={{
      backgroundColor: 'white', padding: '20px', borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flex: 1, minWidth: '200px',
      textAlign: 'center', border: '1px solid #eee'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon === 'users' ? '👥' : '💰'}</div>
      <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>{title}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: '#2c3e50' }}>{value}</p>
    </div>
  ),
  input: ({ id, label, placeholder, formData, setFormData }) => (
    <div style={{ marginBottom: '15px', width: '100%' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{label}</label>
      <input 
        type="text" 
        placeholder={placeholder}
        value={formData[id] || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
        style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }} 
      />
    </div>
  ),
  button: ({ label, color }) => (
    <button style={{
      padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', border: 'none', color: 'white',
      backgroundColor: color === 'primary' ? '#007bff' : '#6c757d'
    }}>{label}</button>
  )
};

const RenderEngine = ({ data, formData, setFormData }) => {
  if (!data || !Array.isArray(data)) return null;
  return (
    <>
      {data.map((item, index) => {
        // Fallback para 'input' se o tipo for omitido mas houver ID
        const componentType = item.type || (item.id ? 'input' : null);
        const Component = ComponentMap[componentType];
        
        if (!Component) return null;
        
        return (
          <Component 
            key={index} 
            {...item.props} 
            {...item} 
            formData={formData} 
            setFormData={setFormData}
          >
            {item.children && (
                <RenderEngine data={item.children} formData={formData} setFormData={setFormData} />
            )}
          </Component>
        );
      })}
    </>
  );
};

export default RenderEngine;