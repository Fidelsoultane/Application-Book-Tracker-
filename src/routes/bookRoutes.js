// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Ajouter un livre
router.post('/books', async (req, res) => {
  try {
      const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn, genre, startDate, endDate, tags } = req.body;

      // Validation (plus complète, incluant les dates)
      if (!title) {
          return res.status(400).json({ message: 'Le titre est obligatoire.' });
      }
      if (!author) {
          return res.status(400).json({ message: 'L\'auteur est obligatoire.' });
      }

      // Validation des dates (si elles sont fournies)
      if (startDate && isNaN(Date.parse(startDate))) {
          return res.status(400).json({ message: 'La date de début doit être une date valide.' });
      }
      if (endDate && isNaN(Date.parse(endDate))) {
          return res.status(400).json({ message: 'La date de fin doit être une date valide.' });
      }
      // Validation supplémentaire: startDate doit être antérieure à endDate
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin.' });
      }


      const newBook = new Book({
          title,
          author,
          status,
          coverUrl,
          publisher,
          publishedDate,
          pageCount,
          isbn,
          genre,
          startDate, // Ajout des dates
          endDate,   // Ajout des dates
          tags,
      });

      const savedBook = await newBook.save();
      res.status(201).json(savedBook);

  } catch (error) {
      console.error("Erreur dans la route POST /api/books:", error);
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ message: messages });
      } else if (error.code === 11000) { // Gestion des doublons (si vous avez un index unique sur l'ISBN)
          return res.status(409).json({ message: 'Un livre avec cet ISBN existe déjà.' });
      } else {
          res.status(500).json({ message: 'Erreur lors de la création du livre.' });
      }
  }
});
router.get('/books', async (req, res) => {
  try {
      console.log("Requête GET /api/books reçue. Query params:", req.query);

      const query = {}; // Pour les filtres Mongoose

      // --- Filtrage par statut ---
      if (req.query.status && req.query.status !== 'Tous') {
          query.status = req.query.status;
      }

      // --- Filtrage par genre ---
      if (req.query.genre && req.query.genre !== 'Tous') {
          query.genre = req.query.genre;
      }

      // --- Filtrage par tag ---
      if (req.query.tags) {
          query.tags = { $in: [req.query.tags] };
      }

      // --- Filtrage par éditeur --- (NOUVEAU)
      if (req.query.publisher && req.query.publisher.trim() !== '') {
          // Utilise une expression régulière pour une recherche insensible à la casse
          query.publisher = { $regex: new RegExp(req.query.publisher.trim(), 'i') };
      }

      // --- Tri ---
      const sortOptions = {};
      if (req.query.sortBy) {
          const [field, order] = req.query.sortBy.split(':');
          const sortOrder = order === 'desc' ? -1 : 1;

          // Champs de tri autorisés
          const allowedSortFields = ['title', 'createdAt', 'author', 'publishedDate']; // AJOUTER 'author', 'publishedDate'

          if (allowedSortFields.includes(field) && (order === 'asc' || order === 'desc')) {
               sortOptions[field] = sortOrder;
          } else {
               console.warn("Paramètre de tri ignoré (invalide):", req.query.sortBy);
          }
      } else {
           // Tri par défaut si aucun sortBy n'est spécifié (par exemple, par date d'ajout récente)
           sortOptions.createdAt = -1; // Optionnel: définissez un tri par défaut
      }


      console.log("Filtre Mongoose (query):", query);
      console.log("Options de tri Mongoose:", sortOptions);

      const books = await Book.find(query).sort(sortOptions);

      console.log("Livres récupérés (filtrés/triés):", books.length);
      res.status(200).json(books);

  } catch (error) {
      console.error("Erreur lors de la récupération des livres (GET /api/books):", error);
      res.status(500).json({ message: 'Erreur lors de la récupération des livres.' });
  }
});

// Mettre à jour un livre
router.put('/books/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn, genre, startDate, endDate, tags } = req.body;

      // Validation (similaire à POST)
      if (!title || !author) {
          return res.status(400).json({ message: 'Le titre et l\'auteur sont obligatoires.' });
      }
      if (startDate && isNaN(Date.parse(startDate))) {
          return res.status(400).json({ message: 'La date de début doit être une date valide.' });
      }
      if (endDate && isNaN(Date.parse(endDate))) {
          return res.status(400).json({ message: 'La date de fin doit être une date valide.' });
      }
     if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
          return res.status(400).json({message: 'La date de début doit être antérieure à la date de fin'});
      }

      const existingBook = await Book.findById(id); // Vérifie si le livre existe
      if (!existingBook) {
          return res.status(404).json({ message: 'Livre non trouvé.' });
      }

      const updatedBook = await Book.findByIdAndUpdate(
          id,
          {
              title,
              author,
              status,
              coverUrl,
              publisher,
              publishedDate,
              pageCount,
              isbn,
              genre,
              startDate, // Ajout des dates
              endDate,   // Ajout des dates
              tags,
          },
          { new: true, runValidators: true } // Important: runValidators pour la validation Mongoose
      );

      res.status(200).json(updatedBook);

  } catch (error) {
      console.error("Erreur dans la route PUT /api/books/:id:", error);
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ message: messages });
      } else if (error.code === 11000) {
         return res.status(409).json({ message: 'Donnée conflictuelle (ISBN ou autre contrainte unique).' });
   } else {
          res.status(500).json({ message: 'Erreur lors de la modification du livre.' });
      }
  }
});

// Supprimer un livre
router.delete('/books/:id', async (req, res) => { // **ROUTE DELETE /books/:id**
  try {
      const bookId = req.params.id;
      const deletedBook = await Book.findByIdAndDelete(bookId);

      if (!deletedBook) {
          return res.status(404).json({ message: 'Livre non trouvé' });
      }

      res.json({ message: 'Livre supprimé avec succès' });
  } catch (error) {
      res.status(500).json({ message: 'Erreur serveur lors de la suppression du livre' });
  }
});

module.exports = router;





