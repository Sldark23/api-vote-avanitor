// api/vote.js
import { connectToDatabase } from '../utils/mongo.js';
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: String,
  status: Boolean,
  coins: Number,
  cooldowns: {
    daily: Number,
    work: Number,
    roubar: Number,
    auxilio: Number
  },
  streak: {
    daily: Number,
    lastDaily: Number
  },
  protecaoroubo: Boolean,
  mundoJob: String
});
const ExtratoSchema = new mongoose.Schema({
  userId: String,
  tipo: String,
  valor: Number,
  descricao: String,
  data: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Extrato = mongoose.models.Extrato || mongoose.model('Extrato', ExtratoSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  await connectToDatabase();

  const { user } = req.body;
  if (!user) return res.status(400).json({ error: 'User ID ausente' });

  const recompensa = 15000;

  const userDb = await User.findById(user) || new User({ _id: user });
  userDb.coins += recompensa;
  await userDb.save();

  await Extrato.create({
    userId: user,
    tipo: 'Recebido',
    valor: recompensa,
    descricao: 'Recompensa por voto no bot',
    data: new Date()
  });

  return res.status(200).json({ message: `Recompensa de ${recompensa.toLocaleString()} AC$ entregue a ${user}.` });
}
