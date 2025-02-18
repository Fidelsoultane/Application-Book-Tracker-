document.addEventListener("DOMContentLoaded", () => {
  const bookForm = document.getElementById("book-form");
  const bookList = document.getElementById("book-list");

  // Fonction pour récupérer et afficher les livres
  function fetchBooks() {
      fetch("/api/books")
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
                      <button class="bg-yellow-400 text-white px-2 py-1 rounded mt-2">Modifier</button>
                      <button class="bg-red-500 text-white px-2 py-1 rounded mt-2">Supprimer</button>
                  `;
                  bookList.appendChild(bookCard);
              });
          });
  }

  // Soumission du formulaire
  bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const status = document.getElementById("status").value;

      fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, author, status })
      }).then(() => {
          bookForm.reset();
          fetchBooks();
      });
  });

  fetchBooks();
});

  
