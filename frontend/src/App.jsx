// En: frontend/src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- NUEVO 1: Importar Chart.js y el gráfico de Torta (Pie) ---
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// --- NUEVO 2: Registrar los componentes necesarios de Chart.js ---
ChartJS.register(ArcElement, Tooltip, Legend);


// Función de fetch (la dejamos igual)
const fetchData = async (setLogs, setMeasurements, setError) => {
  try {
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

function App() {
  const [logs, setLogs] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [error, setError] = useState(null);

  // useEffect para el Polling (lo dejamos igual)
  useEffect(() => {
    fetchData(setLogs, setMeasurements, setError);
    const intervalId = setInterval(() => {
      fetchData(setLogs, setMeasurements, setError);
    }, 3000); 
    return () => clearInterval(intervalId);
  }, []);

  
  // --- NUEVO 3: Procesar datos para el gráfico ---
  // useMemo recalcula esto solo cuando la data de 'logs' cambia.
  const chartData = useMemo(() => {
    // 1. Contar cuántas veces aparece cada 'tipo' de alerta
    const counts = logs.reduce((acc, log) => {
      const type = log.type || 'Indefinido'; // Agrupa logs sin tipo
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}); // Resultado ej: { Movimiento: 5, CalidadAire: 2 }

    const labels = Object.keys(counts);
    const dataValues = Object.values(counts);

    // 2. Asignar colores a cada tipo de alerta
    const backgroundColors = labels.map(label => {
      if (label === 'Movimiento') return 'rgba(255, 99, 132, 0.5)'; // Rojo
      if (label === 'CalidadAire') return 'rgba(255, 206, 86, 0.5)'; // Naranja
      if (label === 'Test') return 'rgba(75, 192, 192, 0.5)'; // Verde
      return 'rgba(153, 102, 255, 0.5)'; // Morado (default)
    });

    const borderColors = backgroundColors.map(color => color.replace('0.5', '1'));

    // 3. Formatear para Chart.js
    return {
      labels: labels,
      datasets: [{
        label: '# de Alertas',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      }],
    };
  }, [logs]); // Dependencia: se actualiza solo si 'logs' cambia


  // Función para formatear la fecha (la dejamos igual)
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

      {/* --- NUEVO 4: Grid Layout actualizado --- */}
      <main className="content-grid">

        {/* --- Sección de Estadísticas (NUEVA) --- */}
        <section className="card">
          <h2>Estadísticas de Alertas</h2>
          <div style={{ position: 'relative', height: '300px' }}>
            <Pie 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false, // Permite que el gráfico llene el div
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} 
            />
          </div>
        </section>

        {/* --- Sección de Alertas / Logs (Original) --- */}
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

        {/* --- Sección de Mediciones (MODIFICADA) --- */}
        <section className="card full-width-card"> {/* <-- Clase nueva */}
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