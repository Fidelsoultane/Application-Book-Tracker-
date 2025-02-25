document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const bookList = document.getElementById("book-list");
  const loadingMessage = document.getElementById("loading-message"); // Récupérer l'élément pour le message de chargement

  // Fonction pour récupérer et afficher les livres
  function fetchBooks() {
      bookList.innerHTML = ""; // Vider la liste existante
      loadingMessage.classList.remove('hidden'); // Afficher "Chargement..."

      fetch("http://localhost:3000/api/books")
          .then(response => response.json())
          .then(books => {
              loadingMessage.classList.add('hidden'); // Cacher "Chargement..." une fois les livres reçus
              bookList.innerHTML = "";
              books.forEach(book => {
                  const bookCard = document.createElement("div");
                  bookCard.className = "bg-white p-4 shadow-md rounded-lg book-card"; // Ajout class 'book-card' pour cibler plus facilement et formulaire inline
                  bookCard.dataset.bookId = book._id; // Stocker l'ID du livre dans dataset

                  let statusColor = "text-gray-500";
                  if (book.status === "À lire") statusColor = "text-red-500";
                  if (book.status === "En cours") statusColor = "text-yellow-500";
                  if (book.status === "Terminé") statusColor = "text-green-500";

                  bookCard.innerHTML = `
                      <h2 class="text-xl font-semibold book-title">${book.title}</h2>
                      <p class="text-gray-600 book-author">${book.author}</p>
                      <p class="text-sm font-bold ${statusColor} book-status">${book.status}</p>
                      <div class="mt-2 actions">
                          <button class="edit-button bg-yellow-400 text-white px-2 py-1 rounded" data-id="${book._id}">Modifier</button>
                          <button class="delete-button bg-red-500 text-white px-2 py-1 rounded" data-id="${book._id}">Supprimer</button>
                      </div>
                      <div class="edit-form hidden mt-4">  <input type="text" class="edit-title shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Titre" value="${book.title}">
                          <input type="text" class="edit-author shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Auteur" value="${book.author}">
                          <select class="edit-status shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2">
                              <option value="À lire" ${book.status === 'À lire' ? 'selected' : ''}>À lire</option>
                              <option value="En cours" ${book.status === 'En cours' ? 'selected' : ''}>En cours</option>
                              <option value="Terminé" ${book.status === 'Terminé' ? 'selected' : ''}>Terminé</option>
                          </select>
                          <div class="flex justify-end">
                              <button class="save-edit-button bg-green-500 text-white px-3 py-1 rounded mr-2" data-id="${book._id}">Sauvegarder</button>
                              <button class="cancel-edit-button bg-gray-400 text-white px-3 py-1 rounded">Annuler</button>
                          </div>
                      </div>
                  `;
                  bookList.appendChild(bookCard);
              });

              addDeleteEventListeners(); // Ajouter les écouteurs pour la suppression (fonction séparée)
              addEditEventListeners();   // Ajouter les écouteurs pour la modification (fonction séparée)
          })
          .catch(err => {
              loadingMessage.classList.add('hidden'); // Cacher "Chargement..." même en cas d'erreur
              console.error(err);
              alert("Erreur lors du chargement des livres."); // Message d'erreur plus convivial
          });
  }

  function addEditEventListeners() {
      document.querySelectorAll('.edit-button').forEach(button => {
          button.addEventListener('click', (e) => {
              const bookId = e.target.getAttribute('data-id');
              const bookCard = e.target.closest('.book-card'); // Remonter à la carte du livre parente
              const actionsDiv = bookCard.querySelector('.actions');
              const editFormDiv = bookCard.querySelector('.edit-form');

              actionsDiv.classList.add('hidden'); // Cacher les boutons Modifier/Supprimer
              editFormDiv.classList.remove('hidden'); // Afficher le formulaire d'édition
          });
      });

      // Écouteurs pour les boutons "Sauvegarder" dans le formulaire inline
      document.querySelectorAll('.save-edit-button').forEach(button => {
          button.addEventListener('click', (e) => {
              const bookId = e.target.getAttribute('data-id');
              const bookCard = e.target.closest('.book-card');
              const newTitle = bookCard.querySelector('.edit-title').value.trim();
              const newAuthor = bookCard.querySelector('.edit-author').value.trim();
              const newStatus = bookCard.querySelector('.edit-status').value;

              if (newTitle && newAuthor && ["À lire", "En cours", "Terminé"].includes(newStatus)) {
                  fetch(`/api/books/${bookId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ title: newTitle, author: newAuthor, status: newStatus })
                  })
                      .then(response => response.json())
                      .then(() => fetchBooks()) // Refetch pour mettre à jour la liste
                      .catch(err => console.error(err));
              } else {
                  alert("Données invalides !");
              }
          });
      });

      // Écouteurs pour les boutons "Annuler" dans le formulaire inline
      document.querySelectorAll('.cancel-edit-button').forEach(button => {
          button.addEventListener('click', (e) => {
              const bookCard = e.target.closest('.book-card');
              const actionsDiv = bookCard.querySelector('.actions');
              const editFormDiv = bookCard.querySelector('.edit-form');

              editFormDiv.classList.add('hidden'); // Cacher le formulaire
              actionsDiv.classList.remove('hidden'); // Afficher les boutons Modifier/Supprimer
          });
      });
  }


  function addDeleteEventListeners() { // Fonction séparée pour les écouteurs de suppression
      document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', (e) => {
              const id = e.target.getAttribute('data-id');
              if (confirm("Voulez-vous vraiment supprimer ce livre ?")) {
                  fetch(`/api/books/${id}`, { method: "DELETE" })
                      .then(response => response.json())
                      .then(() => fetchBooks())
                      .catch(err => console.error(err));
              }
          });
      });
  }


  // Soumission du formulaire pour ajouter un livre (inchangé)
  bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value.trim();
      const author = document.getElementById("author").value.trim();
      const status = document.getElementById("status").value;

      if (!title || !author) {
          alert("Veuillez remplir tous les champs.");
          return;
      }

      fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, author, status })
      })
          .then(response => response.json())
          .then(() => {
              bookForm.reset();
              fetchBooks();
          })
          .catch(err => console.error(err));
  });

  // Récupérer et afficher les livres au chargement de la page
  fetchBooks();
});