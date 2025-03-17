// index.js 
import { etageresExemples, creerCarteEtagereHTML } from './bookshelf.js';
// --------- Fonctions utilitaires ---------

function createElementWithClasses(tag, classNames) {
    const element = document.createElement(tag);
    element.className = classNames;
    return element;
}

function createBookCard(book) {
    const card = createElementWithClasses('div', 'bg-white rounded-lg shadow-md p-4 relative');
    card.dataset.bookId = book._id;

    const imgContainer = createElementWithClasses('div', 'flex justify-center');
    const img = createElementWithClasses('img', 'book-cover h-48 w-48 object-cover rounded-md');
    img.src = book.coverUrl || 'images/default-book-cover.png'; // Utilisez le chemin correct
    img.alt = `Couverture de ${book.title}`;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const title = createElementWithClasses('h3', 'text-lg font-semibold mt-2 text-gray-800');
    title.textContent = book.title;
    card.appendChild(title);

    const author = createElementWithClasses('p', 'text-gray-600');
    author.textContent = Array.isArray(book.author) ? book.author.join(', ') : (book.author || 'Auteur inconnu');
    card.appendChild(author);

    const status = createElementWithClasses('p', 'text-sm text-gray-500 mt-1');
    status.textContent = `Statut: ${book.status}`;
    card.appendChild(status);

    if (book.publisher) {
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

    if (book.isbn) {
        const isbn = createElementWithClasses('p', 'text-sm text-gray-500');
        isbn.textContent = `ISBN: ${book.isbn}`;
        card.appendChild(isbn);
    }

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

// --------- Gestion des livres ---------

let currentFilter = "Tous";

function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';

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

async function fetchBooks() {
    try {
        showLoading();
        const response = await fetch('/api/books');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error);
        displayError("Impossible de récupérer les livres. Veuillez réessayer.");
    } finally {
        hideLoading();
    }
}

async function deleteBook(bookId) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
        return;
    }

    try {
        const response = await fetch(`/api/books/${bookId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        fetchBooks();
    } catch (error) {
        console.error("Erreur lors de la suppression du livre:", error);
        displayError("Impossible de supprimer le livre. Veuillez réessayer.");
    }
}

function editBook(book) {
    document.getElementById('book-id').value = book._id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-status').value = book.status;
    document.getElementById('book-coverUrl').value = book.coverUrl;
    if(book.isbn){
       document.getElementById('book-isbn').value = book.isbn;
    }
    document.getElementById('form-title').textContent = "Modifier le livre";
    document.getElementById('book-form').classList.remove('hidden');
    document.getElementById("add-book-button").classList.add("hidden");
}

function resetForm() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    document.getElementById('form-title').textContent = "Ajouter un nouveau livre";
    document.getElementById("add-book-button").classList.remove("hidden");
}

// --------- Requête ISBN (fetchBookDataFromISBN) ---------

async function fetchBookDataFromISBN(isbn) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    console.log("URL de l'API:", apiUrl);

    const maxAttempts = 5;
    let attempt = 0;
    let delay = 1000;

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
                    status: "À lire", // Valeur par défaut
                };
                console.log("Données extraites:", extractedData);
                return extractedData;

            } else if (response.status === 503) {
                console.warn(`Tentative ${attempt}/${maxAttempts}: Erreur 503. Nouvel essai dans ${delay / 1000} secondes...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la tentative ${attempt}/${maxAttempts}:`, error);
            if (attempt === maxAttempts) {
                if (error.message === "Aucun livre trouvé pour cet ISBN.") {
                    displayError("Aucun livre trouvé pour cet ISBN après plusieurs tentatives.");
                } else {
                    displayError("Impossible de récupérer les informations du livre après plusieurs tentatives.");
                }
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

    if (isbn) {
        const fetchedData = await fetchBookDataFromISBN(isbn);

        if (fetchedData) {
            try {
                let response;
                if (bookId) {
                    response = await fetch(`/api/books/${bookId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fetchedData),
                    });
                } else {
                    response = await fetch('/api/books', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fetchedData),
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
            return;
        }
    } else {
        if (!title || !author) {
            alert("Veuillez remplir les champs titre et auteur.");
            return;
        }

        const bookData = { title, author, status, coverUrl, isbn }; // Ajout de l'ISBN

        try {
            let response;
            if (bookId) {
                response = await fetch(`/api/books/${bookId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData),
                });
            } else {
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

// --------- Gestion de l'affichage ---------

function showLoading() {
    document.getElementById('loading-message').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-message').classList.add('hidden');
}

function displayError(message) {
    alert(message);
}

// --------- Initialisation et écouteurs d'événements ---------

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    document.getElementById('book-form').addEventListener('submit', handleFormSubmit); // Correction ici

    document.getElementById('add-book-button').addEventListener('click', () => {
        resetForm();
        document.getElementById('book-form').classList.remove('hidden');
    });

    document.getElementById('cancel-button').addEventListener('click', () => {
        document.getElementById('book-form').classList.add('hidden');
        document.getElementById("add-book-button").classList.remove("hidden");
    });

    const menuEtagere = document.getElementById('menu-etagere');
    etageresExemples.forEach(etagere => {
        const carte = creerCarteEtagereHTML(etagere);
        menuEtagere.appendChild(carte);
    });

    menuEtagere.addEventListener('click', (event) => {
        let target = event.target;
        while (target && target.tagName !== 'LI') {
            target = target.parentNode;
        }

        if (target && target.dataset.status) {
            document.querySelectorAll('.filter-button').forEach(button =>
                button.classList.remove('bg-[#7B685E]', 'text-[#E5C0A2]')
            );

            currentFilter = target.dataset.status === "Tous mes livres" ? "Tous" : target.dataset.status;
            fetchBooks();

            document.querySelectorAll('#menu-etagere li').forEach(li => {
                li.classList.remove('bg-gray-600');
            });

            target.classList.add('bg-gray-600');
        }
    });
}); 