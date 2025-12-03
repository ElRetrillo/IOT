import express from 'express';
import mongoose from 'mongoose';
import mqtt from 'mqtt';
import nodemailer from 'nodemailer';
import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import process from 'process';
import User from './models/User.js';
import Measurement from './models/Measurement.js';
import AlertLog from './models/AlertLog.js';

//tiempo señal - correo
let lastProcessingTime_ms = 0;

const app = express();
const PORT = process.env.PORT || 3001;
const MQTT_TOPIC_MODE = 'iot/proyecto/mode';

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log(' Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// MQTT Broker
const clientMQTT = mqtt.connect(process.env.MQTT_BROKER_URL, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
});

clientMQTT.on('connect', () => {
  console.log('✅ Conectado al Broker MQTT');
  clientMQTT.subscribe(process.env.MQTT_TOPIC_DATA);
  clientMQTT.subscribe(process.env.MQTT_TOPIC_ALERT);
});

//MQTT
clientMQTT.on('message', async (topic, message) => {
  const payload = JSON.parse(message.toString());

  if (topic === process.env.MQTT_TOPIC_DATA) {
    console.log(`[DATA] Recibido: ${message.toString()}`);
    try {
      const newMeasurement = new Measurement(payload);
      await newMeasurement.save();
    } catch (error) {
      console.error('Error guardando medición:', error);
    }
  }

  if (topic === process.env.MQTT_TOPIC_ALERT) {
    const startTime = process.hrtime.bigint();
    console.log(`[ALERTA] Recibido: ${message.toString()}`);
    try {
      const newLog = new AlertLog({
        type: payload.type || 'General',
        message: payload.message,
        sensor: payload.sensor
      });
      await newLog.save();
      await sendAlertEmail(newLog);
    } catch (error) {
      console.error('Error procesando alerta:', error);
    } finally {
      const endTime = process.hrtime.bigint();
      lastProcessingTime_ms = Number(endTime - startTime) / 1_000_000;
      console.log(`Tiempo de procesamiento: ${lastProcessingTime_ms.toFixed(2)} ms`);
    }
  }
});

async function sendAlertEmail(alertLog) {
  console.log('Enviando correo...');
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: `Alerta IoT: ${alertLog.type}`,
    text: `El Sensor: ${alertLog.sensor}\n Se ha activado, Mensaje: ${alertLog.message}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado.');
  } catch (error) {
    console.error('Fallo envío correo (Posible Spam Filter):', error.message);
  }
}

// autenticacion con JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send({ message: "Acceso denegado" });

  try {
    const cleanToken = token.replace("Bearer ", "");
    const verified = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send({ message: "Token inválido" });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({ email, passwordHash });
    await newUser.save();
    res.status(201).send({ message: "Usuario creado" });
  } catch (error) {
    res.status(500).send({ message: "Error al registrar", error });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send({ message: "Credenciales inválidas" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).send({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).send({ message: "Error al iniciar sesión", error });
  }
});



// Latencia
app.get('/api/stats', verifyToken, (req, res) => {
  res.json({ processing_latency_ms: lastProcessingTime_ms });
});

app.get('/api/measurements', verifyToken, async (req, res) => {
  try {
    const data = await Measurement.find().sort({ timestamp: -1 }).limit(100);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo mediciones" });
  }
});


app.get('/api/logs', verifyToken, async (req, res) => {
  try {
    const logs = await AlertLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo logs" });
  }
});

app.post('/api/mode', verifyToken, (req, res) => {
  const { mode } = req.body;

  if (mode !== 'HOGAR' && mode !== 'SALIDA') {
    return res.status(400).json({ message: "Modo inválido" });
  }

  console.log(`Cambiando sistema a modo: ${mode}`);
  clientMQTT.publish(process.env.MQTT_TOPIC_MODE || 'iot/proyecto/mode', mode, { retain: true });

  res.json({ message: `Modo cambiado a ${mode}` });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});