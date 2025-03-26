// models/Etagere.js
const mongoose = require('mongoose');

const etagereSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true }, // Le nom de l'étagère est unique
    // Vous *pourriez* ajouter d'autres champs ici, comme une description, une icône, etc.
}, { timestamps: true });

const Etagere = mongoose.model('Etagere', etagereSchema); // Nom du modèle: Etagere

module.exports = Etagere;