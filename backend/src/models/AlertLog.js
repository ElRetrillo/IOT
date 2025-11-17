import mongoose from 'mongoose';
const { Schema } = mongoose;

const alertLogSchema = new Schema({
  type: { type: String, required: true, enum: ['Movimiento', 'CalidadAire', 'General', 'StressTest'] },
  message: { type: String, required: true },
  sensor: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const AlertLog = mongoose.model('AlertLog', alertLogSchema);
export default AlertLog;