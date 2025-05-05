// models/Etagere.js
const mongoose = require('mongoose');

const etagereSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom de l\'étagere/genre est obligatoire.'],
        trim: true,     // Enlève les espaces au début et à la fin
        unique: true,   // TRÈS IMPORTANT: Empêche les doublons de noms
       
         //index: { collation: { locale: 'fr', strength: 2 } } // force l'unicité insensible à la casse
    },
   
     //userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

// Créer un index insensible à la casse si vous n'utilisez pas la collation dans la définition du champ

etagereSchema.index({ name: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });


module.exports = mongoose.model('Etagere', etagereSchema);
