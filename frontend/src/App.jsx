import { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Login from './Login';

ChartJS.register(ArcElement, Tooltip, Legend);

const fetchData = async (setLogs, setMeasurements, setStats, setError, token) => {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const [logsResponse, measurementsResponse, statsResponse] = await Promise.all([
      fetch('http://localhost:3001/api/logs', { headers }),
      fetch('http://localhost:3001/api/measurements', { headers }),
      fetch('http://localhost:3001/api/stats', { headers })
    ]);

    if (logsResponse.status === 401 || measurementsResponse.status === 401) {
      throw new Error('Unauthorized');
    }

    if (!logsResponse.ok || !measurementsResponse.ok || !statsResponse.ok) {
      throw new Error('Error al conectar con la API');
    }

    const logsData = await logsResponse.json();
    const measurementsData = await measurementsResponse.json();
    const statsData = await statsResponse.json();

    setLogs(logsData);
    setMeasurements(measurementsData);
    setStats(statsData);
    setError(null);
    return true;
  } catch (err) {
    if (err.message === 'Unauthorized') return false;
    console.error(err);
    setError('No se pudo cargar la data.');
    return true;
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('iot_token'));

  // modo del sistema 
  const [systemMode, setSystemMode] = useState("HOGAR");

  const [logs, setLogs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState({ processing_latency_ms: 0 });
  const [error, setError] = useState(null);

  
  const changeMode = async (newMode) => {
    try {
      const response = await fetch('http://localhost:3001/api/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mode: newMode })
      });

      if (response.ok) {
        setSystemMode(newMode); 
        console.log(`Modo cambiado a ${newMode}`);
      } else {
        console.error("Error al cambiar modo en el servidor");
      }
    } catch (error) {
      console.error("Error de red cambiando modo:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchData(setLogs, setMeasurements, setStats, setError, token).then(success => {
      if (!success) logout();
    });

    const intervalId = setInterval(() => {
      fetchData(setLogs, setMeasurements, setStats, setError, token).then(success => {
        if (!success) logout();
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [token]);

  
  const chartData = useMemo(() => {
    const counts = logs.reduce((acc, log) => {
      const type = log.type || 'Indefinido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(counts);
    return {
      labels: labels,
      datasets: [{
        label: '# de Alertas',
        data: Object.values(counts),
        backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(255, 206, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      }],
    };
  }, [logs]);

  const formatTimestamp = (dateString) => {
    const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(dateString).toLocaleString('es-CL', options);
  };

  const logout = () => {
    localStorage.removeItem('iot_token');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={setToken} />;
  }

  return (
    <div className="dashboard-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard IoT</h1>
        <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#d93025', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      {error && <p className="error-banner">{error}</p>}

      <main className="content-grid">

        {/* CONTROL DE MODO*/}
        <section className="card full-width-card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2>Modo del Sistema</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem' }}>

            <button
              onClick={() => changeMode("HOGAR")}
              style={{
                padding: '15px 30px',
                fontSize: '1.2rem',
                backgroundColor: systemMode === "HOGAR" ? '#4CAF50' : '#444',
                color: 'white',
                border: '2px solid #4CAF50',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Modo Hogar
              <div style={{ fontSize: '0.8rem', marginTop: '5px', opacity: 0.8 }}>Buzzer ON | Correo OFF</div>
            </button>

            <button
              onClick={() => changeMode("SALIDA")}
              style={{
                padding: '15px 30px',
                fontSize: '1.2rem',
                backgroundColor: systemMode === "SALIDA" ? '#d93025' : '#444',
                color: 'white',
                border: '2px solid #d93025',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Modo Salida
              <div style={{ fontSize: '0.8rem', marginTop: '5px', opacity: 0.8 }}>Buzzer OFF | Correo ON</div>
            </button>

          </div>
        </section>

        <section className="card">
          <h2>Estadísticas de Alertas</h2>
          <div style={{ position: 'relative', height: '300px' }}>
            <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
          </div>
        </section>

        <section className="card">
          <h2>Estadísticas en Vivo</h2>
          <div style={{ padding: '1rem' }}>
            <h4>Latencia de Procesamiento (Backend)</h4>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats.processing_latency_ms.toFixed(2)} ms
            </p>
            <small>(Tiempo desde que MQTT recibe la alerta hasta que se envía el correo)</small>
          </div>
        </section>

        <section className="card">
          <h2>Logs de Alertas</h2>
          <table>
            <thead>
              <tr><th>Fecha y Hora</th><th>Sensor</th><th>Mensaje</th></tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className={`log-type-${log.type?.toLowerCase()}`}>
                  <td>{formatTimestamp(log.timestamp)}</td>
                  <td>{log.sensor}</td>
                  <td>{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card full-width-card">
          <h2>Últimas Mediciones (MQ-135)</h2>
          <table>
            <thead>
              <tr><th>Fecha y Hora</th><th>Sensor</th><th>Valor (Crudo)</th></tr>
            </thead>
            <tbody>
              {measurements.filter(m => m.sensor === 'mq135').map((m) => (
                <tr key={m._id}>
                  <td>{formatTimestamp(m.timestamp)}</td>
                  <td>{m.sensor}</td>
                  <td>{m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default App;