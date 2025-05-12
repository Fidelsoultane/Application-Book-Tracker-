// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Assurez-vous que cette ligne d'import est présente en haut du fichier
const User = require('../models/User');

// --- POST /api/auth/register --- (Inscription)
router.post('/register', async (req, res) => {
    console.log("Requête POST /api/auth/register reçue:", req.body);

    try {
        const { username, email, password } = req.body;

        // Validation simple (on pourrait ajouter plus de contrôles)
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Nom d'utilisateur, email et mot de passe sont obligatoires." });
        }
        if (password.length < 6) {
             return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        // Vérifier si l'email ou le username existe déjà
        const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username }] });
        if (existingUser) {
            console.log("Tentative d'inscription échouée: Email ou Username déjà utilisé.");
            // Message générique pour ne pas révéler quelle information existe déjà
            return res.status(409).json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà." }); // 409 Conflict
        }

        // Hacher le mot de passe
        const saltRounds = 10; // Facteur de coût pour le hachage (standard)
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Mot de passe haché (ne pas logger en production !)"); // A ne pas faire en prod

        // Créer le nouvel utilisateur
        const newUser = new User({
            username: username,
            email: email, // Mongoose mettra en lowercase via le schéma
            password: hashedPassword // Stocke le mot de passe HACHÉ
        });

        // Sauvegarder l'utilisateur
        const savedUser = await newUser.save();
        console.log("Utilisateur enregistré:", savedUser._id);

        // Réponse succès - Ne PAS renvoyer le mot de passe haché
        // On pourrait renvoyer juste un message ou l'ID/username/email
        res.status(201).json({
             message: "Utilisateur créé avec succès !",
             userId: savedUser._id,
             username: savedUser.username
        });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
         if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') });
         }
         // Le code 11000 est géré par la vérification findOne, mais sécurité supplémentaire :
         else if (error.code === 11000) {
             return res.status(409).json({ message: "Un utilisateur avec cet email ou nom d'utilisateur existe déjà (conflit index)." });
         }
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
});

// --- POST /api/auth/login --- (NOUVELLE ROUTE)
router.post('/login', async (req, res) => {
    console.log("Requête POST /api/auth/login reçue:", req.body);

    try {
        const { email, password } = req.body;

        // 1. Validation simple des entrées
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont obligatoires." });
        }

        // 2. Chercher l'utilisateur par email (insensible à la casse)
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Important: Message générique pour ne pas indiquer si c'est l'email ou le mdp qui est faux
            console.log("Login échoué (login): Utilisateur non trouvé pour l'email:", email);
            return res.status(401).json({ message: "Identifiants invalides." }); // 401 Unauthorized
        }

        // 3. Comparer le mot de passe fourni avec le hash stocké
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Important: Message générique
            console.log("Login échoué (login): Mot de passe incorrect pour l'email:", email);
            return res.status(401).json({ message: "Identifiants invalides." }); // 401 Unauthorized
        }

        // 4. Utilisateur trouvé et mot de passe correct -> Créer le JWT
        console.log("Login réussi pour l'utilisateur:", user.username);
        const payload = {
            userId: user._id,
            username: user.username
            // N'incluez que les informations non sensibles nécessaires côté client
        };

        // Lire la clé secrète depuis l'environnement (.env)
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("ERREUR CRITIQUE: JWT_SECRET n'est pas défini dans l'environnement !");
            // Ne pas donner d'infos détaillées au client sur l'erreur serveur
            return res.status(500).json({ message: "Erreur de configuration serveur." });
        }

        // Options du Token (ex: expiration)
        const options = {
            expiresIn: '1d' // Ex: '1h', '7d', '365d'
        };

        // Signer le token
        const token = jwt.sign(payload, secret, options);

        // 5. Renvoyer la réponse succès avec le token
        res.status(200).json({
            message: "Connexion réussie !",
            token: token, // Le client devra stocker ce token
            userId: user._id, // Optionnel: renvoyer l'ID utilisateur
            username: user.username // Optionnel: renvoyer le nom d'utilisateur
        });

    } catch (error) {
        console.error("Erreur serveur lors de la connexion:", error);
        res.status(500).json({ message: "Erreur serveur lors de la tentative de connexion." });
    }
});

// --- TODO: Route POST /api/auth/logout --- (Déconnexion)

module.exports = router;