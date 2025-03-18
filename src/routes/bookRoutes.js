// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Ajouter un livre
router.post('/books', async (req, res) => {
  try {
      console.log("Requête POST /api/books reçue. Corps de la requête:", req.body);
      const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn, genre } = req.body; // Inclure 'genre'

      // Validation (plus complète)
      if (!title) {
          return res.status(400).json({ message: 'Le titre est obligatoire.' });
      }
      if (!author) {
          return res.status(400).json({ message: 'L\'auteur est obligatoire.' });
      }
      // Ajoutez d'autres validations ici...

      const newBook = new Book({
          title,
          author,
          status,
          coverUrl,
          publisher,
          publishedDate,
          pageCount,
          isbn,
          genre, // Ajout
      });
       console.log("Objet newBook créé:", newBook);

      const savedBook = await newBook.save();
       console.log("Livre enregistré:", savedBook);

      res.status(201).json(savedBook);
  } catch (error) {
      console.error("Erreur dans la route POST /api/books:", error);
      if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ message: messages });
      } else if (error.code === 11000) {
          return res.status(409).json({ message: 'Un livre avec cet ISBN existe déjà.' });
      } else {
          res.status(500).json({ message: 'Erreur lors de la création du livre.' });
      }
  }
});

router.get('/books', async (req, res) => {
  try {
    const books = await Book.find(); // Récupère *tous* les livres.  Assurez-vous que 'Book' est correctement importé.
    res.status(200).json(books); // Renvoie les livres au format JSON.  200 OK
  } catch (error) {
    console.error("Erreur lors de la récupération des livres (GET /api/books):", error);
    res.status(500).json({ message: 'Erreur lors de la récupération des livres.' }); // 500 Internal Server Error
  }
});

// Mettre à jour un livre
router.put('/books/:id', async (req, res) => {
   try {
    console.log("Requête PUT /api/books/:id reçue.  ID:", req.params.id, "Corps:", req.body); // AJOUT
    const { id } = req.params;
    const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn, genre } = req.body; // Inclure 'genre'
  
    if (!title || !author) {
     return res.status(400).json({ message: 'Le titre et l\'auteur sont obligatoires.' });
    }
  
    const existingBook = await Book.findById(id);
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
      genre, // Ajout
     },
     { new: true, runValidators: true }
    );
    console.log("Livre mis à jour:", updatedBook); // AJOUT
  
    res.status(200).json(updatedBook);
  
   } catch (error) {
    console.error("Erreur dans la route PUT /api/books/:id:", error); // AJOUT
  
    // Gestion plus précise des erreurs (comme pour POST)
    if (error.name === 'ValidationError') {
     const messages = Object.values(error.errors).map(val => val.message);
     return res.status(400).json({ message: messages });
    } else if (error.code === 11000) {
     return res.status(409).json({ message: 'Un livre avec cet ISBN existe déjà.' });
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





