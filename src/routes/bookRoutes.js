// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

router.post('/', async (req, res) => {
    
    try {
        const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn, genre, startDate, endDate, tags, notes, rating, currentPage } = req.body;
        const userId = req.user.userId;

        // Validation Minimale (Obligatoire)
        if (!title) return res.status(400).json({ message: 'Le titre est obligatoire.' });
        if (!author) return res.status(400).json({ message: 'L\'auteur est obligatoire.' });

        // Validation Dates (Optionnelle mais utile)
        if (startDate && isNaN(Date.parse(startDate))) return res.status(400).json({ message: 'Date de début invalide.' });
        if (endDate && isNaN(Date.parse(endDate))) return res.status(400).json({ message: 'Date de fin invalide.' });
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin.' });

        // Validation croisée currentPage <= pageCount (si les deux sont fournis et valides numériquement)
        // Mongoose gérera si ce ne sont pas des nombres ou s'ils sont < 0 via le schéma
        const numPageCount = (typeof pageCount === 'number' && pageCount >= 0) ? pageCount : null;
        const numCurrentPage = (typeof currentPage === 'number' && currentPage >= 0) ? currentPage : null; // Utilise la valeur ou null

        if (numPageCount !== null && numCurrentPage !== null && numCurrentPage > numPageCount) {
            // CORRECTION SYNTAXE MESSAGE: Utilisation de ${...}
            return res.status(400).json({ message: `La page actuelle (${numCurrentPage}) ne peut pas dépasser le nombre total de pages (${numPageCount}).` });
        }

        // Création avec toutes les données - Mongoose validera les types et 'min'
        const newBook = new Book({
            userId: userId,
            title, author, status, coverUrl, publisher, publishedDate,
            pageCount, // Laisser Mongoose valider (type: Number, min: 0)
            isbn, genre, startDate, endDate, tags, notes, rating,
            currentPage // Laisser Mongoose valider (type: Number, min: 0, default: 0)
        });

        console.log("Objet newBook (avec userId):", newBook);
        const savedBook = await newBook.save(); // Déclenche les validateurs du schéma
        console.log("Livre enregistré:", savedBook);
        res.status(201).json(savedBook);

    } catch (error) {
        console.error("Erreur dans la route POST /api/books:", error);
        if (error.name === 'ValidationError') { // Important de bien gérer cette erreur ici
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ message: messages.join('. ') }); // Renvoie les erreurs de validation Mongoose
        } else if (error.code === 11000) {
            return res.status(409).json({ message: 'Un livre avec cet ISBN existe déjà.' });
        } else {
            res.status(500).json({ message: 'Erreur serveur lors de la création du livre.' });
        }
    }
});

router.get('/', async (req, res) => {

    try {
        console.log("Requête GET /api/books reçue. Query params:", req.query);
        const userId = req.user.userId;

        // --- Pagination Parameters ---
        const page = parseInt(req.query.page) || 1; // Page actuelle, défaut = 1
        const limit = parseInt(req.query.limit) || 12; // Livres par page, défaut = 12
        const skip = (page - 1) * limit; // Nombre de documents à sauter

        // --- Filtres ---
        const query = {
            userId: userId,
        };
        if (req.query.status && req.query.status !== 'Tous') { query.status = req.query.status; }
        if (req.query.genre && req.query.genre !== 'Tous') { query.genre = req.query.genre; }
        if (req.query.tags) { query.tags = { $in: [req.query.tags] }; }
        if (req.query.publisher && req.query.publisher.trim() !== '') { query.publisher = { $regex: new RegExp(req.query.publisher.trim(), 'i') }; }

        // --- Tri ---
        const sortOptions = {};
        if (req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':');
            const sortOrder = order === 'desc' ? -1 : 1;
            const allowedSortFields = ['title', 'createdAt', 'author', 'publishedDate'];
            if (allowedSortFields.includes(field)) { sortOptions[field] = sortOrder; }
        } else {
             sortOptions.createdAt = -1; // Tri par défaut
        }

        console.log("Filtre Mongoose (query):", query);
        console.log("Options de tri Mongoose:", sortOptions);

        // --- Exécuter les requêtes ---
        // 1. Compter le nombre total de documents correspondant aux filtres
        const totalBooks = await Book.countDocuments(query);

        // 2. Récupérer les livres pour la page actuelle, avec filtres, tri et pagination
        const books = await Book.find(query)
        .sort(sortOptions)
        .skip(skip)   // Saute les documents des pages précédentes
        .limit(limit); // Limite au nombre de livres par page
         console.log(`Livres récupérés pour user ${userId}: ${books.length} sur un total de ${totalBooks}`);

        // --- Renvoyer la réponse ---
        res.status(200).json({
            books: books, // Le tableau des livres pour la page actuelle
            totalBooks: totalBooks, // Le nombre total de livres correspondant aux filtres
            currentPage: page,
            totalPages: Math.ceil(totalBooks / limit) // Calcule le nombre total de pages
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des livres (GET /api/books):", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des livres.' });
    }
});

// Mettre à jour un livre
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Données reçues pour la mise à jour
        const receivedUpdateData = req.body;

        // --- Validation des données reçues (si elles sont présentes) ---
        if (receivedUpdateData.hasOwnProperty('title') && !receivedUpdateData.title) {
            return res.status(400).json({ message: 'Le titre ne peut pas être vide s\'il est fourni pour modification.' });
        }
        if (receivedUpdateData.hasOwnProperty('author') && (!receivedUpdateData.author || (Array.isArray(receivedUpdateData.author) && receivedUpdateData.author.length === 0))) {
            return res.status(400).json({ message: 'L\'auteur ne peut pas être vide s\'il est fourni pour modification.' });
        }
        // Dates
        if (receivedUpdateData.startDate && isNaN(Date.parse(receivedUpdateData.startDate))) return res.status(400).json({ message: 'Date de début invalide.' });
        if (receivedUpdateData.endDate && isNaN(Date.parse(receivedUpdateData.endDate))) return res.status(400).json({ message: 'Date de fin invalide.' });
        if (receivedUpdateData.startDate && receivedUpdateData.endDate && new Date(receivedUpdateData.startDate) > new Date(receivedUpdateData.endDate)) {
            return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin.' });
        }
        // Rating
        if (receivedUpdateData.rating !== undefined && receivedUpdateData.rating !== null &&
            (typeof receivedUpdateData.rating !== 'number' || receivedUpdateData.rating < 0 || receivedUpdateData.rating > 5)) {
            return res.status(400).json({ message: 'La note doit être un nombre entre 0 et 5.' });
        }
        // Page Actuelle & Nombre de Pages
        const numCurrentPage = (typeof receivedUpdateData.currentPage === 'number' && receivedUpdateData.currentPage >= 0) ? receivedUpdateData.currentPage : null;
        const numPageCountFromRequest = (typeof receivedUpdateData.pageCount === 'number' && receivedUpdateData.pageCount >= 0) ? receivedUpdateData.pageCount : null;

        // --- Vérification d'Appartenance ---
        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).json({ message: "Livre non trouvé." });
        }
        if (existingBook.userId.toString() !== userId) {
            console.log(`Tentative de modification non autorisée par ${userId} sur le livre ${id} appartenant à ${existingBook.userId}`);
            return res.status(403).json({ message: "Accès non autorisé." });
        }

        // Validation croisée pour currentPage et pageCount
        let pageCountForValidation = numPageCountFromRequest !== null ? numPageCountFromRequest : existingBook.pageCount; // Utilise le pageCount de la BDD si non fourni dans la requête
        if (pageCountForValidation !== null && typeof pageCountForValidation === 'number' && pageCountForValidation >= 0 &&
            numCurrentPage !== null && numCurrentPage > pageCountForValidation) {
            return res.status(400).json({ message: `La page actuelle (${numCurrentPage}) ne peut pas dépasser le nombre total de pages (${pageCountForValidation}).` });
        }

        // Effectue la mise à jour avec les données reçues dans req.body
        // findByIdAndUpdate ne met à jour que les champs présents dans le second argument.
        const updatedBook = await Book.findByIdAndUpdate(id, receivedUpdateData, { new: true, runValidators: true });

        if (!updatedBook) { // Devrait être redondant si existingBook est trouvé et pas d'erreur de validation
            return res.status(404).json({ message: "Livre non trouvé ou échec de la mise à jour." });
        }
        console.log("Livre mis à jour :", updatedBook);
        res.status(200).json(updatedBook);

    } catch (error) {
        console.error("Erreur dans la route PUT /api/books/:id:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        } else if (error.code === 11000) {
           return res.status(409).json({ message: 'Donnée conflictuelle (ISBN ou autre contrainte unique).' });
        } else {
           res.status(500).json({ message: 'Erreur serveur lors de la modification du livre.' });
        }
    }
});

// Supprimer un livre
router.delete('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        // Récupère l'ID de l'utilisateur depuis req.user (injecté par le middleware 'protect')
        if (!req.user || !req.user.userId) {
            console.error("DELETE /api/books/:id - Erreur: userId manquant dans req.user");
            return res.status(401).json({ message: "Utilisateur non authentifié ou ID utilisateur manquant." });
        }
        const userId = req.user.userId;

        // Trouver le livre pour vérifier l'appartenance
        const bookToDelete = await Book.findById(bookId);

        if (!bookToDelete) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        // Vérification d'appartenance
        if (bookToDelete.userId.toString() !== userId) {
            console.log(`Tentative de suppression non autorisée par ${userId} sur le livre ${bookId} appartenant à ${bookToDelete.userId}`);
            return res.status(403).json({ message: "Accès non autorisé." }); // 403 Forbidden
        }

        // Si l'utilisateur est propriétaire, on supprime
        await Book.findByIdAndDelete(bookId);
        console.log(`Livre ${bookId} supprimé par user ${userId}`);
        res.status(200).json({ message: 'Livre supprimé avec succès' }); // Ou statut 204 sans contenu

    } catch (error) {
        console.error("Erreur serveur lors de la suppression du livre:", error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du livre' });
    }
});
 
     

module.exports = router;





