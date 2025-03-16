// index.js

// --------- Fonctions utilitaires ---------

// Crée un élément HTML avec les classes Tailwind fournies
function createElementWithClasses(tag, classNames) {
    const element = document.createElement(tag);
    element.className = classNames;
    return element;
}

// Crée une carte de livre HTML
function createBookCard(book) {
    const card = createElementWithClasses('div', 'book-card bg-white rounded-lg shadow-md p-4 relative');  // Ajout de 'relative'
    card.dataset.bookId = book._id; // Stocke l'ID du livre pour les modifications/suppressions

    const imgContainer = createElementWithClasses('div', 'flex justify-center');
    const img = createElementWithClasses('img', 'book-cover h-48 object-cover'); // Hauteur fixe, object-cover
    img.src = book.coverUrl || 'placeholder.jpg'; // Image par défaut si pas d'URL (assure-toi d'avoir placeholder.jpg)
    img.alt = `Couverture de ${book.title}`;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const title = createElementWithClasses('h3', 'text-lg font-semibold mt-2 text-gray-800');
    title.textContent = book.title;
    card.appendChild(title);

    const author = createElementWithClasses('p', 'text-gray-600');
    author.textContent = book.author;
    card.appendChild(author);

    const status = createElementWithClasses('p', 'text-sm text-gray-500 mt-1');
    status.textContent = `Statut: ${book.status}`;
    card.appendChild(status);

    // Boutons d'action (modification et suppression)
    const actionsContainer = createElementWithClasses('div', 'absolute top-2 right-2 flex space-x-2'); // Positionnement absolu

    const editButton = createElementWithClasses('button', 'edit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs');
    editButton.innerHTML = '&#9998;'; // Icône crayon (Unicode)
    editButton.addEventListener('click', () => editBook(book));
    actionsContainer.appendChild(editButton);

    const deleteButton = createElementWithClasses('button', 'delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs');
    deleteButton.innerHTML = '&#10006;'; // Icône croix (Unicode)
    deleteButton.addEventListener('click', () => deleteBook(book._id));
    actionsContainer.appendChild(deleteButton);

    card.appendChild(actionsContainer); // Ajoute les boutons à la carte

    return card;
}

// --------- Gestion des livres ---------

let currentFilter = "Tous"; // Garde une trace du filtre actif

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
        const card = createBookCard(book);
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

// Gère la soumission du formulaire (ajout et modification)
async function handleFormSubmit(event) {
    event.preventDefault();

    const bookId = document.getElementById('book-id').value;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const status = document.getElementById('book-status').value;
    const coverUrl = document.getElementById('book-coverUrl').value;


    // Validation simple (vérifie que les champs obligatoires sont remplis)
    if (!title || !author) {
        alert("Veuillez remplir les champs titre et auteur.");
        return;
    }

    const bookData = { title, author, status, coverUrl };

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

        // const savedBook = await response.json(); //  Pas strictement nécessaire si on refetch
        fetchBooks(); // Recharge les livres après l'ajout/modification
        resetForm(); // Réinitialise le formulaire
        document.getElementById('book-form').classList.add('hidden'); // Cache le formulaire

    } catch (error) {
        console.error("Erreur lors de l'enregistrement du livre:", error);
         displayError("Impossible d'enregistrer le livre. Veuillez réessayer."); // Affiche un message d'erreur à l'utilisateur
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
    fetchBooks(); // Charge les livres au démarrage

    document.getElementById('book-form').addEventListener('submit', handleFormSubmit);

      // Bouton "Ajouter un livre" :  affiche le formulaire, le réinitialise
    document.getElementById('add-book-button').addEventListener('click', () => {
        resetForm(); // Assure-toi que le formulaire est propre
        document.getElementById('book-form').classList.remove('hidden');
    });

      // Bouton "Annuler" dans le formulaire : cache le formulaire
     document.getElementById('cancel-button').addEventListener('click', () => {
        document.getElementById('book-form').classList.add('hidden');
        document.getElementById("add-book-button").classList.remove("hidden");
    });

    // Gestion des clics sur les boutons de filtre
    document.querySelector('.mb-4.flex.justify-center.space-x-2').addEventListener('click', handleFilterClick);

});