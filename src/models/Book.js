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

// --- AJOUT DES INDEX ---
// Ajoutez ces lignes APRES la définition de bookSchema

bookSchema.index({ status: 1 });          // Pour filtrer par statut
bookSchema.index({ genre: 1 });           // Pour filtrer par genre
bookSchema.index({ title: 1 });           // Pour trier par titre (1 = ascendant)
bookSchema.index({ author: 1 });          // Pour trier/filtrer par auteur
bookSchema.index({ publisher: 'text' }); // Index texte pour recherche partielle insensible casse sur publisher
// Ou si vous préférez la recherche insensible à la casse via regex comme avant:
// bookSchema.index({ publisher: 1 });
bookSchema.index({ tags: 1 });            // Index sur le tableau de tags (utile pour $in)
bookSchema.index({ rating: -1 });         // Pour trier par note (ex: -1 = descendant)
bookSchema.index({ createdAt: -1 });      // Index pour trier par date d'ajout (descendant = plus récent d'abord)
bookSchema.index({ publishedDate: -1 });  // Index pour trier par date de publication

// Optionnel: Index Composé (si vous filtrez/triez souvent sur plusieurs champs ENSEMBLE)
 bookSchema.index({ status: 1, title: 1 }); // Exemple: filtre statut ET tri titre

// Optionnel: Index Texte (pour recherche full-text plus avancée sur plusieurs champs)
 bookSchema.index({ title: 'text', author: 'text', notes: 'text', tags: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

