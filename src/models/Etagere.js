const mongoose = require('mongoose');

const etagereSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Le nom de l\'étagere/genre est obligatoire.'],
        trim: true,
        unique: false // Important que ce soit false ici
    }
}, { timestamps: true });

// Assurez-vous que cette ligne est DÉCOMMENTÉE et active
etagereSchema.index({ name: 1, userId: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

module.exports = mongoose.model('Etagere', etagereSchema);
