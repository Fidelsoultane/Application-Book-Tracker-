// models/Book.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['À lire', 'En cours', 'Terminé', 'Souhaité'], default: 'À lire' },
    coverUrl: { type: String }, // **Nouveau champ pour l'URL de la couverture**
    // ... autres champs éventuels ...
});

module.exports = mongoose.model('Book', bookSchema);

