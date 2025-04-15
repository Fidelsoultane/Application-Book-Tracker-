// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: [String], required: true }, // ou type: String
    status: { type: String, required: true, default: 'À lire', enum: ['À lire', 'En cours', 'Terminé', 'Souhaité'] },
    coverUrl: { type: String },
    publisher: { type: String },
    publishedDate: { type: String }, // Ou type: Date
    pageCount: { type: Number },
    isbn: { type: String },
    genre: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    tags: { type: [String], default: [] }, // Ajout du champ tags (tableau de strings)
    notes: { type: String, default: '' }, // AJOUT DU CHAMP NOTES
    rating: { // AJOUT DU CHAMP RATING
        type: Number,
        min: 0,   // Note minimale (0 ou 0.5 si vous voulez des demi-étoiles)
        max: 5,   // Note maximale
        default: 0 // Note par défaut (0 signifie non noté)
    }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

