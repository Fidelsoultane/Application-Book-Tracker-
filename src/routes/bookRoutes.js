// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Ajouter un livre
router.post('/books', async (req, res) => {
  try {
      const { title, author, status, coverUrl } = req.body; // **Récupérer 'coverUrl' depuis req.body**

      const newBook = new Book({ title, author, status, coverUrl }); // **Inclure 'coverUrl' lors de la création**
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

// Récupérer tous les livres
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour un livre
router.put('/books/:id', async (req, res) => {
  try {
      const bookId = req.params.id;
      // **Récupérer également 'coverUrl' depuis req.body, en plus de title, author et status**
      const { title, author, status, coverUrl } = req.body;
      // **Mettre à jour le livre dans la base de données, en incluant 'coverUrl'**
      const updatedBook = await Book.findByIdAndUpdate(
          bookId,
          { title, author, status, coverUrl }, // Les données à mettre à jour, incluant 'coverUrl'
          { new: true, runValidators: true } // Options: retourne le document mis à jour, applique les validations du schéma
      );

      if (!updatedBook) {
          return res.status(404).json({ message: 'Livre non trouvé' });
      }

      res.json(updatedBook); // Renvoyer le livre mis à jour en JSON
  } catch (error) {
      res.status(400).json({ message: error.message }); // Gestion des erreurs (validation, etc.)
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

module.exports = router;



