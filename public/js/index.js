// index.js
import { etageresExemples, creerCarteEtagereHTML } from './bookshelf.js';
// --------- Fonctions utilitaires ---------

// Crée un élément HTML avec les classes Tailwind fournies
function createElementWithClasses(tag, classNames) {
    const element = document.createElement(tag);
    element.className = classNames;
    return element;
}

// Crée une carte de livre HTML
function createBookCard(book) {
    const card = createElementWithClasses('div', 'bg-white rounded-lg shadow-md p-4 relative');
    card.dataset.bookId = book._id;

    const imgContainer = createElementWithClasses('div', 'flex justify-center');

    const img = createElementWithClasses('img', 'book-cover h-48 w-48 object-cover rounded-md');
    img.src = book.coverUrl || 'images/default-book-cover.png'; // Conserve l'image par défaut

   

    img.alt = `Couverture de ${book.title}`;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const title = createElementWithClasses('h3', 'text-lg font-semibold mt-2 text-gray-800');
    title.textContent = book.title;
    card.appendChild(title);

    const author = createElementWithClasses('p', 'text-gray-600');
    // Gère le cas où book.author est un tableau ou une chaîne
    author.textContent = Array.isArray(book.author) ? book.author.join(', ') : (book.author || 'Auteur inconnu');
    card.appendChild(author);

    const status = createElementWithClasses('p', 'text-sm text-gray-500 mt-1');
    status.textContent = `Statut: ${book.status}`;
    card.appendChild(status);

    // --- Ajouts pour les autres informations (si présentes) ---

    if (book.publisher) { // Vérifie si l'information existe
        const publisher = createElementWithClasses('p', 'text-sm text-gray-500');
        publisher.textContent = `Éditeur: ${book.publisher}`;
        card.appendChild(publisher);
    }

    if (book.publishedDate) {
        const publishedDate = createElementWithClasses('p', 'text-sm text-gray-500');
        publishedDate.textContent = `Date de publication: ${book.publishedDate}`;
        card.appendChild(publishedDate);
    }

    if (book.pageCount) {
      const pageCount = createElementWithClasses('p', 'text-sm text-gray-500');
      pageCount.textContent = `Nombre de pages: ${book.pageCount}`;
      card.appendChild(pageCount);
    }
    if(book.isbn){
        const isbn = createElementWithClasses('p', 'text-sm text-gray-500');
        isbn.textContent = `ISBN: ${book.isbn}`;
        card.appendChild(isbn);
    }


    // --- Fin des ajouts ---

    const actionsContainer = createElementWithClasses('div', 'absolute top-2 right-2 flex space-x-2');

    const editButton = createElementWithClasses('button', 'edit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs');
    editButton.innerHTML = '&#9998;';
    editButton.addEventListener('click', () => editBook(book));
    actionsContainer.appendChild(editButton);

    const deleteButton = createElementWithClasses('button', 'delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs');
    deleteButton.innerHTML = '&#10006;';
    deleteButton.addEventListener('click', () => deleteBook(book._id));
    actionsContainer.appendChild(deleteButton);

    card.appendChild(actionsContainer);

    return card;
}

// ... (autres fonctions) ...
let currentFilter = "Tous"; // initialisation de la variable

// Affiche les livres filtrés
function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = ''; // Efface les livres précédents

    const filteredBooks = currentFilter === "Tous" ? books : books.filter(book => book.status === currentFilter);

    if (filteredBooks.length === 0) {
        bookList.innerHTML = '<p class="text-center text-gray-500">Aucun livre ne correspond à ce filtre.</p>';
        return;
    }

    filteredBooks.forEach(book => {
        const card = createBookCard(book); // createBookCard gère maintenant toutes les infos
        bookList.appendChild(card);
    });
}

// Récupère les livres depuis le serveur
async function fetchBooks() {
    try {
        showLoading(); // Affiche l'indicateur de chargement
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error);
        displayError("Impossible de récupérer les livres. Veuillez réessayer."); // Affiche un message d'erreur à l'utilisateur
    } finally {
        hideLoading(); // Masque l'indicateur de chargement
    }
}


// Supprime un livre
async function deleteBook(bookId) {
     if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {  // Ajout d'une confirmation
        return;
    }

    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

       //  const result = await response.json(); // Pas besoin si le serveur renvoie juste un message
       //  console.log(result.message);  // Affiche le message de succès, si nécessaire
        fetchBooks(); // Recharge les livres après la suppression
    } catch (error) {
        console.error("Erreur lors de la suppression du livre:", error);
        displayError("Impossible de supprimer le livre. Veuillez réessayer."); // Affiche un message d'erreur à l'utilisateur
    }
}



// Affiche le formulaire d'édition avec les données du livre
function editBook(book) {
    document.getElementById('book-id').value = book._id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-status').value = book.status;
    document.getElementById('book-coverUrl').value = book.coverUrl;
    document.getElementById('form-title').textContent = "Modifier le livre";
    document.getElementById('book-form').classList.remove('hidden'); // Affiche le formulaire
    document.getElementById("add-book-button").classList.add("hidden");
}

//Réinitialise le formulaire
function resetForm() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = ''; // Important: Réinitialise l'ID
    document.getElementById('form-title').textContent = "Ajouter un nouveau livre";
     document.getElementById("add-book-button").classList.remove("hidden");
}


// --------- Gestion du formulaire ---------

// --- NOUVELLE FONCTION : Récupère les données du livre à partir de l'ISBN ---
async function fetchBookDataFromISBN(isbn) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    console.log("URL de l'API:", apiUrl);

    const maxAttempts = 5; // Nombre maximum de tentatives
    let attempt = 0;
    let delay = 1000; // Délai initial en millisecondes (1 seconde)


    while (attempt < maxAttempts) {
        attempt++;
        try {
            const response = await fetch(apiUrl);

            if (response.ok) {
                const data = await response.json();
                console.log("Données brutes de l'API:", data);

                if (data.totalItems === 0) {
                    throw new Error("Aucun livre trouvé pour cet ISBN.");
                }

                const bookData = data.items[0].volumeInfo;
                console.log("bookData extrait:", bookData);

                const extractedData = {
                    title: bookData.title,
                    author: bookData.authors ? bookData.authors[0] : '',
                    coverUrl: bookData.imageLinks ? bookData.imageLinks.thumbnail : '',
                    publisher: bookData.publisher,
                    publishedDate: bookData.publishedDate,
                    pageCount: bookData.pageCount,
                    isbn: isbn,
                    status: "À lire",
                };
                console.log("Données extraites:", extractedData);
                return extractedData;

            } else if (response.status === 503) {
                console.warn(`Tentative <span class="math-inline">\{attempt\}/</span>{maxAttempts}: Erreur 503. Nouvel essai dans ${delay / 1000} secondes...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Double le délai à chaque tentative (exponential backoff)
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`); // Gère les autres erreurs HTTP
            }

        } catch (error) {
            console.error("Erreur lors de la récupération des données ISBN:", error);
             if (attempt === maxAttempts) {
                    displayError(error.message + " après plusieurs tentatives."); // Affiche "Aucun livre trouvé" seulement si c'est l'erreur
                    return null;
             }
        }
    }

}


// --------- Gestion du formulaire ---------

async function handleFormSubmit(event) {
    event.preventDefault();

    const bookId = document.getElementById('book-id').value;
    const isbn = document.getElementById('book-isbn').value;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const status = document.getElementById('book-status').value;
    const coverUrl = document.getElementById('book-coverUrl').value;

    // Si un ISBN est fourni, on appelle la fonction de recherche *AVANT* de construire bookData
    if (isbn) {
        const fetchedData = await fetchBookDataFromISBN(isbn);

        if (fetchedData) {
            // Si des données sont récupérées, on les utilise DIRECTEMENT.
            try {
                let response;
                if (bookId) {
                    // Modification d'un livre existant
                    response = await fetch(`/api/books/${bookId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fetchedData), // Utilise directement fetchedData
                    });
                } else {
                    // Ajout d'un nouveau livre
                    response = await fetch('/api/books', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fetchedData), // Utilise directement fetchedData
                    });
                }

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                fetchBooks();
                resetForm();
                document.getElementById('book-form').classList.add('hidden');

            } catch (error) {
                console.error("Erreur lors de l'enregistrement du livre:", error);
                displayError("Impossible d'enregistrer le livre. Veuillez réessayer.");
            }
        } else {
            // Si la recherche ISBN échoue (fetchedData est null), on arrête le processus
            return;
        }
    } else {
        // Si AUCUN ISBN n'est fourni, on procède à la validation et à l'enregistrement "classiques".
        if (!title || !author) {
            alert("Veuillez remplir les champs titre et auteur.");
            return;
        }

        const bookData = { title, author, status, coverUrl, isbn }; // Ajout de isbn, important pour l'affichage

        try {
            let response;
            if (bookId) {
                // Modification d'un livre existant
                response = await fetch(`/api/books/${bookId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData),
                });
            } else {
                // Ajout d'un nouveau livre
                response = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData),
                });
            }

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            fetchBooks();
            resetForm();
            document.getElementById('book-form').classList.add('hidden');

        } catch (error) {
            console.error("Erreur lors de l'enregistrement du livre:", error);
            displayError("Impossible d'enregistrer le livre. Veuillez réessayer.");
        }
    }
}


 // --------- Gestion des filtres ---------
function handleFilterClick(event) {
  if (event.target.classList.contains('filter-button')) {
    // Désélectionne le bouton précédemment actif
    document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('bg-[#7B685E]', 'text-[#E5C0A2]'));

    // Sélectionne le bouton cliqué
    event.target.classList.add('bg-[#7B685E]', 'text-[#E5C0A2]');
    currentFilter = event.target.dataset.status;
    fetchBooks(); // Recharge avec le filtre appliqué
  }
}


// --------- Gestion de l'affichage ---------
function showLoading() {
  document.getElementById('loading-message').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-message').classList.add('hidden');
}

function displayError(message) {
  // Idéalement, crée un élément d'alerte réutilisable dans ton HTML, et affiche/masque cet élément ici.
  alert(message); // Solution temporaire
}

// --------- Initialisation et écouteurs d'événements ---------

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

     //Affiche le formulaire est le réinitialise
    document.getElementById('add-book-button').addEventListener('click', () => {
        resetForm();
        document.getElementById('book-form').classList.remove('hidden');
    });

    //Bouton annuler
    document.getElementById('cancel-button').addEventListener('click', () => {
        document.getElementById('book-form').classList.add('hidden');
        document.getElementById("add-book-button").classList.remove("hidden");
    });

     // Gestion des clics sur les boutons de filtre
 document.querySelector('.mb-4.flex.justify-center.space-x-2').addEventListener('click', handleFilterClick);
});



document.getElementById('book-form').addEventListener('submit', handleFormSubmit);