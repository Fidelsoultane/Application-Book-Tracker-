// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Le nom d\'utilisateur est obligatoire.'],
        unique: true, // Le nom d'utilisateur doit être unique
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'L\'email est obligatoire.'],
        unique: true, // L'email doit être unique
        trim: true,
        lowercase: true, // Stocke l'email en minuscules
        match: [/.+\@.+\..+/, 'Veuillez entrer une adresse email valide.'] // Validation simple du format
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire.'],
        minlength: 6 // Impose une longueur minimale pour la sécurité
        // Le mot de passe sera stocké HACHÉ, jamais en clair !
    }
    // Nous n'ajoutons PAS de référence directe aux livres/étagères ici,
    // ce sont les livres/étagères qui référenceront l'utilisateur.
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// TODO (étape suivante): Ajouter une méthode pour hacher le mot de passe avant de sauvegarder
// TODO (étape suivante): Ajouter une méthode pour comparer le mot de passe fourni lors du login

module.exports = mongoose.model('User', userSchema);