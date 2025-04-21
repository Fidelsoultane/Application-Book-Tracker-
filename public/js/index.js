

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
    // --- Conteneur Principal de la Carte ---
    // Hauteur fixe (ex: h-[30rem] = 480px). Ajustez cette valeur si nécessaire !
    // overflow-hidden sur la carte principale pour s'assurer que rien ne dépasse globalement.
    const card = createElementWithClasses('div', 'book-card w-64 h-[30rem] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl relative');
    card.dataset.bookId = book._id;

    // --- Image de Couverture ---
    const imgContainer = createElementWithClasses('div', 'h-48 w-full flex items-center justify-center bg-gray-100 flex-shrink-0'); // Hauteur réduite à h-48 peut-être ?
    const img = createElementWithClasses('img', 'book-cover object-contain h-full w-full');
    img.src = book.coverUrl || 'images/default-book-cover.png';
    img.alt = `Couverture de ${book.title}`;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    // --- Conteneur pour le Contenu Textuel (qui peut défiler) ---
    const content = createElementWithClasses('div', 'p-4 flex-grow flex flex-col justify-between overflow-y-auto');


    // --- Section Infos Principales ---
    const textInfo = document.createElement('div'); // Ce conteneur ne scrollera pas directement

    // Titre (SANS truncate)
    const title = createElementWithClasses('h3', 'text-lg font-bold text-etagere mb-1');
    title.textContent = book.title || 'Titre inconnu';
    textInfo.appendChild(title);

    // Auteur (SANS truncate)
    const author = createElementWithClasses('p', 'text-sm text-gray-700 mb-2');
    author.textContent = Array.isArray(book.author) ? book.author.join(', ') : (book.author || 'Auteur inconnu');
    textInfo.appendChild(author);

    // Statut et Indicateur de Notes
    const statusContainer = createElementWithClasses('div', 'flex items-center text-xs text-accent mb-1');
    const statusText = document.createElement('span');
    statusText.textContent = `Statut : ${book.status || 'Non défini'}`;
    statusContainer.appendChild(statusText);
    if (book.notes && book.notes.trim() !== '') {
        const noteIndicatorContainer = createElementWithClasses('span', 'ml-2');
        const noteIndicatorIcon = createElementWithClasses('i', 'note-indicator-icon far fa-sticky-note text-gray-500 cursor-pointer hover:text-blue-600');
        noteIndicatorIcon.title = "Voir les notes";
        noteIndicatorIcon.addEventListener('click', (e) => { e.stopPropagation(); showNoteModal(book); });
        noteIndicatorContainer.appendChild(noteIndicatorIcon);
        statusContainer.appendChild(noteIndicatorContainer);
    }
    textInfo.appendChild(statusContainer);

    // Genre
    if (book.genre) {
        const genre = createElementWithClasses('p', 'text-xs text-gray-500 mb-2');
        genre.textContent = `Genre : ${book.genre}`;
        textInfo.appendChild(genre);
    }

     // Notation (Étoiles Statiques)
     if (book.rating !== undefined && book.rating !== null && book.rating > 0) {
        const ratingContainer = createElementWithClasses('div', 'text-yellow-400 mt-1 mb-2');
        ratingContainer.title = `Note : ${book.rating} / 5`;
        for (let i = 1; i <= 5; i++) {
            const starIcon = createElementWithClasses('i', 'fa-star mr-0.5');
            if (i <= book.rating) starIcon.classList.add('fas');
            else starIcon.classList.add('far');
            ratingContainer.appendChild(starIcon);
        }
        textInfo.appendChild(ratingContainer);
    }

    content.appendChild(textInfo); // Ajoute le bloc d'infos principales AU CONTENEUR SCROLLABLE

    // --- Section Infos Secondaires & Tags ---
    const secondaryInfo = document.createElement('div');
    // Pas besoin de mt-auto ici car le conteneur parent scroll
    secondaryInfo.className = 'border-t border-gray-200 pt-2 mt-2'; // Ajoute une marge top manuellement

    // Éditeur, Date Pub, Pages, ISBN (SANS truncate)
    if (book.publisher) {
        const publisher = createElementWithClasses('p', 'text-xs text-gray-500');
        publisher.textContent = `Éditeur: ${book.publisher}`;
        secondaryInfo.appendChild(publisher);
    }
    if (book.publishedDate) {
        const publishedDate = createElementWithClasses('p', 'text-xs text-gray-500');
        publishedDate.textContent = `Publication: ${book.publishedDate}`;
        secondaryInfo.appendChild(publishedDate);
    }
     if (book.pageCount) {
        const pageCount = createElementWithClasses('p', 'text-xs text-gray-500');
        pageCount.textContent = `Pages: ${book.pageCount}`;
        secondaryInfo.appendChild(pageCount);
    }
    if (book.isbn) {
        const isbn = createElementWithClasses('p', 'text-xs text-gray-500');
        isbn.textContent = `ISBN: ${book.isbn}`;
        secondaryInfo.appendChild(isbn);
    }

    // Dates de lecture
    if (book.startDate) {
        const startDate = createElementWithClasses('p', 'text-xs text-gray-500 mt-1');
        startDate.textContent = `Début : ${new Date(book.startDate).toLocaleDateString()}`;
        secondaryInfo.appendChild(startDate);
    }
    if (book.endDate) {
        const endDate = createElementWithClasses('p', 'text-xs text-gray-500');
        endDate.textContent = `Fin : ${new Date(book.endDate).toLocaleDateString()}`;
        secondaryInfo.appendChild(endDate);
    }

    // Tags
    if (book.tags && book.tags.length > 0) {
        const tagsContainer = createElementWithClasses('div', 'mt-2 flex flex-wrap');
        book.tags.forEach(tag => {
            const tagElement = createElementWithClasses('a', 'tag-link bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs mr-1 mb-1 cursor-pointer hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400');
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag;
            tagElement.href = "#";
            tagsContainer.appendChild(tagElement);
        });
        secondaryInfo.appendChild(tagsContainer);
    }

    content.appendChild(secondaryInfo); // Ajoute le bloc d'infos secondaires/tags AU CONTENEUR SCROLLABLE
    card.appendChild(content); // Ajoute le conteneur SCROLLABLE à la carte

    // --- Boutons d'Action (positionnés absolument par rapport à 'card') ---
    const actionsContainer = createElementWithClasses('div', 'absolute top-2 right-2 flex space-x-1'); // Reste absolute
    const editButton = createElementWithClasses('button', 'edit-button bg-blue-500 hover:bg-blue-700 text-white font-bold p-1 rounded text-xs leading-none');
    editButton.innerHTML = '<i class="fas fa-pencil-alt w-3 h-3"></i>';
    editButton.title = "Modifier";
    editButton.addEventListener('click', (e) => { e.stopPropagation(); editBook(book); });
    actionsContainer.appendChild(editButton);

    const deleteButton = createElementWithClasses('button', 'delete-button bg-red-500 hover:bg-red-700 text-white font-bold p-1 rounded text-xs leading-none');
    deleteButton.innerHTML = '<i class="fas fa-trash w-3 h-3"></i>';
    deleteButton.title = "Supprimer";
    deleteButton.addEventListener('click', (e) => {
         e.stopPropagation();
         if (confirm(`Êtes-vous sûr de vouloir supprimer "${book.title}" ?`)) { deleteBook(book._id); }
    });
    actionsContainer.appendChild(deleteButton);

    card.appendChild(actionsContainer); // Ajoute les boutons (toujours en absolu)

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
    console.log("--- Debug displayAPISearchResults ---"); // Log d'entrée

    const resultsContainer = document.getElementById('api-search-results');
    if (!resultsContainer) {
        console.error("Conteneur #api-search-results non trouvé ! Impossible d'afficher les résultats.");
        return; // Sortie si le conteneur principal manque
    }

    // Vide seulement les anciens items de résultat (ceux avec la classe .api-result-item)
    const previousResultItems = resultsContainer.querySelectorAll('.api-result-item');
    console.log(`Display Results: Nettoyage de ${previousResultItems.length} ancien(s) item(s).`);
    previousResultItems.forEach(item => item.remove());

    // Récupère ou crée l'élément message à l'intérieur du conteneur
    let messageElement = resultsContainer.querySelector('#api-search-message'); // Cherche à l'intérieur
    if (!messageElement) {
        console.warn("#api-search-message non trouvé, tentative de recréation.");
        messageElement = document.createElement('p');
        messageElement.id = 'api-search-message';
        messageElement.className = 'text-center text-gray-500'; // Applique les classes nécessaires
        // Ajoute l'élément message au début du conteneur s'il a été recréé
        resultsContainer.insertBefore(messageElement, resultsContainer.firstChild);
    }
    console.log("Display Results: Élément message trouvé ou créé:", messageElement);

    // Assure que le conteneur est visible car on va y mettre quelque chose
    resultsContainer.classList.remove('hidden');
    console.log("Display Results: Container classList après remove('hidden'):", resultsContainer.classList.toString());

    // Cas 1 : Erreur ou Aucun Résultat
    if (!results || results.length === 0) {
        messageElement.textContent = 'Aucun livre trouvé pour cette recherche.';
        messageElement.classList.remove('hidden'); // Affiche le message
        console.log("Display Results: Aucun résultat trouvé, message affiché.");
        // Assure qu'une éventuelle liste précédente (resultList div) est enlevée
        const oldResultList = resultsContainer.querySelector('.space-y-3'); // Trouve le conteneur de la liste précédente
        if(oldResultList) oldResultList.remove();
        return; // Sort de la fonction
    }

    // Cas 2 : Des résultats ont été trouvés
    console.log(`Display Results: Préparation affichage ${results.length} résultat(s).`);
    messageElement.textContent = ''; // Vide le message
    messageElement.classList.add('hidden'); // Cache le message car on a des résultats

    // Crée le conteneur pour la nouvelle liste de résultats
    const resultList = document.createElement('div');
    resultList.className = 'space-y-3'; // Pour l'espacement vertical des items

    // Boucle sur les résultats reçus de l'API
    results.forEach((item, index) => {
        if (!item.volumeInfo) {
             console.warn(`Display Results: Item ${index + 1} ignoré (pas de volumeInfo)`);
             return; // Ignore cet item s'il manque volumeInfo
        }
        const bookInfo = item.volumeInfo;

        // Extraction des données (avec gestion des cas où des infos manquent)
        const title = bookInfo.title || 'Titre inconnu';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Auteur inconnu';
        const coverUrl = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || 'images/default-book-cover.png'; // Image par défaut locale
        const publisher = bookInfo.publisher || '';
        const publishedDate = bookInfo.publishedDate || '';
        const pageCount = bookInfo.pageCount || ''; // Mettre chaîne vide plutôt que null pour dataset
        const genre = bookInfo.categories?.[0] || ''; // Prend la première catégorie
        let isbn13 = '';
        let isbn10 = '';
        if (bookInfo.industryIdentifiers) {
            isbn13 = bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_13')?.identifier || '';
            isbn10 = bookInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier || '';
        }
        const isbn = isbn13 || isbn10;

        // Création de l'élément HTML pour ce résultat
        const resultItem = document.createElement('div');
        // Important : ajouter la classe .api-result-item pour pouvoir les supprimer au prochain affichage
        resultItem.className = 'api-result-item flex items-start p-2 border-b border-gray-200';

        console.log(`Display Results: Création item ${index + 1} - Titre: ${title}`); // LOG CRÉATION ITEM

        // Image
        const imgElement = document.createElement('img');
        imgElement.src = coverUrl;
        imgElement.alt = `Couverture de ${title}`;
        imgElement.className = 'w-16 h-24 object-contain mr-3 flex-shrink-0';
        resultItem.appendChild(imgElement);

        // Infos Texte
        const textContainer = document.createElement('div');
        textContainer.className = 'flex-grow';
        // Utilisation de textContent pour éviter les problèmes d'injection HTML simple
        const titleH4 = document.createElement('h4');
        titleH4.className = 'font-semibold text-etagere';
        titleH4.textContent = title;
        textContainer.appendChild(titleH4);

        const authorP = document.createElement('p');
        authorP.className = 'text-sm text-gray-600';
        authorP.textContent = authors;
        textContainer.appendChild(authorP);

        const pubP = document.createElement('p');
        pubP.className = 'text-xs text-gray-500';
        pubP.textContent = `${publisher ? publisher + ' ' : ''}${publishedDate ? '('+publishedDate.substring(0, 4)+')' : ''}`;
        textContainer.appendChild(pubP);

        resultItem.appendChild(textContainer);

        // Bouton "Ajouter"
        const addButton = document.createElement('button');
        addButton.textContent = 'Ajouter';
        addButton.className = 'add-from-api-button bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded ml-2 flex-shrink-0';

        // Stocke TOUTES les données nécessaires dans le dataset
        addButton.dataset.title = title;
        addButton.dataset.author = authors;
        addButton.dataset.coverUrl = coverUrl;
        addButton.dataset.publisher = publisher;
        addButton.dataset.publishedDate = publishedDate;
        addButton.dataset.pageCount = pageCount; // pageCount peut être ''
        addButton.dataset.genre = genre;
        addButton.dataset.isbn = isbn;

        resultItem.appendChild(addButton); // Ajoute le bouton à l'item

        resultList.appendChild(resultItem); // Ajoute cet item à la liste des résultats
    });

    console.log("Display Results: Fin de la boucle. resultList contient:", resultList.childNodes.length, "éléments enfants"); // LOG FIN BOUCLE
    resultsContainer.appendChild(resultList); // Ajoute la nouvelle liste (div) au conteneur principal
    console.log("Display Results: resultList ajouté au container."); // LOG FINAL APPEND
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

          // --- AJOUT : Masquer et vider les résultats de recherche API ---
        const searchResultsContainer = document.getElementById('api-search-results');
        if (searchResultsContainer) {
            searchResultsContainer.classList.add('hidden');
            searchResultsContainer.innerHTML = ''; // Vide aussi le contenu
        }
        const searchInputApi = document.getElementById('api-search-input');
        if (searchInputApi) { // Optionnel : vider aussi le champ de recherche API
             searchInputApi.value = '';
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
    const searchInput = document.getElementById('api-search-input'); // Récupéré à nouveau pour clarté
    const searchButton = document.getElementById('api-search-button');
    const searchResultsContainer = document.getElementById('api-search-results'); // Conteneur principal
    const searchMessageElement = document.getElementById('api-search-message'); // Élément pour messages

    if (searchButton && searchInput && searchResultsContainer && searchMessageElement) {
        searchButton.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) { /* ... gestion erreur ... */ return; }

            // 1. Préparer la zone de résultats : AFFICHER "chargement" dans l'élément message
            searchResultsContainer.innerHTML = ''; // Vide anciens résultats/messages DANS le conteneur
            // Recrée ou récupère l'élément message à l'intérieur
            let msgElem = document.getElementById('api-search-message');
            if (!msgElem) {
                 msgElem = document.createElement('p');
                 msgElem.id = 'api-search-message';
                 msgElem.className = 'text-center text-gray-500';
                 searchResultsContainer.appendChild(msgElem);
            }
            msgElem.textContent = 'Recherche en cours...';
            msgElem.classList.remove('hidden');
            searchResultsContainer.classList.remove('hidden'); // REND LE CONTENEUR VISIBLE ICI

            console.log("Search Click: Container rendu visible, affichage chargement."); // LOG DEBUG

            // 2. Appeler la fonction de recherche API
            const results = await searchBooksAPI(query);

            // 3. Afficher les résultats (displayAPISearchResults gérera la visibilité finale)
            displayAPISearchResults(results);
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

    // --- Gestion du VIDAGE du champ de recherche API titre --- (NOUVEAU)
    const searchInputForClear = document.getElementById('api-search-input'); // Récupère l'input à nouveau si besoin
    const searchResultsContainerForClear = document.getElementById('api-search-results'); // Récupère le conteneur

    if (searchInputForClear && searchResultsContainerForClear) {
        searchInputForClear.addEventListener('input', () => {
            // Si l'utilisateur efface le champ, on cache et vide les résultats
            if (searchInputForClear.value.trim() === '') {
                searchResultsContainerForClear.classList.add('hidden');
                searchResultsContainerForClear.innerHTML = ''; // Vide le contenu
                 // Optionnel: Vider aussi le message P
                 const msgElem = document.getElementById('api-search-message');
                 if(msgElem) msgElem.textContent = '';

                 console.log("Champ de recherche API vidé, résultats cachés."); // Log débogage
            }
        });
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