import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  // Aquí irían los campos para MFA si se añade
  // mfaSecret: { type: String },
  // mfaEnabled: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);
export default User;