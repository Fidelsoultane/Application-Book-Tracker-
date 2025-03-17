// routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Ajouter un livre
router.post('/books', async (req, res) => {
   try {
    console.log("Requête POST /api/books reçue.  Corps de la requête:", req.body);
    const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn } = req.body; // Déstructure tous les champs

    // Validation (exemple, à adapter/compléter):
    if (!title || !author) {
      return res.status(400).json({ message: 'Le titre et l\'auteur sont obligatoires.' });
    }

    const newBook = new Book({
      title,
      author,
      status,
      coverUrl,
      publisher, // Ajout
      publishedDate, // Ajout
      pageCount, // Ajout
      isbn
    });

    console.log("Objet newBook créé:", newBook);

    const savedBook = await newBook.save();
    console.log("Livre enregistré:", savedBook); 
    res.status(201).json(savedBook); // 201 Created pour une création réussie

  } catch (error) {
    console.error("Erreur dans la route POST /api/books:", error);
    res.status(500).json({ message: 'Erreur lors de la création du livre.' });
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
    const { id } = req.params; // Récupère l'ID depuis les paramètres de l'URL
    const { title, author, status, coverUrl, publisher, publishedDate, pageCount, isbn } = req.body; // Déstructure les données du corps de la requête

    // Validation (exemple, à adapter/compléter):
    if (!title || !author) {
      return res.status(400).json({ message: 'Le titre et l\'auteur sont obligatoires.' });
    }

    // Vérifie si le livre existe (important !)
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Livre non trouvé.' }); // 404 Not Found
    }

    // Met à jour le livre (approche 1 : findByIdAndUpdate)
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title,
        author,
        status,
        coverUrl,
        publisher, // Ajout
        publishedDate, // Ajout
        pageCount, // Ajout
        isbn
      },
      { new: true, runValidators: true } // Options importantes !
    );

    // // Approche 2 (plus verbeuse, mais utile si vous avez besoin de faire des opérations spécifiques avant la sauvegarde)
    // existingBook.title = title;
    // existingBook.author = author;
    // existingBook.status = status;
    // existingBook.coverUrl = coverUrl;
    // existingBook.publisher = publisher;
    // existingBook.publishedDate = publishedDate;
    // existingBook.pageCount = pageCount;
    // const updatedBook = await existingBook.save();


    res.status(200).json(updatedBook); // Renvoie le livre mis à jour

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification du livre.' });
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





