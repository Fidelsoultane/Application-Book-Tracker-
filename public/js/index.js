    document.addEventListener("DOMContentLoaded", () => {
      const bookForm = document.getElementById("book-form");
      const bookList = document.getElementById("book-list");

      // Fonction pour récupérer et afficher les livres
      function fetchBooks() {
        fetch("http://localhost:3000/api/books")
          .then(response => response.json())
          .then(books => {
            bookList.innerHTML = "";
            books.forEach(book => {
              const bookCard = document.createElement("div");
              bookCard.className = "bg-white p-4 shadow-md rounded-lg";
              
              let statusColor = "text-gray-500";
              if (book.status === "À lire") statusColor = "text-red-500";
              if (book.status === "En cours") statusColor = "text-yellow-500";
              if (book.status === "Terminé") statusColor = "text-green-500";
              
              bookCard.innerHTML = `
                <h2 class="text-xl font-semibold">${book.title}</h2>
                <p class="text-gray-600">${book.author}</p>
                <p class="text-sm font-bold ${statusColor}">${book.status}</p>
                <div class="mt-2">
                  <button class="edit-button bg-yellow-400 text-white px-2 py-1 rounded" data-id="${book._id}">Modifier</button>
                  <button class="delete-button bg-red-500 text-white px-2 py-1 rounded" data-id="${book._id}">Supprimer</button>
                </div>
              `;
              bookList.appendChild(bookCard);
            });

            // Ajout des écouteurs pour les boutons de suppression
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

            // Ajout des écouteurs pour les boutons de modification
            document.querySelectorAll('.edit-button').forEach(button => {
              button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                // Récupération des données actuelles du livre pour pré-remplir la modification
                fetch(`/api/books`)
                  .then(response => response.json())
                  .then(books => {
                    const book = books.find(b => b._id === id);
                    if (book) {
                      const newTitle = prompt("Modifier le titre :", book.title);
                      const newAuthor = prompt("Modifier l'auteur :", book.author);
                      const newStatus = prompt("Modifier le statut (À lire, En cours, Terminé) :", book.status);
                      if (newTitle && newAuthor && (newStatus === "À lire" || newStatus === "En cours" || newStatus === "Terminé")) {
                        fetch(`/api/books/${id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title: newTitle, author: newAuthor, status: newStatus })
                        })
                          .then(response => response.json())
                          .then(() => fetchBooks())
                          .catch(err => console.error(err));
                      } else {
                        alert("Données invalides !");
                      }
                    }
                  })
                  .catch(err => console.error(err));
              });
            });
          })
          .catch(err => console.error(err));
      }

      // Soumission du formulaire pour ajouter un livre
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

  
