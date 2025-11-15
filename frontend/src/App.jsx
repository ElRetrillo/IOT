// En: frontend/src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [error, setError] = useState(null);

  // Esta función se ejecuta una vez, cuando el componente se carga
  useEffect(() => {
    
    // Función interna para cargar los datos
    const fetchData = async () => {
      try {
        // Pedimos los datos a la API del backend
        const [logsResponse, measurementsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/logs'),
          fetch('http://localhost:3001/api/measurements')
        ]);

        if (!logsResponse.ok || !measurementsResponse.ok) {
          throw new Error('Error al conectar con la API');
        }

        const logsData = await logsResponse.json();
        const measurementsData = await measurementsResponse.json();

        setLogs(logsData);
        setMeasurements(measurementsData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la data. ¿El backend está corriendo?');
      }
    };

    fetchData(); // Llama a la función
  }, []); // El array vacío [] significa "ejecutar solo una vez"


  // Función para formatear la fecha
  const formatTimestamp = (dateString) => {
    const options = {
      day: 'numeric', month: 'numeric', year: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };
    return new Date(dateString).toLocaleString('es-CL', options);
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Dashboard IoT</h1>
        {error && <p className="error-banner">{error}</p>}
      </header>

      <main className="content-grid">
        {/* --- Sección de Alertas / Logs --- */}
        <section className="card">
          <h2>Logs de Alertas</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Sensor</th>
                <th>Mensaje</th>
              </tr>
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

        {/* --- Sección de Mediciones --- */}
        <section className="card">
          <h2>Últimas Mediciones (MQ-135)</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Sensor</th>
                <th>Valor (Crudo)</th>
              </tr>
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