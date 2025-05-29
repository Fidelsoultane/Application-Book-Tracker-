// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Votre modèle User

// Fonction utilitaire pour générer un token (vous pouvez la mettre dans un fichier utils/ séparé)
const generateToken = (userId, username) => {
    const payload = {
        userId: userId,
        username: username
        // N'incluez que les informations non sensibles nécessaires
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("ERREUR CRITIQUE DANS generateToken: JWT_SECRET n'est pas défini !");
        // Gérer cette erreur de configuration de manière appropriée
        // Dans un vrai scénario, cela devrait empêcher le démarrage ou lever une alerte.
        return null; 
    }
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    };
    return jwt.sign(payload, secret, options);
};


// --- POST /api/auth/register --- (Inscription)
router.post('/register', async (req, res) => {
    console.log("Requête POST /api/auth/register reçue:", req.body);
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Nom d'utilisateur, email et mot de passe sont obligatoires." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username }] });
        if (existingUser) {
            console.log("Tentative d'inscription échouée: Email ou Username déjà utilisé.");
            return res.status(409).json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà." });
        }

        // Créer le nouvel utilisateur AVEC LE MOT DE PASSE EN CLAIR
        // Le hachage se fera automatiquement grâce au hook .pre('save') dans User.js
        const newUser = new User({
            username: username,
            email: email,    // Le schéma Mongoose s'occupe de .toLowerCase()
            password: password // Passez le mot de passe en clair ici
        });

        const savedUser = await newUser.save(); // Le hook .pre('save') est exécuté ici
        console.log("Utilisateur enregistré:", savedUser._id);

        res.status(201).json({
            message: "Utilisateur créé avec succès !",
            userId: savedUser._id,
            username: savedUser.username
            // Ne pas renvoyer le token ici, l'utilisateur doit se connecter
        });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        // Le code 11000 est géré par la vérification findOne, mais par sécurité :
        else if (error.code === 11000) { 
            // Ce message est plus précis si le findOne n'a pas attrapé le bon cas (username vs email)
            return res.status(409).json({ message: "Conflit : cet email ou nom d'utilisateur est déjà pris." });
        }
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
});

// --- POST /api/auth/login --- (Connexion)
router.post('/login', async (req, res) => {
    console.log("Requête POST /api/auth/login reçue:", req.body);
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont obligatoires." });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`Login échoué (login): Utilisateur non trouvé pour l'email: ${email}`);
            return res.status(401).json({ message: "Identifiants invalides." });
        }

        // Utiliser la méthode matchPassword du modèle User
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(`Login échoué (login): Mot de passe incorrect pour l'email: ${email}`);
            return res.status(401).json({ message: "Identifiants invalides." });
        }

        // Utilisateur trouvé et mot de passe correct -> Créer et envoyer le JWT
        console.log(`Login réussi pour l'utilisateur: ${user.username}`);
        const token = generateToken(user._id, user.username);

        if (!token) { // Si generateToken a un problème (ex: JWT_SECRET manquant)
             console.error("ERREUR CRITIQUE: Échec de la génération du token lors du login.");
             return res.status(500).json({ message: "Erreur de configuration serveur lors du login." });
        }

        res.status(200).json({
            message: "Connexion réussie !",
            token: token,
            userId: user._id,
            username: user.username
        });

    } catch (error) {
        console.error("Erreur serveur lors de la connexion:", error);
        res.status(500).json({ message: "Erreur serveur lors de la tentative de connexion." });
    }
});



module.exports = router;