import { useState, useEffect } from 'react';
import './App.css'; // Importando o estilo externo (mais limpo)

function App() {
  // Estado inicial tenta pegar o token do navegador (se já tiver logado antes)
  const [token, setToken] = useState(localStorage.getItem('triad_token'));
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. O "Pulo do Gato": Captura o Token quando volta do Salesforce
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      console.log("🔑 Security: Token capturado da URL.");
      localStorage.setItem('triad_token', tokenFromUrl); // Salva no cofre do navegador
      setToken(tokenFromUrl);
      
      // Limpa a URL para o usuário não ver o token gigante
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  // 2. Ação de Login (Manda pro Backend -> Salesforce)
  const handleLogin = () => {
    console.log("🔄 Iniciando fluxo OAuth2...");
    window.location.href = "http://localhost:3001/auth/login";
  };

  // 3. Ação de Logout (Rasga o crachá)
  const handleLogout = () => {
    console.log("👋 Logout efetuado.");
    localStorage.removeItem('triad_token');
    setToken(null);
    setLogs([]); // Limpa a tela
  };

  // 4. Ação de Executar (Agora manda o Token junto!)
  const runIntegration = async () => {
    setLoading(true);
    // Limpa logs antigos e avisa que começou
    setLogs((prev) => ["🚀 Iniciando Pipeline Seguro...", ...prev]);

    try {
      // AQUI ESTÁ A DIFERENÇA: Header Authorization
      const response = await fetch('http://localhost:3001/run-week1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      // Se o token venceu ou é falso
      if (response.status === 401 || response.status === 403) {
        setLogs((prev) => ["❌ Sessão Expirada. Faça login novamente.", ...prev]);
        handleLogout(); // Chuta o usuário pra fora
        return;
      }

      const data = await response.json();
      
      if (response.ok) {
        setLogs((prev) => [`✅ SUCESSO: ${data.message}`, ...prev]);
        if(data.logs) setLogs((prev) => [`📜 LOGS DO PYTHON:\n${data.logs}`, ...prev]);
      } else {
        setLogs((prev) => [`⚠️ Erro no Servidor: ${data.message}`, ...prev]);
      }

    } catch (error) {
      setLogs((prev) => [`❌ Erro de Rede: ${error.message}`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Triad Architecture Portal 2026</h1>
        <p>Control Center for Cross-Cloud Operations (AWS | Azure | Salesforce)</p>
      </header>
      
      {/* LÓGICA CONDICIONAL: Mostra Login ou Dashboard */}
      {!token ? (
        <div className="login-box">
          <h2>🔒 Acesso Restrito</h2>
          <p>Você precisa se autenticar via Salesforce para acessar o controle.</p>
          <button onClick={handleLogin} className="btn-login">
            ☁️ Login com Salesforce
          </button>
        </div>
      ) : (
        <div className="dashboard">
          <div className="toolbar">
            <span className="badge">🟢 Acesso de Arquiteto Liberado</span>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </div>

          <div className="card">
            <h2>Week 1: The Hybrid Connector</h2>
            <p className="description">
              Módulo de orquestração segura. Busca config no <strong>AWS S3</strong>, 
              valida via <strong>Azure Entra ID</strong> e cria logs no <strong>Salesforce</strong>.
            </p>
            
            <button onClick={runIntegration} disabled={loading} className="btn-run">
              {loading ? "⏳ Executando..." : "▶️ Rodar Integração"}
            </button>
          </div>

          <div className="terminal-container">
            <h3>Logs de Execução</h3>
            <div className="terminal">
              <pre>
                {logs.length === 0 ? "> Aguardando comando..." : logs.map((log, i) => <div key={i}>{log}</div>)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;