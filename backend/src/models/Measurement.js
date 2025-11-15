import mongoose from 'mongoose';
const { Schema } = mongoose;

const measurementSchema = new Schema({
  sensor: { type: String, required: true }, 
  value: { type: Number, required: true }, 
  timestamp: { type: Date, default: Date.now }
});

const Measurement = mongoose.model('Measurement', measurementSchema);
export default Measurement;