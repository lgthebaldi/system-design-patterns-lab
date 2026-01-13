// frontend/src/components/FinancialDashboard.jsx
import { useState } from 'react';

const FinancialDashboard = () => {
    // State for form inputs
    const [formData, setFormData] = useState({
        principal: 1000,
        rate: 5,
        years: 10
    });

    // State for the result and loading status
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: Number(e.target.value)
        });
    };

    // Function to call the API Gateway
    const calculateProjection = async () => {
        setLoading(true);
        setResult(null);

        try {
            // We call Node.js (3001), NOT Python (8000)
            // Node will proxy this request to the Python Microservice
            const response = await fetch('http://localhost:3001/api/finance/calculate-compound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("API Error:", error);
            alert("Failed to connect to the Financial Service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1>💰 Week 4: Polyglot Microservices</h1>
                <p>React → Node.js Gateway → Python Financial Service</p>
            </header>

            <div style={styles.card}>
                <h3>Compound Interest Calculator</h3>
                
                <div style={styles.inputGroup}>
                    <label>Principal Amount ($)</label>
                    <input 
                        type="number" 
                        name="principal" 
                        value={formData.principal} 
                        onChange={handleChange} 
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Annual Interest Rate (%)</label>
                    <input 
                        type="number" 
                        name="rate" 
                        value={formData.rate} 
                        onChange={handleChange} 
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Time Period (Years)</label>
                    <input 
                        type="number" 
                        name="years" 
                        value={formData.years} 
                        onChange={handleChange} 
                        style={styles.input}
                    />
                </div>

                <button 
                    onClick={calculateProjection} 
                    disabled={loading}
                    style={styles.button}
                >
                    {loading ? "Calculating via Python..." : "Calculate Projection"}
                </button>

                {result && (
                    <div style={styles.result}>
                        <h4>Projection Result:</h4>
                        <div style={styles.bigNumber}>
                            ${result.final_amount.toLocaleString()}
                        </div>
                        <p>Total Return after {result.years} years.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// CSS-in-JS Styles
const styles = {
    container: { padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Segoe UI' },
    header: { textAlign: 'center', marginBottom: '40px', color: '#2c3e50' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
    inputGroup: { marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' },
    button: { width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', marginTop: '10px' },
    result: { marginTop: '30px', padding: '20px', backgroundColor: '#e8f8f5', borderRadius: '5px', textAlign: 'center', border: '1px solid #27ae60' },
    bigNumber: { fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60', margin: '10px 0' }
};

export default FinancialDashboard;