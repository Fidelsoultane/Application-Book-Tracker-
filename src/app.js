require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Assurez-vous qu'il est requis une seule fois en haut
const bookRoutes = require('./routes/bookRoutes');
const etagereRoutes = require('./routes/etagereRoutes');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');

const app = express(); // Crée l'instance Express
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes Publiques
app.use('/api/auth', authRoutes);

// Routes Protégées
app.use('/api/books', protect, bookRoutes);
app.use('/api/etageres', protect, etagereRoutes);

// Servir le Frontend
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
});

// Fonction pour démarrer le serveur et connecter la DB
const startApp = async () => {
    try {
        const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booktrackerDB';
        console.log("DB_URI pour app principale:", DB_URI); // Pour voir quelle DB est utilisée

        // Enlever les options dépréciées
        await mongoose.connect(DB_URI);
        console.log('Connecté à MongoDB (depuis app.js)');

        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT} (depuis app.js)`);
        });
    } catch (err) {
        console.error('Erreur de connexion à MongoDB ou de démarrage serveur (app.js):', err);
        process.exit(1);
    }
};

// Condition pour démarrer le serveur uniquement si le fichier est exécuté directement
// et non quand il est importé (require)
if (require.main === module) {
    startApp();
}

module.exports = app; // Important : Exporter 'app' pour supertest
