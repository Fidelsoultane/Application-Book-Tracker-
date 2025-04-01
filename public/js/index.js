

// index.js



// --------- Fonctions utilitaires ---------

function createElementWithClasses(tag, classNames) {
    const element = document.createElement(tag);
    element.className = classNames;
    return element;
}

function showLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.classList.add('hidden');
    }
}

// Fonction pour afficher les erreurs (vous l'avez peut-être déjà, sinon ajoutez-la aussi)
function displayError(message) {
    alert(`Erreur : ${message}`);
}

// Fonction pour afficher succès (vous l'avez peut-être déjà)
function displaySuccessMessage(message) {
    alert(message);
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
    if (book.genre) {
        const genre = createElementWithClasses('p', 'text-sm text-gray-500');
        genre.textContent = `Genre: ${book.genre}`;
        card.appendChild(genre);
    }

    // Affichage des dates de début et de fin (conditionnel)
    if (book.startDate) {
        const startDate = createElementWithClasses('p', 'text-sm text-gray-500');
        startDate.textContent = `Début de lecture: ${new Date(book.startDate).toLocaleDateString()}`; // Formatage de la date
        card.appendChild(startDate);
    }

    if (book.endDate) {
        const endDate = createElementWithClasses('p', 'text-sm text-gray-500');
        endDate.textContent = `Fin de lecture: ${new Date(book.endDate).toLocaleDateString()}`;  // Formatage de la date
        card.appendChild(endDate);
    }

    const actionsContainer = createElementWithClasses('div', 'absolute top-2 right-2 flex space-x-2');
    const editButton = createElementWithClasses('button', 'edit-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs');
    editButton.innerHTML = '&#9998;'; // Utiliser Font Awesome <i class="fas fa-pencil-alt"></i> si intégré
    editButton.addEventListener('click', () => editBook(book));
    actionsContainer.appendChild(editButton);

    const deleteButton = createElementWithClasses('button', 'delete-button bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs');
    deleteButton.innerHTML = '&#10006;'; // Utiliser Font Awesome <i class="fas fa-trash"></i> si intégré
    deleteButton.addEventListener('click', () => deleteBook(book._id));
    actionsContainer.appendChild(deleteButton);
     // Affichage des tags
     if (book.tags && book.tags.length > 0) {
        const tagsContainer = createElementWithClasses('div', 'mt-2 flex flex-wrap'); // Le conteneur
        book.tags.forEach(tag => {
            // Crée un lien <a> pour chaque tag
            const tagElement = createElementWithClasses('a', 'tag-link bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-1 mb-1 cursor-pointer hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400'); // Ajout de classes cliquables
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag; // Stocke le nom du tag
            tagElement.href = "#"; // Empêche le comportement par défaut mais rend cliquable
              // L'écouteur sera ajouté via délégation sur #book-list
              tagsContainer.appendChild(tagElement);
            });
            card.appendChild(tagsContainer);
        }


    card.appendChild(actionsContainer);

    return card;
}

// --------- Gestion des livres ---------

let currentStatusFilter = "Tous"; // Renommé pour clarté
let currentGenreFilter = "Tous"; // Pour le filtre par étagère/genre
let currentTagFilter = null; // null signifie "pas de filtre tag actif"
let currentPublisherFilter = ""; // NOUVELLE variable globale pour le filtre éditeur


async function fetchBooks() {
    try {
        showLoading();

        let url = '/api/books?';

        // --- Filtrage par statut ---
        if (currentStatusFilter !== "Tous") {
            url += `status=${encodeURIComponent(currentStatusFilter)}&`;
        }

        // --- Filtrage par genre ---
        if (currentGenreFilter !== "Tous") {
            url += `genre=${encodeURIComponent(currentGenreFilter)}&`;
        }

         // --- Filtrage par tag --- (NOUVEAU BLOC)
         if (currentTagFilter) { // Vérifie si un tag est sélectionné (n'est pas null)
            url += `tags=${encodeURIComponent(currentTagFilter)}&`; // Ajoute le paramètre tag
        }

        if (currentPublisherFilter) { // NOUVEAU FILTRE
            url += `publisher=${encodeURIComponent(currentPublisherFilter)}&`;
        }

        // --- Tri ---
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) {
            url += `sortBy=${sortSelect.value}&`;
        }

        // Supprime le '&' final si présent
        if (url.endsWith('&')) {
            url = url.slice(0, -1);
        }

        console.log("Fetching URL:", url); // Log pour le débogage

        const response = await fetch(url);
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

function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    if (!bookList) return; // Sécurité
    bookList.innerHTML = '';

    if (!books || books.length === 0) {
        bookList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Aucun livre ne correspond à vos critères.</p>';
        return;
    }

    books.forEach(book => {
        const bookCard = createBookCard(book);
        bookList.appendChild(bookCard);
    });
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
        fetchBooks(); // Recharge la liste des livres après suppression
    } catch (error) {
        console.error("Erreur lors de la suppression du livre:", error);
        displayError("Impossible de supprimer le livre. Veuillez réessayer.");
    }
}

async function editBook(book) {
    console.log("Modification du livre:", book);
    resetForm(); // Vide le formulaire avant de le remplir

    // PEUPLE LE DROPDOWN AVANT de remplir les champs
    await populateGenreDropdown(book.genre || ''); // Passe le genre actuel pour pré-sélection


    // Pré-remplir le formulaire avec les données du livre
    document.getElementById('book-id').value = book._id;
    document.getElementById('book-title').value = book.title || '';
    document.getElementById('book-author').value = Array.isArray(book.author) ? book.author.join(', ') : (book.author || ''); // Gère le tableau d'auteurs
    document.getElementById('book-isbn').value = book.isbn || '';
    document.getElementById('book-status').value = book.status || 'À lire';
    document.getElementById('book-genre').value = book.genre || ''; // Pré-remplit le genre
    document.getElementById('book-publisher').value = book.publisher || '';
    document.getElementById('book-publishedDate').value = book.publishedDate || '';
    document.getElementById('book-pageCount').value = book.pageCount || '';
    document.getElementById('book-tags').value = book.tags ? book.tags.join(', ') : '';
    document.getElementById('book-startDate').value = book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : ''; // Format YYYY-MM-DD
    document.getElementById('book-endDate').value = book.endDate ? new Date(book.endDate).toISOString().split('T')[0] : ''; // Format YYYY-MM-DD
    document.getElementById('book-coverUrl').value = book.coverUrl || '';


    // Afficher le formulaire
    const bookForm = document.getElementById('book-form');
    if (bookForm) bookForm.classList.remove('hidden');
    const addBookButton = document.getElementById("add-book-button");
    if (addBookButton) addBookButton.classList.add("hidden"); // Cache le bouton "Ajouter"
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonte en haut de page
}


function resetForm() {
    const form = document.getElementById('book-form');
    if (form) form.reset();
    const bookIdInput = document.getElementById('book-id');
    if (bookIdInput) bookIdInput.value = '';
    const formTitle = document.getElementById('form-title');
    if(formTitle) formTitle.textContent = "Ajouter un nouveau livre";

    // Réinitialise le select du genre à la première option ("-- Sélectionner --")
    const genreSelect = document.getElementById('book-genre');
    if (genreSelect) genreSelect.selectedIndex = 0; // Remet à la première option

    const addBookButton = document.getElementById("add-book-button");
    if (addBookButton) addBookButton.classList.remove("hidden");
}

// --------- Requête ISBN (fetchBookDataFromISBN) ---------

async function fetchBookDataFromISBN(isbn) {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    console.log("URL de l'API:", apiUrl);

    const maxAttempts = 3; // Réduit le nombre de tentatives pour éviter les attentes longues
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
                    author: bookData.authors ? bookData.authors.join(', ') : '', // Prend tous les auteurs
                    coverUrl: bookData.imageLinks?.thumbnail || bookData.imageLinks?.smallThumbnail || '', // Prend la miniature disponible
                    publisher: bookData.publisher,
                    publishedDate: bookData.publishedDate,
                    pageCount: bookData.pageCount,
                    isbn: isbn,
                    status: "À lire", // Valeur par défaut
                    genre: bookData.categories?.[0] || '', // Prend la première catégorie
                };
                console.log("Données extraites:", extractedData);
                return extractedData;

            } else if (response.status === 503) {
                console.warn(`Tentative ${attempt}/${maxAttempts}: Erreur 503. Nouvel essai dans ${delay / 1000} secondes...`);
                if (attempt < maxAttempts) await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la tentative ${attempt}/${maxAttempts}:`, error);
            if (attempt === maxAttempts) {
                 // Affiche l'erreur seulement à la dernière tentative
                 displayError(error.message || "Impossible de récupérer les informations du livre.");
                return null;
            }
            // Si pas la dernière tentative, et c'est une erreur 503, on continue la boucle
            // Si autre erreur, on la relance pour sortir de la boucle
             if (response && response.status !== 503) throw error;
             if (!response) throw error; // Relance si fetch lui-même échoue (ex: réseau)

        }
    }
    return null; // Retourne null si toutes les tentatives échouent
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
    const publisher = document.getElementById('book-publisher').value;
    const publishedDate = document.getElementById('book-publishedDate').value;
    const pageCount = document.getElementById('book-pageCount').value;
    const genre = document.getElementById('book-genre').value;
    const startDate = document.getElementById('book-startDate').value || null; // Envoyer null si vide
    const endDate = document.getElementById('book-endDate').value || null;     // Envoyer null si vide
    const tagsString = document.getElementById('book-tags').value;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : [];

    let bookData; // Déclaration de bookData *avant* le if/else

    if (isbn && !bookId) { // Recherche ISBN seulement si on AJOUTE un livre (pas de bookId)
        const fetchedData = await fetchBookDataFromISBN(isbn);

        if (fetchedData) {
            // Fusionne les données de l'API avec les données du formulaire (pour status, startDate, endDate, tags, genre)
            // Priorise les valeurs du formulaire si elles existent
            bookData = {
                ...fetchedData,
                title: title || fetchedData.title, // Garde le titre du formulaire si saisi
                author: author || fetchedData.author, // Garde l'auteur du formulaire si saisi
                status: status || "À lire",
                coverUrl: coverUrl || fetchedData.coverUrl,
                publisher: publisher || fetchedData.publisher,
                publishedDate: publishedDate || fetchedData.publishedDate,
                pageCount: pageCount || fetchedData.pageCount,
                genre: genre || fetchedData.genre,
                startDate: startDate,
                endDate: endDate,
                tags: tags,
                isbn: isbn // Assure que l'ISBN est bien là
             };
            console.log("bookData après récupération de l'API et fusion:", bookData);
        } else {
            // Si la recherche ISBN échoue MAIS que l'utilisateur a rempli le titre/auteur, on continue en manuel
            if (!title || !author) {
                 displayError("ISBN non trouvé et informations manquantes. Veuillez remplir au moins le titre et l'auteur.");
                 return; // Sortir si l'ISBN est invalide ET les infos manuelles manquent
            }
             console.log("ISBN non trouvé, ajout manuel avec les données saisies.");
             bookData = { title, author, status, coverUrl, isbn, publisher, publishedDate, pageCount, genre, startDate, endDate, tags };
        }
    } else {
        // Pas d'ISBN fourni OU Modification (bookId existe)
        if (!title || !author) {
            alert("Veuillez remplir les champs titre et auteur.");
            return;
        }
        // Pour la modification (bookId existe), on utilise les données du formulaire
        // Pour l'ajout manuel (pas d'ISBN), on utilise aussi les données du formulaire
        bookData = { title, author, status, coverUrl, isbn, publisher, publishedDate, pageCount, genre, startDate, endDate, tags };
        console.log("bookData pour ajout manuel ou modification:", bookData);
    }

    // --- Envoi au serveur ---
    try {
        let response;
        let method = bookId ? 'PUT' : 'POST'; // Détermine la méthode HTTP
        let apiUrl = bookId ? `/api/books/${bookId}` : '/api/books';

        response = await fetch(apiUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
        });

        if (!response.ok) {
             // Essayons d'obtenir plus de détails sur l'erreur du serveur
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {/* Ignore */}
            throw new Error(errorMsg);
        }

        fetchBooks(); // Recharge la liste des livres
        resetForm(); // Réinitialise et cache le formulaire
        const bookFormElement = document.getElementById('book-form');
        if(bookFormElement) bookFormElement.classList.add('hidden');


    } catch (error) {
        console.error("Erreur lors de l'enregistrement du livre:", error);
        displayError(error.message || "Impossible d'enregistrer le livre. Veuillez réessayer.");
    }
}
// --------- Fonctions pour gérer les étagères (AJOUTÉES ICI) ---------

async function fetchEtageres() {
    try {
        const response = await fetch('/api/etageres');
        if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const etageres = await response.json();
        return etageres;
    } catch (error) {
        console.error("Erreur lors de la récupération des étagères:", error);
        displayError("Impossible de récupérer les étagères. Veuillez réessayer.");
        return []; // Retourne un tableau vide en cas d'erreur
    }
}

async function deleteEtagere(etagereId) {
    try {
        const response = await fetch(`/api/etageres/${etagereId}`, { // Appel à l'API DELETE
            method: 'DELETE',
        });

        if (!response.ok) {
            // Essayer de lire le message d'erreur du serveur
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignorer */ }
            throw new Error(errorMsg);
        }

        // Pas besoin de lire le corps de la réponse pour un DELETE réussi en général
        return true; // Indique le succès

    } catch (error) {
        console.error("Erreur lors de la suppression de l'étagère:", error);
        displayError(error.message || "Une erreur inconnue est survenue lors de la suppression de l'étagère.");
        return false; // Indique un échec
    }
}

async function createEtagere(etagereData) {
    try {
        const response = await fetch('/api/etageres', { // Appel à l'API POST
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(etagereData),
        });

        if (!response.ok) {
            // Essayer de lire le message d'erreur du serveur
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg; // Utilise le message du serveur s'il existe
            } catch (e) {
                // Ignorer si la réponse n'est pas du JSON valide
            }
            throw new Error(errorMsg);
        }

        const newEtagere = await response.json();
        return newEtagere; // Retourne la nouvelle étagère créée


    } catch (error) {
        console.error("Erreur lors de la création de l'étagère:", error);
        displayError(error.message || "Une erreur inconnue est survenue lors de la création de l'étagère.");
        return null; // Indique un échec
    }
}


function displayEtageres(etageres) {
    const menuEtagere = document.getElementById('menu-etagere');
    if (!menuEtagere) {
        console.error("Élément #menu-etagere non trouvé !");
        return;
     }
    menuEtagere.innerHTML = ''; // Efface TOUT le contenu précédent de l'UL

    // 1. Ajout du bouton "Tous mes livres"
    const tousMesLivresLi = document.createElement('li');
    tousMesLivresLi.className = 'mb-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer'; // Style par défaut
    tousMesLivresLi.textContent = "Tous mes livres";
    // Écouteur pour "Tous mes livres"
    tousMesLivresLi.addEventListener('click', () => {
        console.log("Clic sur 'Tous mes livres' détecté."); // Log pour débogage
    
        // --- Réinitialise TOUS les filtres ---
        currentGenreFilter = "Tous";   // Réinitialise le filtre Genre
        currentTagFilter = null;     // RÉINITIALISE LE FILTRE TAG (met à null)
        currentStatusFilter = "Tous"; // Réinitialise aussi le filtre Statut
        currentPublisherFilter = ""; // RÉINITIALISE LE FILTRE ÉDITEUR

        // Vide le champ de saisie du filtre éditeur
        const publisherInput = document.getElementById('filter-publisher');
        if (publisherInput) {
            publisherInput.value = "";
        }

        fetchBooks();
        // Gère le style actif
        document.querySelectorAll('#menu-etagere li').forEach(item => item.classList.remove('bg-gray-600', 'text-white'));
        tousMesLivresLi.classList.add('bg-gray-600', 'text-white');
    });
    menuEtagere.appendChild(tousMesLivresLi); // Ajoute "Tous mes livres"

    // 2. Ajoute les étagères dynamiques
    etageres.forEach(etagere => {
        const li = document.createElement('li');
        li.className = 'mb-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer flex items-center justify-between';
        li.dataset.etagereId = etagere._id;

        const span = document.createElement('span'); // Pour le nom
        span.textContent = etagere.name; // Définit le nom de l'étagère
        li.appendChild(span); // Ajoute le nom

        // Bouton de suppression
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'delete-etagere-button text-red-500 hover:text-red-700 ml-2';
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            if (confirm(`Êtes-vous sûr de vouloir supprimer l'étagère "${etagere.name}" ?`)) {
                deleteEtagere(etagere._id).then(success => {
                    if (success) {
                        fetchEtageres().then(displayEtageres);
                        if (currentGenreFilter === etagere.name) {
                            currentGenreFilter = "Tous";
                        }
                        fetchBooks();
                    }
                });
            }
        });
        li.appendChild(deleteButton); // Ajoute le bouton supprimer

        // Écouteur sur le LI pour le filtrage par GENRE
        li.addEventListener('click', () => {
            currentGenreFilter = etagere.name;
            fetchBooks();
            // Gère le style actif
            document.querySelectorAll('#menu-etagere li').forEach(item => item.classList.remove('bg-gray-600', 'text-white'));
            li.classList.add('bg-gray-600', 'text-white');
        });

        menuEtagere.appendChild(li); // Ajoute l'étagère à la liste UL
    });

    // 3. Sélectionne visuellement l'élément actif après le rendu
    let activeLi = null;
    if (currentGenreFilter === "Tous") {
        activeLi = tousMesLivresLi;
    } else {
        const spans = menuEtagere.querySelectorAll('li span');
        for (const span of spans) {
            if (span.textContent === currentGenreFilter) {
                activeLi = span.closest('li');
                break;
            }
        }
    }
    if (activeLi) {
        activeLi.classList.add('bg-gray-600', 'text-white');
    } else if (currentGenreFilter !== "Tous") {
        // Si le filtre est défini mais qu'on ne trouve pas l'étagère (ex: supprimée), on sélectionne "Tous" visuellement
        tousMesLivresLi.classList.add('bg-gray-600', 'text-white');
    }
}



/**
 * Récupère les étagères depuis l'API et peuple le menu déroulant des genres.
 * @param {string} [selectedValue] - Optionnel: La valeur du genre à pré-sélectionner.
 */
async function populateGenreDropdown(selectedValue = '') {
    const genreSelect = document.getElementById('book-genre');
    if (!genreSelect) return; // Quitte si l'élément n'existe pas

    const currentValue = genreSelect.value; // Sauvegarde la valeur actuelle (utile si on rafraîchit)

    try {
        const etageres = await fetchEtageres(); // Réutilise la fonction existante

        // Vide les options actuelles (sauf la première "-- Sélectionner --")
        genreSelect.length = 1; // Garde seulement la première option

        etageres.forEach(etagere => {
            const option = document.createElement('option');
            option.value = etagere.name; // La valeur de l'option est le nom de l'étagère
            option.textContent = etagere.name; // Le texte affiché est aussi le nom
            genreSelect.appendChild(option);
        });

        // Pré-sélectionne la valeur si fournie (pour l'édition) ou restaure la valeur actuelle
        if (selectedValue) {
            genreSelect.value = selectedValue;
        } else {
            genreSelect.value = currentValue; // Restaure la valeur précédente si aucune sélection spécifique n'est demandée
        }

    } catch (error) {
        console.error("Erreur lors du peuplement du dropdown des genres:", error);
        // Optionnel: Afficher un message à l'utilisateur
    }
}


// --------- Initialisation et écouteurs d'événements ---------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Chargement initial
    fetchBooks();
    fetchEtageres().then(displayEtageres); // MAINTENANT ACCESSIBLE !

   // 2. Gestion du formulaire
    document.getElementById('book-form').addEventListener('submit', handleFormSubmit);

    // 3. Bouton "Ajouter un livre"
    document.getElementById('add-book-button').addEventListener('click', async () => { // Notez le 'async' ici
        resetForm();
        await populateGenreDropdown(); // PEUPLE LE DROPDOWN avant d'afficher
        document.getElementById('book-form').classList.remove('hidden');
    });

   // 4.  Bouton "Annuler"
    document.getElementById('cancel-button').addEventListener('click', () => {
        document.getElementById('book-form').classList.add('hidden');
        document.getElementById("add-book-button").classList.remove("hidden");
    });
    // --- Gestion des clics sur les *boutons* de filtre ---
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Désactive le style actif sur tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('bg-gray-600', 'text-white'));

            // Active le style sur le bouton cliqué
            event.target.classList.add('bg-gray-600', 'text-white');

            // Met à jour le filtre courant
            currentStatusFilter = event.target.dataset.status; // Renommé pour clarté

            // Recharge les livres avec le nouveau filtre
            fetchBooks();
        });
    });
      // --- Tri par titre ---
    const sortSelect = document.getElementById('sort-select');
    if(sortSelect){
        sortSelect.addEventListener('change', fetchBooks);
    }

     // --- Gestion du formulaire d'ajout d'étagère ---
     const addEtagereForm = document.getElementById('add-etagere-form');
     const etagereNameInput = document.getElementById('etagere-name');
     const cancelAddEtagereButton = document.getElementById('cancel-add-etagere');
     const manageEtageresButton = document.getElementById('manage-etageres-button');

    if (manageEtageresButton && addEtagereForm && cancelAddEtagereButton) {
        manageEtageresButton.addEventListener('click', () => {
            addEtagereForm.classList.toggle('hidden');
            if (!addEtagereForm.classList.contains('hidden')) {
                etagereNameInput.focus();
            }
        });

        cancelAddEtagereButton.addEventListener('click', () => {
            addEtagereForm.classList.add('hidden');
            etagereNameInput.value = '';
        });
    }
      if (addEtagereForm && etagereNameInput) {
        addEtagereForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = etagereNameInput.value.trim();

            if (!name) {
                displayError("Le nom de l'étagère ne peut pas être vide.");
                return;
            }
            const newEtagere = await createEtagere({ name });
            if (newEtagere) {
                etagereNameInput.value = '';
                addEtagereForm.classList.add('hidden');
                fetchEtageres().then(displayEtageres); // Recharge la liste des étagères
                 // Optionnel: Mettre à jour currentGenreFilter si besoin ou recharger les livres
                // fetchBooks();
            }
        });
    }

     // --- Gestion du clic sur un TAG (Délégation d'événement) ---
     const bookListElement = document.getElementById('book-list');
     if (bookListElement) {
         bookListElement.addEventListener('click', (event) => {
             // 1. Vérifie si l'élément cliqué (ou un de ses parents) est un lien de tag
             const tagLink = event.target.closest('a.tag-link'); // Cherche un <a> avec la classe tag-link
 
             // 2. Si un lien de tag a été cliqué...
             if (tagLink) {
                 event.preventDefault(); // Empêche le lien '#' de modifier l'URL
 
                 // 3. Récupère le nom du tag depuis l'attribut data-tag
                 const clickedTag = tagLink.dataset.tag;
 
                 // 4. Met à jour la variable globale du filtre tag
                 currentTagFilter = clickedTag;
                 console.log("Filtre tag activé:", currentTagFilter); // Pour débogage
 
                 // 5. Recharge les livres avec le nouveau filtre appliqué
                 fetchBooks();
 
                 // Optionnel (pour plus tard) : Mettre en évidence le filtre actif
                 // updateActiveTagDisplay(currentTagFilter);
             }
         });
     }

     // --- Gestion du filtre par Éditeur --- (NOUVEAU BLOC)
    const publisherInput = document.getElementById('filter-publisher');
    let publisherFilterTimeout; // Pour le debounce

    if (publisherInput) {
        publisherInput.addEventListener('input', (event) => {
            // Annule le timeout précédent pour éviter les appels multiples rapides
            clearTimeout(publisherFilterTimeout);

            // Définit un nouveau timeout
            publisherFilterTimeout = setTimeout(() => {
                currentPublisherFilter = event.target.value; // Met à jour le filtre éditeur
                console.log("Filtrage par éditeur:", currentPublisherFilter); // Débogage
                fetchBooks(); // Recharge les livres avec le nouveau filtre
            }, 500); // Attend 500ms après la dernière frappe avant de lancer la recherche
        });
    }
}); // FIN de DOMContentLoaded