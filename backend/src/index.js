import express from 'express';
import mongoose from 'mongoose';
import mqtt from 'mqtt';
import nodemailer from 'nodemailer';
import 'dotenv/config'; // Carga las variables del .env

// Importar los modelos de la DB
import Measurement from './models/Measurement.js';
import AlertLog from './models/AlertLog.js';

// --- Configuraciones ---
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

// --- Conexión a MongoDB ---
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// --- Configuración de Nodemailer (para los correos) ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // O el servicio que uses
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// --- Conexión al Broker MQTT ---
const clientMQTT = mqtt.connect(process.env.MQTT_BROKER_URL);

clientMQTT.on('connect', () => {
  console.log('✅ Conectado al Broker MQTT');
  
  // Suscribirse a los tópicos
  clientMQTT.subscribe(process.env.MQTT_TOPIC_DATA, (err) => {
    if (!err) console.log(`Suscrito a ${process.env.MQTT_TOPIC_DATA}`);
  });
  
  clientMQTT.subscribe(process.env.MQTT_TOPIC_ALERT, (err) => {
    if (!err) console.log(`Suscrito a ${process.env.MQTT_TOPIC_ALERT}`);
  });
});

// --- Lógica principal: Escuchar mensajes MQTT ---
clientMQTT.on('message', async (topic, message) => {
  const payload = JSON.parse(message.toString());

  if (topic === process.env.MQTT_TOPIC_DATA) {
    // Es un dato de sensor
    console.log(`[DATA] Recibido: ${message.toString()}`);
    try {
      const newMeasurement = new Measurement(payload);
      await newMeasurement.save();
    } catch (error) {
      console.error('Error guardando medición:', error);
    }
  }

  if (topic === process.env.MQTT_TOPIC_ALERT) {
    // Es una alerta
    console.log(`[ALERTA] Recibido: ${message.toString()}`);
    try {
      // 1. Guardar el log en la DB
      const newLog = new AlertLog({
        type: payload.type || 'General',
        message: payload.message,
        sensor: payload.sensor
      });
      await newLog.save();

      // 2. Enviar correo
      await sendAlertEmail(newLog);

    } catch (error) {
      console.error('Error procesando alerta:', error);
    }
  }
});

// Función para enviar correo
async function sendAlertEmail(alertLog) {
  console.log('Enviando correo...');
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: `🚨 Alerta de IoT: ${alertLog.type}`,
    text: `Se ha registrado una nueva alerta:
           Sensor: ${alertLog.sensor}
           Mensaje: ${alertLog.message}
           Hora: ${alertLog.timestamp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo de alerta enviado.');
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

// --- API Endpoints para el Dashboard ---
// Endpoint para obtener las últimas 100 mediciones
app.get('/api/measurements', async (req, res) => {
  const data = await Measurement.find().sort({ timestamp: -1 }).limit(100);
  res.json(data);
});

// Endpoint para obtener todos los logs de alertas
app.get('/api/logs', async (req, res) => {
  const logs = await AlertLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});