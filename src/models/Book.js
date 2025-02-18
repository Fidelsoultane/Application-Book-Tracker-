const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    status: { type: String, enum: ['À lire', 'En cours', 'Terminé'], default: 'À lire' }
});

module.exports = mongoose.model('Book', BookSchema);
