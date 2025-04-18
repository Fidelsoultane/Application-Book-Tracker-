

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

/**
 * Affiche un message d'erreur à l'utilisateur via Toastify.
 * @param {string} message - Le message d'erreur à afficher.
 */
function displayError(message) {
    Toastify({
        text: message || "Une erreur est survenue.", // Message par défaut
        duration: 3000, // Durée d'affichage en ms (3 secondes)
        close: true, // Affiche un bouton pour fermer
        gravity: "top", // Position (top ou bottom)
        position: "right", // Position (left, center ou right)
        stopOnFocus: true, // Met en pause la durée si l'utilisateur survole
        style: {
            background: "linear-gradient(to right, #FF5F6D, #FFC371)", // Style pour l'erreur (rouge/orange)
        },
        onClick: function(){} // Callback après un clic
    }).showToast();
}

/**
 * Affiche un message de succès à l'utilisateur via Toastify.
 * @param {string} message - Le message de succès à afficher.
 */
function displaySuccessMessage(message) {
    Toastify({
        text: message || "Opération réussie.", // Message par défaut
        duration: 2000, // Durée d'affichage (2 secondes)
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)", // Style pour le succès (vert)
        },
        onClick: function(){}
    }).showToast();
}

function createBookCard(book) {
    const card = createElementWithClasses('div', 'bg-white rounded-lg shadow-md pt-10 p-4 relative');
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

    // --- Affichage de la Notation (Étoiles Statiques sur la carte) ---
    if (book.rating !== undefined && book.rating !== null && book.rating > 0) { // Affiche si note > 0
        const ratingContainer = createElementWithClasses('div', 'text-yellow-400 mt-1 mb-2'); // Conteneur + couleur
        ratingContainer.title = `Note : ${book.rating} / 5`; // Infobulle

        for (let i = 1; i <= 5; i++) { // Boucle 5 fois
            const starIcon = createElementWithClasses('i', 'fa-star mr-0.5'); // Icône étoile + petite marge
            if (i <= book.rating) {
                starIcon.classList.add('fas'); // fas = étoile pleine (Font Awesome Solid)
            } else {
                starIcon.classList.add('far'); // far = étoile vide (Font Awesome Regular)
            }
            ratingContainer.appendChild(starIcon);
        }
        // Insertion dans la carte (ajustez le sélecteur si besoin)
        const textInfoContainer = card.querySelector('.p-4 > div:first-of-type'); // Cible le div des infos principales
        if (textInfoContainer) textInfoContainer.appendChild(ratingContainer);
        else card.appendChild(ratingContainer); // Fallback
    }

     // --- Affichage de l'indicateur de notes --- (NOUVEAU BLOC)
     if (book.notes && book.notes.trim() !== '') {
        const noteIndicatorContainer = createElementWithClasses('span', 'ml-2'); // Conteneur pour l'icône

        const noteIndicatorIcon = createElementWithClasses('i', 'note-indicator-icon far fa-sticky-note text-gray-400 cursor-pointer hover:text-blue-500'); // Ajout cursor-pointer et classe
        noteIndicatorIcon.title = "Voir les notes"; // Infobulle

        // Ajout de l'écouteur de clic sur l'icône
        noteIndicatorIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Empêche le clic de remonter (ex: au LI parent)
            showNoteModal(book); // Appelle la fonction pour afficher la modale
        });

        noteIndicatorContainer.appendChild(noteIndicatorIcon);

        // Ajouter l'indicateur (par exemple, après le statut)
        const statusElement = card.querySelector('p.text-sm.text-gray-500');
        if (statusElement) {
            statusElement.appendChild(noteIndicatorContainer);
        } else {
            card.appendChild(noteIndicatorContainer);
        }
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

// --- NOUVELLE FONCTION : Afficher la modale de note ---
function showNoteModal(book) {
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('note-modal-title');
    const modalContent = document.getElementById('note-modal-content');

    if (modal && modalTitle && modalContent) {
        modalTitle.textContent = `Notes pour : ${book.title}`; // Met à jour le titre
        modalContent.textContent = book.notes; // Met à jour le contenu des notes
        modal.classList.remove('hidden'); // Affiche la modale
    } else {
        console.error("Éléments de la modale introuvables !");
    }
}

// --- NOUVELLE FONCTION : Cacher la modale de note ---
function hideNoteModal() {
    const modal = document.getElementById('note-modal');
    if (modal) {
        modal.classList.add('hidden'); // Cache la modale
    }
}

// --------- Gestion des livres ---------

let currentStatusFilter = "Tous"; // Renommé pour clarté
let currentGenreFilter = "Tous"; // Pour le filtre par étagère/genre
let currentTagFilter = null; // null signifie "pas de filtre tag actif"
let currentPublisherFilter = ""; // NOUVELLE variable globale pour le filtre éditeur
let currentPage = 1;
const booksPerPage = 12; // Ou le nombre que vous préférez (doit correspondre au défaut du backend ou être envoyé)


async function fetchBooks() {
    try {
        showLoading();

        let url = '/api/books?'; // Commence par '?'

        // --- Ajout des paramètres de pagination --- (VÉRIFIEZ CES LIGNES)
        url += `page=${currentPage}&limit=${booksPerPage}&`;

        // --- Filtres ---
        if (currentStatusFilter !== "Tous") { url += `status=${encodeURIComponent(currentStatusFilter)}&`; }
        if (currentGenreFilter !== "Tous") { url += `genre=${encodeURIComponent(currentGenreFilter)}&`; }
        if (currentTagFilter) { url += `tags=${encodeURIComponent(currentTagFilter)}&`; }
        if (currentPublisherFilter) { url += `publisher=${encodeURIComponent(currentPublisherFilter)}&`; }

        // --- Tri ---
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) { url += `sortBy=${sortSelect.value}&`; }

        // Supprime le '&' final
        if (url.endsWith('&')) { url = url.slice(0, -1); }

        console.log("Fetching URL:", url); // Doit maintenant inclure page et limit

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

        console.log("Données reçues du serveur (pagination):", data);

        displayBooks(data.books); // Affiche les livres de la page
        updatePaginationControls(data.totalBooks); // Met à jour les boutons

    } catch (error) {
        console.error("Erreur lors de la récupération des livres:", error);
        displayError("Impossible de récupérer les livres. Veuillez réessayer.");
        displayBooks([]);
        updatePaginationControls(0);
    } finally {
        hideLoading();
    }
}

// --- NOUVELLE FONCTION : Mettre à jour les contrôles de pagination ---
function updatePaginationControls(totalBooks) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    if (!prevButton || !nextButton || !pageInfo) return; // Sécurité

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    // Met à jour le texte d'information
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages > 0 ? totalPages : 1}`;

    // Active/désactive le bouton "Précédent"
    prevButton.disabled = currentPage <= 1;

    // Active/désactive le bouton "Suivant"
    nextButton.disabled = currentPage >= totalPages;

    // Cache les contrôles s'il n'y a qu'une seule page ou aucune page
     const controlsContainer = document.getElementById('pagination-controls');
     if (controlsContainer) {
         controlsContainer.style.display = totalPages <= 1 ? 'none' : 'flex';
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
    document.getElementById('book-notes').value = book.notes || ''; // PRÉ-REMPLIT LES NOTES
     // Mettre à jour l'affichage des étoiles ET le champ caché rating
     updateStarInputDisplay(book.rating || 0); // Appelle la fonction utilitaire


    document.getElementById('form-title').textContent = "Modifier le livre";
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
// reset() devrait vider le textarea, mais par sécurité :
const notesTextArea = document.getElementById('book-notes');
if (notesTextArea) notesTextArea.value = '';
    const formTitle = document.getElementById('form-title');
    if(formTitle) formTitle.textContent = "Ajouter un nouveau livre";

    // Réinitialise le select du genre à la première option ("-- Sélectionner --")
    const genreSelect = document.getElementById('book-genre');
    if (genreSelect) genreSelect.selectedIndex = 0; // Remet à la première option

    updateStarInputDisplay(0); // Réinitialise les étoiles visuellement et l'input caché à 0


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
            console.error(`Erreur lors de la tentative <span class="math-inline">\{attempt\}/</span>{maxAttempts}:`, error); // Log l'erreur (important pour le débogage)
        
            // Est-ce la dernière tentative ?
            if (attempt === maxAttempts) {
                // Oui, affiche l'erreur finale appropriée
                if (error.message === "Aucun livre trouvé pour cet ISBN.") {
                  displayError("Aucun livre trouvé pour cet ISBN après plusieurs tentatives.");
                } else {
                  // Pour toutes les autres erreurs lors de la dernière tentative (y compris 503 persistant)
                  displayError("Impossible de récupérer les informations du livre après plusieurs tentatives.");
                }
                return null; // Échec final après toutes les tentatives
            }
          
        } // Fin du catch
        
    // ... (fin de la boucle while) ...
    // Si la boucle se termine sans succès (maxAttempts atteint sans réponse OK)
    // On affiche une erreur générique si ce n'était pas déjà fait dans le catch
    // Normalement, le catch gère déjà ça. Mais par sécurité :
     if(attempt === maxAttempts) {
       displayError("Impossible de récupérer les informations du livre après plusieurs tentatives.");
     }
    }
    return null; // Retourne null si toutes les tentatives échouent
}


async function searchBooksAPI(query) {
    if (!query || query.trim() === '') {
        displayError("Veuillez entrer un titre ou des mots-clés pour la recherche.");
        return null; // Retourne null si la requête est vide
    }

    // Limite le nombre de résultats pour ne pas surcharger l'affichage
    const maxResults = 10;
    // Optionnel: Restreindre la langue (ex: 'fr' pour français)
    const langRestrict = 'fr';
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=${maxResults}&langRestrict=${langRestrict}`;

    console.log("Appel API Recherche Titre:", apiUrl); // Pour débogage

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            // Pas besoin de retenter ici comme pour l'ISBN, l'utilisateur peut relancer la recherche
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Données brutes reçues de l'API Titre:", data); // Pour débogage

        // Vérifie s'il y a des résultats et si le tableau 'items' existe
        if (data.totalItems > 0 && data.items) {
            return data.items; // Retourne le tableau des livres trouvés
        } else {
            return []; // Retourne un tableau vide si aucun livre n'est trouvé
        }

    } catch (error) {
        console.error("Erreur lors de la recherche API par titre:", error);
        displayError(error.message || "Erreur lors de la recherche de livres.");
        return null; // Retourne null pour indiquer une erreur
    }
}

function displayAPISearchResults(results) {
    console.log("Entrée dans displayAPISearchResults. Tentative de trouver les éléments...");
    const resultsContainer = document.getElementById('api-search-results');
    console.log("resultsContainer trouvé:", resultsContainer); // Qu'est-ce qui est logué ici ?
    const messageElement = document.getElementById('api-search-message');
    console.log("messageElement trouvé:", messageElement);     // Et ici ?

    if (!resultsContainer || !messageElement) {
        console.error("Éléments nécessaires pour l'affichage des résultats API non trouvés.");
        return;
    }

    // Vide le contenu précédent (y compris le message "Chargement...")
    resultsContainer.innerHTML = '';
    messageElement.textContent = ''; // Vide le message
    messageElement.classList.add('hidden'); // Cache la zone de message par défaut

    // Cas 1 : Erreur ou Aucun Résultat
    if (!results || results.length === 0) {
        messageElement.textContent = 'Aucun livre trouvé pour cette recherche.';
        messageElement.classList.remove('hidden'); // Affiche le message
        resultsContainer.appendChild(messageElement); // Ajoute le message au conteneur
        return; // Sort de la fonction
    }

    // Cas 2 : Des résultats ont été trouvés
    console.log(`Affichage de ${results.length} résultat(s) de l'API.`);
    const resultList = document.createElement('div'); // Utilise une div comme conteneur principal pour les résultats
    resultList.className = 'space-y-3'; // Espace vertical entre les résultats

    results.forEach(item => {
        if (!item.volumeInfo) return; // Ignore les items sans volumeInfo

        const bookInfo = item.volumeInfo;

        // Extraction des données (avec gestion des cas où des infos manquent)
        const title = bookInfo.title || 'Titre inconnu';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Auteur inconnu';
        const coverUrl = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || 'images/default-book-cover.png';
        const publisher = bookInfo.publisher || '';
        const publishedDate = bookInfo.publishedDate || '';
        const pageCount = bookInfo.pageCount || null;
        const genre = bookInfo.categories?.[0] || ''; // Prend la première catégorie

        // Recherche de l'ISBN (13 ou 10)
        let isbn13 = '';
        let isbn10 = '';
        if (bookInfo.industryIdentifiers) {
            isbn13 = bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || '';
            isbn10 = bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || '';
        }
        const isbn = isbn13 || isbn10; // Prend ISBN-13 en priorité

        // Création de l'élément HTML pour ce résultat
        const resultItem = document.createElement('div');
        resultItem.className = 'api-result-item flex items-start p-2 border-b border-gray-200'; // Style pour chaque résultat

        // Image
        const imgElement = document.createElement('img');
        imgElement.src = coverUrl;
        imgElement.alt = `Couverture de ${title}`;
        imgElement.className = 'w-16 h-24 object-contain mr-3 flex-shrink-0'; // Taille fixe pour l'image
        resultItem.appendChild(imgElement);

        // Infos Texte
        const textContainer = document.createElement('div');
        textContainer.className = 'flex-grow';
        textContainer.innerHTML = `
            <h4 class="font-semibold text-etagere">${title}</h4>
            <p class="text-sm text-gray-600">${authors}</p>
            <p class="text-xs text-gray-500">${publisher ? publisher + ' ' : ''}${publishedDate ? '('+publishedDate.substring(0, 4)+')' : ''}</p> `;
        resultItem.appendChild(textContainer);

        // Bouton "Ajouter"
        const addButton = document.createElement('button');
        addButton.textContent = 'Ajouter';
        addButton.className = 'add-from-api-button bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded ml-2 flex-shrink-0';

        // Stocke TOUTES les données nécessaires pour pré-remplir le formulaire
        addButton.dataset.title = title;
        addButton.dataset.author = authors; // Stocke la chaîne d'auteurs jointe
        addButton.dataset.coverUrl = coverUrl;
        addButton.dataset.publisher = publisher;
        addButton.dataset.publishedDate = publishedDate;
        addButton.dataset.pageCount = pageCount || ''; // Stocke chaîne vide si null
        addButton.dataset.genre = genre;
        addButton.dataset.isbn = isbn; // Stocke l'ISBN trouvé

        // L'écouteur de clic sera ajouté via délégation
        resultItem.appendChild(addButton);

        resultList.appendChild(resultItem); // Ajoute cet item à la liste des résultats
    });

    resultsContainer.appendChild(resultList); // Ajoute la liste complète au conteneur principal
}

function updateStarInputDisplay(rating) {
    const container = document.getElementById('rating-input-container');
    if (!container) return;
    const stars = container.querySelectorAll('i'); // Sélectionne toutes les icônes étoile dans le formulaire
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value); // Récupère la valeur de l'étoile (1-5)
        if (starValue <= rating) {
            // Étoile pleine (ou sélectionnée)
            star.classList.remove('far'); // Enlève la classe vide
            star.classList.add('fas', 'text-yellow-400'); // Ajoute pleine et couleur
        } else {
            // Étoile vide
            star.classList.remove('fas', 'text-yellow-400'); // Enlève pleine et couleur
            star.classList.add('far'); // Ajoute vide
        }
    });
     // Met à jour la valeur du champ caché (important !)
     const ratingValueInput = document.getElementById('book-rating-value');
     if(ratingValueInput) ratingValueInput.value = rating;
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
    const notes = document.getElementById('book-notes').value.trim(); // RÉCUPÈRE LES NOTES
    // RÉCUPÈRE LA NOTE depuis l'input caché (Convertit en nombre entier)
    const rating = parseInt(document.getElementById('book-rating-value').value) || 0;


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
                notes: notes, // AJOUTÉ ICI
                isbn: isbn, // Assure que l'ISBN est bien là
                rating
             };
            console.log("bookData après récupération de l'API et fusion:", bookData);
        } else {
            // Si la recherche ISBN échoue MAIS que l'utilisateur a rempli le titre/auteur, on continue en manuel
            if (!title || !author) {
    
                 return; // Sortir si l'ISBN est invalide ET les infos manuelles manquent
            }
             console.log("ISBN non trouvé, ajout manuel avec les données saisies.");
             bookData = { title, author, status, coverUrl, isbn, publisher, publishedDate, pageCount, genre, startDate, endDate, tags, notes, rating };
        }
    } else {
        // Pas d'ISBN fourni OU Modification (bookId existe)
        if (!title || !author) {
            displayError("Veuillez remplir les champs titre et auteur.");
            return;
        }
        // Pour la modification (bookId existe), on utilise les données du formulaire
        // Pour l'ajout manuel (pas d'ISBN), on utilise aussi les données du formulaire
        bookData = { title, author, status, coverUrl, isbn, publisher, publishedDate, pageCount, genre, startDate, endDate, tags, notes, rating };
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
        displaySuccessMessage(bookId ? "Livre modifié avec succès !" : "Livre ajouté avec succès !"); // Message de succès
        fetchBooks(); // Recharge la liste des livres
        resetForm(); // Réinitialise et cache le formulaire
        const bookFormElement = document.getElementById('book-form');
        if(bookFormElement) bookFormElement.classList.add('hidden');

        const searchInputApi = document.getElementById('api-search-input');
        if (searchInputApi) {
            searchInputApi.value = ''; // Vide le champ de recherche
        }


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
            applyFilterOrSort();
        }

         // --- Réinitialise le menu déroulant de TRI --- (AJOUTÉ)
         const sortSelect = document.getElementById('sort-select');
         if (sortSelect) {
             sortSelect.selectedIndex = 0; // Remet à la première option ("-- Non trié --" ou "-- Choisir --")
         }

         applyFilterOrSort();
        // Gère le style actif
        document.querySelectorAll('#menu-etagere li').forEach(item => item.classList.remove('bg-gray-600', 'text-white'));
        tousMesLivresLi.classList.add('bg-gray-600', 'text-white');

         // Gère le style actif pour les BOUTONS DE STATUT
         const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.classList.remove('bg-gray-600', 'text-white');
            if (button.dataset.status === "Tous") {
                button.classList.add('bg-gray-600', 'text-white');
            }
        });
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
                        displaySuccessMessage(`Étagère "${etagere.name}" supprimée.`); // Message de succès
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
            applyFilterOrSort();
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

function applyFilterOrSort() {
    currentPage = 1; // RÉINITIALISE LA PAGE à 1
    fetchBooks();
}


// --------- Initialisation et écouteurs d'événements ---------

document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM prêt. Vérification élément #api-search-message:", document.getElementById('api-search-message'));
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

            applyFilterOrSort(); // Utilise la fonction pour réinitialiser la page
        });
    });
      // --- Tri par titre ---
    const sortSelect = document.getElementById('sort-select');
    if(sortSelect){
        sortSelect.addEventListener('change', applyFilterOrSort);
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
                displaySuccessMessage(`Étagère "${newEtagere.name}" ajoutée.`); // Message de succès
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
    const activeTagDisplay = document.getElementById('active-tag-filter-display');
    const activeTagName = document.getElementById('active-tag-name');

    if (bookListElement && activeTagDisplay && activeTagName) {
        bookListElement.addEventListener('click', (event) => {
            const tagLink = event.target.closest('a.tag-link');
            if (tagLink) {
                event.preventDefault();
                const clickedTag = tagLink.dataset.tag;
                currentTagFilter = clickedTag;
                console.log("Filtre tag activé:", currentTagFilter);

                // AFFICHE la zone du filtre tag actif
                activeTagName.textContent = clickedTag;
                activeTagDisplay.classList.remove('hidden');

                
                applyFilterOrSort(); 

                // Optionnel : Mettre en évidence le filtre actif
                // updateActiveTagDisplay(currentTagFilter);
            }
        });
    } else {
        console.error("Élément(s) manquant(s) pour la gestion du filtre tag actif.");
    }
         
     // --- Gestion du clic sur le bouton d'annulation du filtre TAG --- (BLOC À AJOUTER/VÉRIFIER)
    const clearTagFilterButton = document.getElementById('clear-tag-filter-button');
    const activeTagDisplayElement = document.getElementById('active-tag-filter-display'); // Récupère aussi la div display

    if (clearTagFilterButton && activeTagDisplayElement) { // Vérifie que les deux éléments existent
        clearTagFilterButton.addEventListener('click', () => {
            console.log("Annulation du filtre tag via bouton X.");
            currentTagFilter = null; // Réinitialise SEULEMENT le filtre tag
            activeTagDisplayElement.classList.add('hidden'); // Cache la zone d'affichage
            applyFilterOrSort(); // Appelle la fonction pour réinitialiser la page ET recharger les livres
        });
    } else {
         console.error("Bouton d'annulation du tag ou zone d'affichage introuvable lors de l'initialisation.");
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
                applyFilterOrSort(); // Recharge les livres avec le nouveau filtre
            }, 500); // Attend 500ms après la dernière frappe avant de lancer la recherche
        });
    }
    // --- Écouteurs pour fermer la modale de note 
    const noteModal = document.getElementById('note-modal');
    const noteModalCloseButton = document.getElementById('note-modal-close-button');

    if (noteModalCloseButton) {
        noteModalCloseButton.addEventListener('click', hideNoteModal);
    }

    // Optionnel : Fermer en cliquant en dehors de la modale
    if (noteModal) {
        noteModal.addEventListener('click', (event) => {
            // Si le clic a eu lieu directement sur le fond semi-transparent (le conteneur modal)
            if (event.target === noteModal) {
                hideNoteModal();
            }
        });
    }

    // --- NOUVEAUX Écouteurs pour les boutons de pagination ---
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--; // Décrémente la page
                fetchBooks(); // Recharge les livres pour la nouvelle page
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            // Pas besoin de vérifier la dernière page ici, car updatePaginationControls désactive le bouton
            currentPage++; // Incrémente la page
            fetchBooks(); // Recharge les livres pour la nouvelle page
        });
    }

    // --- Gestion de la Recherche API par Titre ---
    const searchInput = document.getElementById('api-search-input');
    const searchButton = document.getElementById('api-search-button');
    const searchResultsContainer = document.getElementById('api-search-results');
    const searchMessageElement = document.getElementById('api-search-message');

    if (searchButton && searchInput && searchResultsContainer && searchMessageElement) { // Vérifie que tous les éléments existent

        searchButton.addEventListener('click', async () => { // async car on attend searchBooksAPI
            const query = searchInput.value.trim(); // Récupère la recherche de l'utilisateur

            if (!query) {
                displayError("Veuillez entrer un titre à rechercher.");
                searchInput.focus(); // Remet le focus sur le champ
                return;
            }

            // 1. Préparer la zone de résultats (afficher "chargement")
            searchMessageElement.textContent = 'Recherche en cours...'; // Affiche message de chargement
            searchMessageElement.classList.remove('hidden'); // Assure que le message est visible
            searchResultsContainer.classList.remove('hidden'); // Assure que le conteneur est visible

            // 2. Appeler la fonction de recherche API
            const results = await searchBooksAPI(query); // Appelle la fonction que nous avons créée

            // 3. Afficher les résultats (ou un message si aucun résultat/erreur)
            // La fonction displayAPISearchResults s'occupera de masquer/modifier le message
            displayAPISearchResults(results); // Appelle la fonction d'affichage (à créer ensuite)
        });

        // Optionnel : Déclencher la recherche en appuyant sur "Entrée" dans le champ de recherche
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Empêche le comportement par défaut (qui pourrait soumettre un formulaire parent)
                searchButton.click(); // Simule un clic sur le bouton de recherche
            }
        });

    } else {
        console.error("Élément(s) manquant(s) pour la recherche API par titre.");
    }

    // --- Gestion du clic sur le bouton "Ajouter" dans les résultats de recherche API --- (NOUVEAU BLOC)
    const searchResultsContainerElement = document.getElementById('api-search-results'); // Récupère le conteneur à nouveau

    if (searchResultsContainerElement) {
        searchResultsContainerElement.addEventListener('click', async (event) => {
            // Vérifie si l'élément cliqué est un bouton "Ajouter" de l'API
            const addButton = event.target.closest('button.add-from-api-button');

            if (addButton) {
                console.log("Bouton 'Ajouter' d'un résultat API cliqué.");
                event.preventDefault(); // Au cas où ce serait un lien stylé en bouton

                // 1. Récupérer les données stockées dans les attributs data-* du bouton cliqué
                const bookDataFromAPI = {
                    title: addButton.dataset.title || '',
                    author: addButton.dataset.author || '',
                    coverUrl: addButton.dataset.coverUrl || '',
                    publisher: addButton.dataset.publisher || '',
                    publishedDate: addButton.dataset.publishedDate || '',
                    pageCount: addButton.dataset.pageCount || '',
                    genre: addButton.dataset.genre || '',
                    isbn: addButton.dataset.isbn || ''
                    // Note: status, startDate, endDate, tags, notes ne sont pas pré-remplis depuis l'API ici
                };
                console.log("Données récupérées du bouton pour pré-remplissage:", bookDataFromAPI);

                  //  Réinitialiser le formulaire principal
                  resetForm();

                  //  PEUPLER LE DROPDOWN GENRE AVANT DE PRÉ-SÉLECTIONNER (NOUVEAU)
                  await populateGenreDropdown(bookDataFromAPI.genre); // Appelle et attend que le dropdown soit peuplé
                                                                      // Passe le genre de l'API pour essayer de le pré-sélectionner

                // 2. Pré-remplir le formulaire principal (#book-form)
                resetForm(); // Commence par réinitialiser le formulaire (efface aussi l'ID caché)
                document.getElementById('book-title').value = bookDataFromAPI.title;
                document.getElementById('book-author').value = bookDataFromAPI.author;
                document.getElementById('book-coverUrl').value = bookDataFromAPI.coverUrl;
                document.getElementById('book-publisher').value = bookDataFromAPI.publisher;
                document.getElementById('book-publishedDate').value = bookDataFromAPI.publishedDate;
                document.getElementById('book-pageCount').value = bookDataFromAPI.pageCount;
                document.getElementById('book-genre').value = bookDataFromAPI.genre;
                document.getElementById('book-isbn').value = bookDataFromAPI.isbn;
                // Laisse status, startDate, endDate, tags, notes vides pour l'utilisateur

                // 3. Modifier le titre du formulaire (optionnel)
                 const formTitle = document.getElementById('form-title');
                 if(formTitle) formTitle.textContent = "Vérifier et Ajouter le livre";

                // 4. Afficher le formulaire principal
                const bookForm = document.getElementById('book-form');
                if (bookForm) bookForm.classList.remove('hidden');
                 const addBookButtonMain = document.getElementById("add-book-button");
                 if (addBookButtonMain) addBookButtonMain.classList.add("hidden"); // Cache le bouton principal "Ajouter"

                // 5. Cacher/Vider les résultats de la recherche API
                searchResultsContainerElement.classList.add('hidden');
                searchResultsContainerElement.innerHTML = ''; // Vide le contenu

                // 6. Faire défiler vers le formulaire (optionnel)
                if (bookForm) {
                    window.scrollTo({ top: bookForm.offsetTop - 20, behavior: 'smooth' });
                }
            }
        });
    }

    // --- Gestion des étoiles interactives dans le formulaire ---
    const ratingContainer = document.getElementById('rating-input-container');
    const ratingValueInput = document.getElementById('book-rating-value'); // L'input caché
    const clearRatingButton = document.getElementById('clear-rating-button');

    if (ratingContainer && ratingValueInput) {
        const stars = ratingContainer.querySelectorAll('i'); // Toutes les icônes étoile

        // Effet au survol
        ratingContainer.addEventListener('mouseover', (event) => {
            if (event.target.tagName === 'I') {
                const hoverValue = parseInt(event.target.dataset.value);
                stars.forEach(star => {
                    const starValue = parseInt(star.dataset.value);
                    if (starValue <= hoverValue) {
                        star.classList.remove('far');
                        star.classList.add('fas', 'text-yellow-400');
                    } else {
                        star.classList.remove('fas', 'text-yellow-400');
                        star.classList.add('far');
                    }
                });
            }
        });

        // Réinitialiser au "mouseout" pour afficher la note réellement sélectionnée
        ratingContainer.addEventListener('mouseout', () => {
            const currentRating = parseInt(ratingValueInput.value) || 0;
            updateStarInputDisplay(currentRating); // Réaffiche la note sélectionnée
        });

        // Sélection au clic
        ratingContainer.addEventListener('click', (event) => {
            if (event.target.tagName === 'I') {
                const clickedValue = parseInt(event.target.dataset.value);
                ratingValueInput.value = clickedValue; // Met à jour la valeur cachée
                updateStarInputDisplay(clickedValue); // Met à jour l'affichage permanent
            }
        });

         // Bouton Effacer la note
         if(clearRatingButton) {
             clearRatingButton.addEventListener('click', () => {
                 ratingValueInput.value = 0; // Remet la valeur cachée à 0
                 updateStarInputDisplay(0); // Met à jour l'affichage (toutes vides)
             });
         }

    } else {
        console.error("Conteneur de notation ou input caché introuvable.");
    }

}); // FIN de DOMContentLoaded