// models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: [String], required: true }, // ou type: String
    status: { type: String, required: true, default: 'À lire', enum: ['À lire', 'En cours', 'Terminé', 'Souhaité'] },
    coverUrl: { type: String },
    publisher: { type: String },
    publishedDate: { type: String }, // Ou type: Date, selon vos besoins
    pageCount: { type: Number },
    isbn: { type: String },
    genre: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
}, { timestamps: true }); // Utilisez timestamps : PLUS SIMPLE et gère updatedAt

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

