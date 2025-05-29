// routes/etagereRoutes.js
const express = require('express');
const router = express.Router();
const Etagere = require('../models/Etagere');
const Book = require('../models/Book'); // Assurez-vous que ce chemin est correct et que vous l'utilisez si vous mettez à jour les livres lors de la suppression d'une étagère.

// --- Créer une nouvelle étagère (POST /api/etageres) ---
router.post('/', async (req, res) => {
    const userId = req.user.userId; // Récupéré depuis le middleware protect
    let trimmedName = ""; // Déclaré ici pour être accessible dans le catch si error.code === 11000

    console.log("Requête POST /api/etageres reçue, body:", req.body);
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Le nom de l\'étagère est obligatoire et ne peut pas être vide.' });
        }
        trimmedName = name.trim(); // Assigner la valeur ici

        // La vérification d'existence pour cet utilisateur est gérée par l'index unique de MongoDB
        // ({name:1, userId:1} avec collation)
        const newEtagere = new Etagere({ name: trimmedName, userId: userId });
        console.log("Nouvelle étagère créée (avant save):", newEtagere);
        const savedEtagere = await newEtagere.save(); // Déclenche les validateurs et l'index
        res.status(201).json(savedEtagere);

    } catch (error) {
        console.error("Erreur lors de la création de l'étagère:", error);
        if (error.code === 11000) { // Violation de l'index unique (name+userId)
            return res.status(409).json({ message: `L'étagère nommée "${trimmedName}" existe déjà pour vous. Veuillez choisir un autre nom.` });
        }
        // Gérer aussi les erreurs de validation de Mongoose si 'name' est requis dans le schéma et manquant
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: "Erreur serveur lors de la création de l'étagère." });
    }
});

// --- Récupérer toutes les étagères de l'utilisateur (GET /api/etageres) ---
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const etageres = await Etagere.find({ userId: userId }).sort({ name: 1 }); // Tri par nom alphabétique
        console.log(`Étagères récupérées pour user ${userId}:`, etageres.length);
        res.status(200).json(etageres);
    } catch (error) {
        console.error("Erreur lors de la récupération des étagères:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des étagères." });
    }
});

// --- Récupérer une étagère spécifique par son ID (GET /api/etageres/:id) ---
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId; // Pour la vérification d'appartenance

        const etagere = await Etagere.findOne({ _id: id, userId: userId }); // Vérifie l'appartenance

        if (!etagere) {
            // Soit l'étagère n'existe pas, soit elle n'appartient pas à cet utilisateur.
            // Un message générique 404 est souvent préférable pour ne pas révéler l'existence d'une ressource.
            return res.status(404).json({ message: "Étagère non trouvée." });
        }
        res.status(200).json(etagere);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'étagère:", error);
        if (error.kind === 'ObjectId') { // Si l'ID n'est pas un ObjectId valide
            return res.status(400).json({ message: "ID d'étagère invalide." });
        }
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'étagère." });
    }
});

// --- Mettre à jour une étagère (PUT /api/etageres/:id) ---
// Si vous décidez d'implémenter la modification du nom d'une étagère.
router.put('/:id', async (req, res) => {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name } = req.body;
    let trimmedName = "";

    console.log(`Requête PUT /api/etageres/${id} reçue, body:`, req.body);
    try {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: "Le nouveau nom de l'étagère est obligatoire et ne peut pas être vide." });
        }
        trimmedName = name.trim();

        const etagereToUpdate = await Etagere.findById(id);
        if (!etagereToUpdate) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }
        if (etagereToUpdate.userId.toString() !== userId) {
            console.log(`Tentative de modification non autorisée par ${userId} sur étagère ${id}`);
            return res.status(403).json({ message: "Accès non autorisé." });
        }
        
        
        const oldEtagereName = etagereToUpdate.name; // Conserve l'ancien nom pour la mise à jour des livres

        etagereToUpdate.name = trimmedName; // Modifie le nom
        const updatedEtagere = await etagereToUpdate.save(); // .save() va déclencher l'index unique

        // Si le nom de l'étagère a réellement changé, mettre à jour les livres associés
        if (oldEtagereName !== updatedEtagere.name) {
            await Book.updateMany({ userId: userId, genre: oldEtagereName }, { $set: { genre: updatedEtagere.name } });
            console.log(`Livres mis à jour de l'étagère "${oldEtagereName}" vers "${updatedEtagere.name}" pour user ${userId}`);
        }

        res.status(200).json(updatedEtagere);

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étagère:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: `L'étagère nommée "${trimmedName}" existe déjà pour vous.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'étagère." });
    }
});

// --- Supprimer une étagère par son ID (DELETE /api/etageres/:id) ---
router.delete('/:id', async (req, res) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Utilisateur non authentifié ou ID utilisateur manquant." });
    }
    const userId = req.user.userId;
    try {
        const { id } = req.params;
        const etagereToDelete = await Etagere.findById(id);

        if (!etagereToDelete) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }
        if (etagereToDelete.userId.toString() !== userId) {
            console.log(`Tentative de suppression non autorisée par utilisateur ${userId} sur étagère ${id}`);
            return res.status(403).json({ message: "Accès non autorisé." });
        }

        const oldEtagereName = etagereToDelete.name;
        await Etagere.findByIdAndDelete(id);

        // Mettre à jour le champ 'genre' des livres qui utilisaient cette étagère en le vidant
        await Book.updateMany({ userId: userId, genre: oldEtagereName }, { $set: { genre: '' } }); // Ou à une valeur par défaut

        console.log(`Étagère ${id} (${oldEtagereName}) supprimée et livres associés mis à jour par user ${userId}`);
        res.status(200).json({ message: "Étagère supprimée avec succès et livres associés mis à jour." });
    } catch (error) {
        console.error("Erreur serveur lors de la suppression de l'étagère:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "ID d'étagère invalide." });
        }
        res.status(500).json({ message: "Erreur serveur lors de la suppression de l'étagère." });
    }
});

module.exports = router;