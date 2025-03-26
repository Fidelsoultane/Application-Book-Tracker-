// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bookRoutes = require('./routes/bookRoutes');
const etagereRoutes = require('./routes/etagereRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// **Configuration de la base de données MongoDB**
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booktrackerDB';

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
});

// Middlewares
app.use(express.json());
app.use(cors());

// **Service de fichiers statiques (pour servir index.js, CSS, etc.)**
app.use(express.static(path.join(__dirname, '../public'))); // Sert les fichiers du dossier 'public'

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

// Routes pour les livres
app.use('/api', bookRoutes);
app.use('/api/etageres', etagereRoutes);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

