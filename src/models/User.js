// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Le nom d'utilisateur est requis."],
        unique: true, // Assure que chaque nom d'utilisateur est unique dans la collection
        trim: true,
        minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caractères."]
    },
    email: {
        type: String,
        required: [true, "L'email est requis."],
        unique: true, // Assure que chaque email est unique
        trim: true,
        lowercase: true, // Convertit l'email en minuscules avant de sauvegarder
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Veuillez fournir une adresse email valide."]
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est requis."],
        minlength: [6, "Le mot de passe doit contenir au moins 6 caractères."]
        // Ne pas mettre select: false si vous avez besoin d'y accéder pour la comparaison,
        // mais Mongoose ne le renverra pas par défaut dans les requêtes find() sans le spécifier.
    }
}, { timestamps: true }); // Ajoute createdAt et updatedAt

// Middleware Mongoose : Hachage du mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
    // Ne hache le mot de passe que s'il a été modifié (ou s'il est nouveau)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Génère un sel
        const salt = await bcrypt.genSalt(10); // 10 est un bon facteur de coût
        // Hache le mot de passe avec le sel
        this.password = await bcrypt.hash(this.password, salt);
        console.log("Mot de passe haché dans le hook pre-save (ne pas logger en production !)"); // Pour débogage
        next(); // Passe au prochain middleware ou à la sauvegarde
    } catch (error) {
        console.error("Erreur lors du hachage du mot de passe dans pre-save:", error);
        next(error); // Propage l'erreur
    }
});

// Méthode d'instance pour comparer le mot de passe fourni avec celui stocké (haché)
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error("Erreur lors de la comparaison du mot de passe:", error);
        return false; // Ou propagez l'erreur selon votre gestion
    }
};

module.exports = mongoose.model('User', userSchema);