// routes/etagereRoutes.js
const express = require('express');
const router = express.Router();
const Etagere = require('../models/Etagere');

// --- Créer une nouvelle étagère (POST /api/etageres) ---
router.post('/', async (req, res) => {
    const userId = req.user.userId;

    console.log("Requête POST /api/etageres reçue, body:", req.body);
    try {
        const { name } = req.body;

        // Validation : Le nom est obligatoire et ne doit pas être vide.
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Le nom de l\'étagère est obligatoire et ne peut pas être vide.' });
        }

        const trimmedName = name.trim(); // Supprime les espaces blancs au début et à la fin
        if (trimmedName.length === 0) {
            return res.status(400).json({ message: "Le nom de l'étagère ne peut pas être vide." });
        }

        const newEtagere = new Etagere({ name: trimmedName, userId: userId });
        console.log("Nouvelle étagère créée (avant save):", newEtagere);
        const savedEtagere = await newEtagere.save();
        res.status(201).json(savedEtagere);

    } catch (error) {
        console.error("Erreur lors de la création de l'étagère:", error);
        if (error.code === 11000) { // Gestion du cas où le nom existe déjà
              const originalNameAttempt = req.body.name || "Nom inconnu"; // Pour éviter une autre erreur si name est undefined
        return res.status(409).json({ message: `L'étagère nommée "${originalNameAttempt.trim()}" existe déjà pour vous. Veuillez choisir un autre nom.` });
        }
        res.status(500).json({ message: "Erreur lors de la création de l'étagère." });
    }
});

// --- Récupérer toutes les étagères (GET /api/etageres) ---
router.get('/', async (req, res) => {
    
    try {
        const userId = req.user.userId;
        const etageres = await Etagere.find({ userId: userId }).sort({ name: 1 });
        console.log(`Étagères récupérées pour user ${userId}:`, etageres.length);
        res.status(200).json(etageres);
    } catch (error) {
        console.error("Erreur lors de la récupération des étagères:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des étagères." });
    }
});

// --- Récupérer une étagère spécifique par son ID (GET /api/etageres/:id) ---
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const etagere = await Etagere.findById(id);

        if (!etagere) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }

        res.status(200).json(etagere);

    } catch (error) {
        console.error("Erreur lors de la récupération de l'étagère:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'étagère." });
    }
});

// --- Mettre à jour une étagère (PUT /api/etageres/:id) ---
router.put('/:id', async (req, res) => {
   
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { name } = req.body;
        

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Le nom de l'étagère est obligatoire." });
        }
         const trimmedName = name.trim();

        // --- Vérification d'Appartenance --- (AJOUTÉ)
        const existingEtagere = await Etagere.findById(id);
        if (!existingEtagere) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }
        if (existingEtagere.userId.toString() !== userId) {
            console.log(`Tentative de modification non autorisée par ${userId} sur étagère ${id}`);
            return res.status(403).json({ message: "Accès non autorisé." });
        }

        const updatedEtagere = await Etagere.findByIdAndUpdate(
            id,
            { name: trimmedName },
            { new: true, runValidators: true }
        );

        if (!updatedEtagere) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }

        res.status(200).json(updatedEtagere);

    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'étagère:", error);
         if (error.code === 11000) { // Gestion du cas où le nom existe déjà
            return res.status(409).json({ message: 'Une étagère avec ce nom existe déjà.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
       }
        res.status(500).json({ message: "Erreur lors de la mise à jour de l'étagère." });
    }
});

// --- Supprimer une étagère par son ID (DELETE /api/etageres/:id) ---
router.delete('/:id', async (req, res) => {
    // Récupère l'ID de l'utilisateur depuis req.user (injecté par le middleware 'protect')
    if (!req.user || !req.user.userId) {
        console.error("DELETE /api/etageres/:id - Erreur: userId manquant dans req.user");
        return res.status(401).json({ message: "Utilisateur non authentifié ou ID utilisateur manquant." });
    }
    const userId = req.user.userId;

    try {
        const { id } = req.params; // ID de l'étagère à supprimer

        // 1. Trouver l'étagère pour vérifier son existence ET son propriétaire
        const etagereToDelete = await Etagere.findById(id);

        if (!etagereToDelete) {
            return res.status(404).json({ message: "Étagère non trouvée." });
        }

        // 2. VÉRIFICATION D'APPARTENANCE ESSENTIELLE
        if (etagereToDelete.userId.toString() !== userId) {
            console.log(`Tentative de suppression non autorisée par utilisateur ${userId} sur étagère ${id} appartenant à ${etagereToDelete.userId}`);
            return res.status(403).json({ message: "Accès non autorisé." }); // 403 Forbidden
        }

        // 3. Si l'utilisateur est propriétaire, on supprime
        await Etagere.findByIdAndDelete(id);
        console.log(`Étagère ${id} supprimée par user ${userId}`);

        // Optionnel : Mettre à jour les livres qui utilisaient cette étagère
        // await Book.updateMany({ userId: userId, genre: etagereToDelete.name }, { $set: { genre: '' } });

        res.status(200).json({ message: "Étagère supprimée avec succès." }); // Ou statut 204

    } catch (error) {
        console.error("Erreur serveur lors de la suppression de l'étagère:", error);
        res.status(500).json({ message: "Erreur serveur lors de la suppression de l'étagère." });
    }
});



module.exports = router;