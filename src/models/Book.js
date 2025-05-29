// src/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: { type: String, required: [true, 'Le titre est obligatoire.'] }, // Ajout du message d'erreur
    author: { 
        type: [String], 
        required: [true, 'L\'auteur est obligatoire.'],
        validate: [v => Array.isArray(v) && v.length > 0, 'Au moins un auteur est requis.'] // Assure que le tableau n'est pas vide
    },
    status: { 
        type: String, 
        required: true, // Le statut est maintenant requis
        default: 'À lire', 
        enum: ['À lire', 'En cours', 'Terminé', 'Souhaité'] 
    },
    coverUrl: { type: String, default: '' }, // Ajout de default
    publisher: { type: String, default: '' }, // Ajout de default
    publishedDate: { type: String, default: '' },
    pageCount: { type: Number, min: 0, default: null }, // Permettre null si inconnu, min 0 si fourni
    isbn: { type: String, default: '' },
    genre: { type: String, default: '' },
    startDate: { type: Date, default: null }, // Permettre null
    endDate: { type: Date, default: null },   // Permettre null
    tags: { type: [String], default: [] },
    notes: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    currentPage: {
        type: Number,
        min: 0,
        default: 0,
        validate: { // Validation personnalisée pour currentPage
            validator: function(value) {
                // currentPage ne peut pas être supérieur à pageCount SI pageCount est défini et > 0
                // Si pageCount est null ou 0, cette validation ne s'applique pas pour la supériorité.
                if (this.pageCount !== null && this.pageCount > 0) {
                    return value <= this.pageCount;
                }
                return true; // Pas de pageCount, donc currentPage est valide
            },
            message: props => `La page actuelle (${props.value}) ne peut pas dépasser le nombre total de pages (${this.pageCount}).`
        }
    }
}, { timestamps: true });

// --- AJOUT/VÉRIFICATION DE LA LOGIQUE DE PRÉ-SAUVEGARDE ---
bookSchema.pre('save', function(next) {
    console.log(`[HOOK PRE-SAVE pour ${this.title}] - isNew: ${this.isNew}, isModified('status'): ${this.isModified('status')}, status actuel: ${this.status}`);

    // Si le statut est "Terminé" (soit à la création, soit lors d'une modification vers "Terminé")
    if (this.status === 'Terminé') {
        console.log(`[HOOK PRE-SAVE pour ${this.title}] - Statut est "Terminé".`);
        if (this.pageCount !== null && this.pageCount > 0) {
            if (this.currentPage !== this.pageCount) {
                console.log(`[HOOK PRE-SAVE pour ${this.title}] - Ajustement currentPage à pageCount (${this.pageCount}).`);
                this.currentPage = this.pageCount;
            }
        }
        if (!this.endDate) {
            console.log(`[HOOK PRE-SAVE pour ${this.title}] - Mise à jour de endDate à la date actuelle.`);
            this.endDate = new Date();
        }
        // Si le livre est marqué comme terminé, il doit avoir une date de début.
        if (!this.startDate && this.endDate) {
            console.log(`[HOOK PRE-SAVE pour ${this.title}] - Mise à jour de startDate à endDate.`);
             this.startDate = this.endDate;
        }
    } else { // Si le statut N'EST PAS "Terminé" (donc "À lire", "En cours", "Souhaité")
        // Si le statut a été modifié et N'EST PLUS "Terminé", on efface la date de fin.
        // Pour cela, il faudrait savoir si l'ancienne valeur était "Terminé".
        // Une façon de gérer cela est si la route PUT envoie explicitement endDate: null
        // ou si on le fait ici SI le statut est modifié et n'est pas "Terminé".
        if (this.isModified('status')) { // Si le statut a changé et qu'il n'est PAS "Terminé"
            console.log(`[HOOK PRE-SAVE pour ${this.title}] - Statut modifié et n'est pas "Terminé", donc endDate mis à null.`);
            this.endDate = null;
        }
    }
    
    // Plafonner currentPage (déjà dans votre validation de champ, mais redondance ok)
    if (this.pageCount !== null && this.pageCount > 0 && this.currentPage > this.pageCount) {
        console.log(`[HOOK PRE-SAVE pour ${this.title}] - currentPage (${this.currentPage}) plafonné à pageCount (${this.pageCount}).`);
        this.currentPage = this.pageCount;
    }

    // Si le statut n'est pas "En cours" ni "Terminé", currentPage devrait être 0.
    if (this.status !== 'En cours' && this.status !== 'Terminé') {
        if (this.pageCount !== null && this.pageCount > 0) { // Ne remet à 0 que si le livre a des pages
            if (this.currentPage !== 0) {
                console.log(`[HOOK PRE-SAVE pour ${this.title}] - Statut (${this.status}), currentPage remis à 0.`);
                this.currentPage = 0;
            }
        }
    }
    
    next();
});
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

