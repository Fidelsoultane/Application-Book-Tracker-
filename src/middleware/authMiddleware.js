// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Optionnel: si on veut récupérer l'objet User complet

const protect = async (req, res, next) => {
    let token;

    // Vérifie si l'en-tête Authorization existe et commence par 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extraire le token (enlève 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // 2. Vérifier le token avec la clé secrète
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Attacher les infos utilisateur à la requête
            
            req.user = { userId: decoded.userId, username: decoded.username }; // Suffisant pour l'instant
            console.log("Token vérifié, utilisateur attaché:", req.user.userId);

            next(); // Passe à la prochaine étape (la route protégée)

        } catch (error) {
            console.error('Erreur de vérification du token:', error.message);
             // Gérer les erreurs spécifiques de JWT
             if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Non autorisé, token invalide.' });
             }
             if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Non autorisé, token expiré.' });
             }
             // Autres erreurs potentielles
             return res.status(401).json({ message: 'Non autorisé.' });
        }
    }

    // S'il n'y a pas de token du tout
    if (!token) {
        res.status(401).json({ message: 'Non autorisé, aucun token fourni.' });
    }
};

module.exports = { protect };