
/// index.js - Version Complète (Mai 2025)

// --------- Fonctions Utilitaires de Base ---------
function createElementWithClasses(tag, classNames) {
    const element = document.createElement(tag);
    if (classNames) element.className = classNames; // Vérifie si classNames est fourni
    return element;
}

function showLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.classList.remove('hidden');
}

function hideLoading() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.classList.add('hidden');
}

function displayError(message) {
    Toastify({
        text: message || "Une erreur est survenue.",
        duration: 3000, close: true, gravity: "top", position: "right", stopOnFocus: true,
        style: { background: "linear-gradient(to right, #FF5F6D, #FFC371)" },
    }).showToast();
}

function displaySuccessMessage(message) {
    Toastify({
        text: message || "Opération réussie.",
        duration: 2000, close: true, gravity: "top", position: "right", stopOnFocus: true,
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
    }).showToast();
}

// --------- Gestion de l'Authentification (Headers) ---------
function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('authToken');
    console.log('getAuthHeaders CALLED. Token from localStorage:', token);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('getAuthHeaders RETURNING headers:', headers);
    return headers;
}

// --------- Création des Cartes de Livre ---------
function createBookCard(book) {
    console.log(`CREATEBOOKCARD - Appel pour livre: ${book ? book.title : 'Livre UNDEFINED'}, Statut: ${book ? book.status : 'N/A'}, PageCount: ${book ? book.pageCount : 'N/A'}, CurrentPage: ${book ? book.currentPage : 'N/A'}`);

    const card = createElementWithClasses('div', 'book-card w-64 h-[30rem] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl relative');
    card.dataset.bookId = book._id;

    const imgContainer = createElementWithClasses('div', 'h-48 w-full flex items-center justify-center bg-gray-100 flex-shrink-0');
    const img = createElementWithClasses('img', 'book-cover object-contain h-full w-full');
    let coverUrlForCard = book.coverUrl || 'images/default-book-cover.png';
    if (coverUrlForCard && coverUrlForCard.startsWith('http://')) { // Correction Mixed Content
        coverUrlForCard = coverUrlForCard.replace(/^http:\/\//i, 'https://');
    }
    img.src = coverUrlForCard;
    img.alt = `Couverture de ${book.title || 'Titre inconnu'}`;
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const content = createElementWithClasses('div', 'p-4 flex-grow flex flex-col justify-between overflow-y-auto');
    const textInfo = document.createElement('div');

    const title = createElementWithClasses('h3', 'text-lg font-bold text-etagere mb-1');
    title.textContent = book.title || 'Titre inconnu';
    textInfo.appendChild(title);

    const author = createElementWithClasses('p', 'text-sm text-gray-700 mb-2');
    author.textContent = Array.isArray(book.author) ? book.author.join(', ') : (book.author || 'Auteur inconnu');
    textInfo.appendChild(author);

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

    if (book.genre) {
        const genre = createElementWithClasses('p', 'text-xs text-gray-500 mb-2');
        genre.textContent = `Genre : ${book.genre}`;
        textInfo.appendChild(genre);
    }

    if (book.rating !== undefined && book.rating !== null && book.rating > 0) {
        const ratingContainer = createElementWithClasses('div', 'text-yellow-400 mt-1 mb-2');
        ratingContainer.title = `Note : ${book.rating} / 5`;
        for (let i = 1; i <= 5; i++) {
            const starIcon = createElementWithClasses('i', 'fa-star mr-0.5');
            starIcon.classList.toggle('fas', i <= book.rating);
            starIcon.classList.toggle('far', i > book.rating);
            ratingContainer.appendChild(starIcon);
        }
        textInfo.appendChild(ratingContainer);
    }

    // --- Affichage de la Progression ---
    if (book.status === 'En cours' && book.pageCount && parseInt(book.pageCount, 10) > 0) {
        console.log(`[${book.title}] - CONDITION VRAIE: Affichage progression et boutons (Statut: ${book.status}, PageCount: ${book.pageCount})`);
        const progressOuterContainer = createElementWithClasses('div', 'mt-2');

        const progressTextContainer = createElementWithClasses('div', 'text-xs text-gray-600');
        const currentPageForDisplay = book.currentPage || 0;
        const totalPagesForDisplay = parseInt(book.pageCount, 10) || 0;
        const percentageForDisplay = totalPagesForDisplay > 0 ? Math.round((currentPageForDisplay / totalPagesForDisplay) * 100) : 0;
        progressTextContainer.textContent = `Progression : ${currentPageForDisplay} / ${totalPagesForDisplay} pages (${percentageForDisplay}%)`;
        progressOuterContainer.appendChild(progressTextContainer);
        console.log(`[${book.title}] - Texte de progression ajouté: ${progressTextContainer.textContent}`);

        const progressBarContainer = createElementWithClasses('div', 'w-full bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700');
        const progressBar = createElementWithClasses('div', 'bg-blue-600 h-1.5 rounded-full dark:bg-blue-500');
        progressBar.style.width = `${percentageForDisplay}%`;
        progressBarContainer.appendChild(progressBar);
        progressOuterContainer.appendChild(progressBarContainer);
        console.log(`[${book.title}] - Barre de progression ajoutée (largeur: ${percentageForDisplay}%).`);

        const progressActions = createElementWithClasses('div', 'mt-1 flex items-center space-x-2');
        console.log(`[${book.title}] - Création du conteneur 'progressActions'.`);

        const currentBookPageForButtons = book.currentPage || 0;
        const totalBookPagesForButtons = parseInt(book.pageCount, 10) || 0;

        if (totalBookPagesForButtons > 0) {
            const incrementPageButton = createElementWithClasses('button', 'increment-page-btn text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded');
            incrementPageButton.textContent = "+1 Page";
            incrementPageButton.title = "Augmenter la page actuelle de 1";
            incrementPageButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log(`Clic +1 Page pour: ${book.title}. Page actuelle avant clic: ${currentBookPageForButtons}, Total: ${totalBookPagesForButtons}`);
                if (currentBookPageForButtons < totalBookPagesForButtons) {
                    await updateBookProgress(book, currentBookPageForButtons + 1, totalBookPagesForButtons);
                } else {
                    displayError("Vous êtes déjà à la dernière page !");
                }
            });
            progressActions.appendChild(incrementPageButton);
            console.log(`[${book.title}] - Bouton '+1 Page' créé et ajouté à 'progressActions'.`);
        } else {
            console.log(`[${book.title}] - Bouton '+1 Page' NON créé (totalBookPagesForButtons <= 0).`);
        }

        if (currentBookPageForButtons < totalBookPagesForButtons && totalBookPagesForButtons > 0) {
            console.log(`[${book.title}] - Condition pour bouton 'Terminé' VRAIE (page ${currentBookPageForButtons}/${totalBookPagesForButtons}). Création...`);
            const markAsReadButton = createElementWithClasses('button', 'mark-as-read-card-btn text-xs bg-green-100 hover:bg-green-200 text-green-700 px-1.5 py-0.5 rounded');
            markAsReadButton.textContent = "Terminé";
            markAsReadButton.title = "Marquer comme terminé";
            markAsReadButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log(`Clic 'Terminé' pour: ${book.title}`);
                await updateBookProgress(book, totalBookPagesForButtons, totalBookPagesForButtons, 'Terminé');
            });
            progressActions.appendChild(markAsReadButton);
            console.log(`[${book.title}] - Bouton 'Terminé' créé et ajouté à 'progressActions'.`);
        } else {
             console.log(`[${book.title}] - Bouton 'Terminé' NON créé (condition fausse : page ${currentBookPageForButtons}/${totalBookPagesForButtons}).`);
        }

        if (progressActions.hasChildNodes()) {
            progressOuterContainer.appendChild(progressActions);
            console.log(`[${book.title}] - 'progressActions' (avec enfants) AJOUTÉ à 'progressOuterContainer'.`);
        } else {
            console.log(`[${book.title}] - 'progressActions' est VIDE, non ajouté à 'progressOuterContainer'.`);
        }

        // Insertion de tout le bloc de progression (progressOuterContainer) dans textInfo
        if (textInfo) { // textInfo est défini plus haut dans cette fonction
            textInfo.appendChild(progressOuterContainer);
            console.log(`[${book.title}] - 'progressOuterContainer' ajouté à la fin de 'textInfo'.`);
        } else { // Fallback très improbable si textInfo n'existait pas
            card.appendChild(progressOuterContainer);
            console.warn(`[${book.title}] - 'textInfo' non trouvé, 'progressOuterContainer' ajouté directement à la carte (Fallback).`);
        }
    } else {
        console.log(`[${book.title}] - PAS d'affichage de progression/boutons (Condition Principale FAUSSE: Statut: ${book.status}, PageCount: ${book.pageCount})`);
    }
    content.appendChild(textInfo);

    const secondaryInfo = document.createElement('div');
    secondaryInfo.className = 'border-t border-gray-200 pt-2 mt-2';
    if (book.publisher) {
        const publisherEl = createElementWithClasses('p', 'text-xs text-gray-500');
        publisherEl.textContent = `Éditeur: ${book.publisher}`;
        secondaryInfo.appendChild(publisherEl);
    }
    if (book.publishedDate) {
        const publishedDateEl = createElementWithClasses('p', 'text-xs text-gray-500');
        publishedDateEl.textContent = `Publication: ${book.publishedDate}`;
        secondaryInfo.appendChild(publishedDateEl);
    }
    if (book.pageCount) { // Affiche pageCount ici même si utilisé pour la progression
        const pageCountEl = createElementWithClasses('p', 'text-xs text-gray-500');
        pageCountEl.textContent = `Pages: ${book.pageCount}`;
        secondaryInfo.appendChild(pageCountEl);
    }
    if (book.isbn) {
        const isbnEl = createElementWithClasses('p', 'text-xs text-gray-500');
        isbnEl.textContent = `ISBN: ${book.isbn}`;
        secondaryInfo.appendChild(isbnEl);
    }
    if (book.startDate) {
        const startDateEl = createElementWithClasses('p', 'text-xs text-gray-500 mt-1');
        startDateEl.textContent = `Début : ${new Date(book.startDate).toLocaleDateString()}`;
        secondaryInfo.appendChild(startDateEl);
    }
    if (book.endDate) {
        const endDateEl = createElementWithClasses('p', 'text-xs text-gray-500');
        endDateEl.textContent = `Fin : ${new Date(book.endDate).toLocaleDateString()}`;
        secondaryInfo.appendChild(endDateEl);
    }
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
    content.appendChild(secondaryInfo);
    card.appendChild(content);

    const actionsContainer = createElementWithClasses('div', 'absolute top-2 right-2 flex space-x-1');
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
    card.appendChild(actionsContainer);

    return card;
}

// --- Fonctions Modale de Note ---
function showNoteModal(book) {
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('note-modal-title');
    const modalContent = document.getElementById('note-modal-content');
    if (modal && modalTitle && modalContent) {
        modalTitle.textContent = `Notes pour : ${book.title}`;
        modalContent.textContent = book.notes;
        modal.classList.remove('hidden');
    } else { console.error("Éléments de la modale de note introuvables !"); }
}

function hideNoteModal() {
    const modal = document.getElementById('note-modal');
    if (modal) modal.classList.add('hidden');
}


// --------- Gestion des Livres (API, Logique d'Affichage) ---------
let currentStatusFilter = "Tous";
let currentGenreFilter = "Tous";
let currentTagFilter = null;
let currentPublisherFilter = "";
let currentPage = 1;
const booksPerPage = 12;

async function fetchBooks() {
    try {
        showLoading();

        let url = '/api/books/?'; // Commence par '?'

        // --- Ajout des paramètres de pagination --- (VÉRIFIEZ CES LIGNES)
        url += `page=${currentPage}&limit=${booksPerPage}&`;
        if (currentStatusFilter !== "Tous") { url += `status=${encodeURIComponent(currentStatusFilter)}&`; }
        if (currentGenreFilter !== "Tous") { url += `genre=${encodeURIComponent(currentGenreFilter)}&`; }
        if (currentTagFilter) { url += `tags=${encodeURIComponent(currentTagFilter)}&`; }
        if (currentPublisherFilter) { url += `publisher=${encodeURIComponent(currentPublisherFilter)}&`; }
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) { url += `sortBy=${sortSelect.value}&`; }
        if (url.endsWith('&')) { url = url.slice(0, -1); }

        console.log("Fetching URL:", url); // Doit maintenant inclure page et limit

        const response = await fetch(url, { 
            method: 'GET', 
            headers: getAuthHeaders() 
        });

        if (!response.ok) {
            if (response.status === 401) {
                displayError("Session expirée ou non autorisé. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken'); localStorage.removeItem('userInfo');
                updateAuthStateUI(); displayBooks([]); updatePaginationControls(0);
                const menuEtagere = document.getElementById('menu-etagere');
                if (menuEtagere) menuEtagere.innerHTML = '';
                return; // Arrête le traitement
            }
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        displayBooks(data.books);
        updatePaginationControls(data.totalBooks);
    } catch (error) {
        console.error("Erreur DANS fetchBooks:", error);
        if (!error.message || !error.message.includes("Session expirée")) {
             displayError(error.message || "Impossible de récupérer les livres.");
        }
        displayBooks([]); updatePaginationControls(0);
    } finally {
        hideLoading();
    }
}

function updatePaginationControls(totalBooks) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    if (!prevButton || !nextButton || !pageInfo) { console.error("Éléments de pagination non trouvés"); return; }
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages > 0 ? totalPages : 1}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    const controlsContainer = document.getElementById('pagination-controls');
    if (controlsContainer) controlsContainer.style.display = totalPages <= 1 ? 'none' : 'flex';
}

function displayBooks(books) {
    const bookList = document.getElementById('book-list');
    if (!bookList) { console.error("Élément #book-list non trouvé!"); return; }
    bookList.innerHTML = '';
    if (!books || books.length === 0) {
        bookList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Aucun livre ne correspond à vos critères.</p>';
        updatePaginationControls(0);
        return;
    }
    books.forEach(book => {
        const bookCard = createBookCard(book);
        bookList.appendChild(bookCard);
    });
}

async function deleteBook(bookId) {
    // La confirmation est dans l'écouteur de createBookCard
    try {
        const response = await fetch(`/api/books/${bookId}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (!response.ok) {
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {const errorData = await response.json(); errorMsg = errorData.message || errorMsg;} catch(e){}
            throw new Error(errorMsg);
        }
        displaySuccessMessage("Livre supprimé avec succès !");
        fetchBooks();
    } catch (error) {
        console.error("Erreur lors de la suppression du livre:", error);
        displayError(error.message || "Impossible de supprimer le livre.");
    }
}

async function editBook(book) {
    console.log("Ouverture formulaire pour modification du livre:", book.title);
    resetForm();
    await populateGenreDropdown(book.genre || '');
    document.getElementById('book-id').value = book._id;
    document.getElementById('book-title').value = book.title || '';
    document.getElementById('book-author').value = Array.isArray(book.author) ? book.author.join(', ') : (book.author || '');
    document.getElementById('book-isbn').value = book.isbn || '';
    document.getElementById('book-status').value = book.status || 'À lire';
    document.getElementById('book-pageCount').value = book.pageCount || '';
    document.getElementById('book-currentPage').value = book.currentPage || '0';
    document.getElementById('book-genre').value = book.genre || '';
    document.getElementById('book-publisher').value = book.publisher || '';
    document.getElementById('book-publishedDate').value = book.publishedDate || '';
    // document.getElementById('book-pageCount').value = book.pageCount || ''; // Redondant
    document.getElementById('book-tags').value = book.tags ? book.tags.join(', ') : '';
    document.getElementById('book-startDate').value = book.startDate ? new Date(book.startDate).toISOString().split('T')[0] : '';
    document.getElementById('book-endDate').value = book.endDate ? new Date(book.endDate).toISOString().split('T')[0] : '';
    document.getElementById('book-coverUrl').value = book.coverUrl || '';
    document.getElementById('book-notes').value = book.notes || '';
    updateStarInputDisplay(book.rating || 0);
    document.getElementById('form-title').textContent = "Modifier le livre";
    const bookForm = document.getElementById('book-form');
    if (bookForm) bookForm.classList.remove('hidden');
    const addBookButton = document.getElementById("add-book-button");
    if (addBookButton) addBookButton.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    const form = document.getElementById('book-form');
    if (form) form.reset();
    document.getElementById('book-id').value = '';
    document.getElementById('book-notes').value = '';
    document.getElementById('form-title').textContent = "Ajouter un nouveau livre";
    const genreSelect = document.getElementById('book-genre');
    if (genreSelect) genreSelect.selectedIndex = 0;
    updateStarInputDisplay(0);
    document.getElementById('book-currentPage').value = '0';
    const addBookButton = document.getElementById("add-book-button");
    if (addBookButton) addBookButton.classList.remove("hidden");
}

// --------- Requêtes API Externes (Google Books) ---------
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
          
        } 
        
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
    if (!query || query.trim() === '') { displayError("Veuillez entrer un titre..."); return null; }
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(query)}&maxResults=10&langRestrict=fr`;
    console.log("Appel API Recherche Titre:", apiUrl);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Erreur API Titre: ${response.status}`);
        const data = await response.json();
        return (data.totalItems > 0 && data.items) ? data.items : [];
    } catch (error) { /* ... */ return null; }
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
    const stars = container.querySelectorAll('i');
    stars.forEach(star => {
        const starValue = parseInt(star.dataset.value);
        star.classList.toggle('fas', starValue <= rating);
        star.classList.toggle('far', starValue > rating);
        star.classList.toggle('text-yellow-400', starValue <= rating);
    });
    const ratingValueInput = document.getElementById('book-rating-value');
    if (ratingValueInput) ratingValueInput.value = rating;
}

function prefillBookForm(bookData) {
    console.log("Pré-remplissage du formulaire avec:", bookData);

    document.getElementById('book-title').value = bookData.title || '';
    // Gère le cas où l'auteur de l'API est un tableau
    document.getElementById('book-author').value = Array.isArray(bookData.author) ? bookData.author.join(', ') : (bookData.author || '');
    document.getElementById('book-coverUrl').value = bookData.coverUrl || '';
    document.getElementById('book-publisher').value = bookData.publisher || '';
    document.getElementById('book-publishedDate').value = bookData.publishedDate || '';
    document.getElementById('book-pageCount').value = bookData.pageCount || '';
    document.getElementById('book-genre').value = bookData.genre || '';
    document.getElementById('book-isbn').value = bookData.isbn || ''; // Met aussi à jour l'ISBN si trouvé via titre par ex.

    // Optionnel : Mettre à jour le menu déroulant genre 
     populateGenreDropdown(bookData.genre); 
}

// --------- Gestion du formulaire ---------
async function handleFormSubmit(event) {
    event.preventDefault();
    const bookId = document.getElementById('book-id').value;
    const isbn = document.getElementById('book-isbn').value.trim();
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim(); // Peut être une liste séparée par des virgules
    const status = document.getElementById('book-status').value;
    const coverUrl = document.getElementById('book-coverUrl').value.trim();
    const publisher = document.getElementById('book-publisher').value.trim();
    const publishedDate = document.getElementById('book-publishedDate').value.trim();
    const pageCountValue = document.getElementById('book-pageCount').value.trim();
    const pageCount = pageCountValue === '' ? null : parseInt(pageCountValue);
    const currentPageValue = document.getElementById('book-currentPage').value.trim();
    const currentPage = currentPageValue === '' ? 0 : parseInt(currentPageValue);
    const genre = document.getElementById('book-genre').value;
    const startDate = document.getElementById('book-startDate').value || null;
    const endDate = document.getElementById('book-endDate').value || null;
    const tagsString = document.getElementById('book-tags').value;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : [];
    const notes = document.getElementById('book-notes').value.trim();
    const rating = parseInt(document.getElementById('book-rating-value').value) || 0;

    if (!title) { displayError("Veuillez remplir le champ titre."); return; }
    if (!author) { displayError("Veuillez remplir le champ auteur."); return; }
    if (pageCount !== null && (isNaN(pageCount) || pageCount < 0 || !Number.isInteger(pageCount))) { displayError("Nombre de pages invalide."); return; }
    if (isNaN(currentPage) || currentPage < 0 || !Number.isInteger(currentPage)) { displayError("Page actuelle invalide."); return; }
    if (pageCount !== null && currentPage > pageCount) { displayError(`La page actuelle (${currentPage}) ne peut pas dépasser le nombre total de pages (${pageCount}).`); return; }

    const authorsArray = author.split(',').map(a => a.trim()).filter(a => a !== ""); // Transformer l'auteur en tableau

    const bookData = { title, author: authorsArray, status, coverUrl, isbn, publisher, publishedDate, pageCount, genre, startDate, endDate, tags, notes, rating, currentPage };
    console.log("Données finales envoyées au serveur :", bookData);
    try {
        let response;
        const method = bookId ? 'PUT' : 'POST';
        const apiUrl = bookId ? `/api/books/${bookId}` : '/api/books';
        response = await fetch(apiUrl, { method, headers: getAuthHeaders(), body: JSON.stringify(bookData) });
        if (!response.ok) {
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {const errorData = await response.json(); errorMsg = errorData.message || errorMsg;} catch(e){}
            throw new Error(errorMsg);
        }
        displaySuccessMessage(bookId ? "Livre modifié !" : "Livre ajouté !");
        fetchBooks(); resetForm();
        document.getElementById('book-form').classList.add('hidden');
        document.getElementById('api-search-input').value = '';
        const searchResultsContainer = document.getElementById('api-search-results');
        if (searchResultsContainer) { searchResultsContainer.classList.add('hidden'); searchResultsContainer.innerHTML = ''; }
    } catch (error) { console.error("Erreur lors de l'enregistrement du livre:", error); displayError(error.message || "Impossible d'enregistrer."); }
}

// --------- Gestion UI Authentification ---------
function updateAuthStateUI() {
    const token = localStorage.getItem('authToken');
    const userInfoDiv = document.getElementById('user-info');
    const authLinksDiv = document.getElementById('auth-links');
    const userGreetingSpan = document.getElementById('user-greeting');

    if (token) {
        // Utilisateur connecté
        if (authLinksDiv) authLinksDiv.classList.add('hidden');
        if (userInfoDiv) userInfoDiv.classList.remove('hidden');
        if (userGreetingSpan) {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                userGreetingSpan.textContent = `Bonjour, ${userInfo?.username || 'Utilisateur'} !`;
            } catch (e) {
                userGreetingSpan.textContent = 'Bonjour !';
            }
        }
    } else {
        // Utilisateur déconnecté
        if (authLinksDiv) authLinksDiv.classList.remove('hidden');
        if (userInfoDiv) userInfoDiv.classList.add('hidden');
        // Optionnel: Vider le message d'accueil si l'utilisateur se déconnecte
        if (userGreetingSpan) userGreetingSpan.textContent = '';
    }
    console.log("UI mise à jour pour l'état d'authentification.");
}

// --------- Fonctions pour gérer les étagères (API, Affichage) ---------
async function fetchEtageres() {
    console.log("--- Attempting fetchEtageres ---");
    try {
        const response = await fetch('/api/etageres', {
            method: 'GET',
            headers: getAuthHeaders() // Envoi du token
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Accès non autorisé pour récupérer les étagères (fetchEtageres).");
                // Optionnel: déclencher une déconnexion UI si 401
                // localStorage.removeItem('authToken');
                // localStorage.removeItem('userInfo');
                // updateAuthStateUI();
                // displayError("Votre session a peut-être expiré. Veuillez vous reconnecter.");
                return [];
            }
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const etageres = await response.json();
        console.log("Étagères récupérées avec succès:", etageres);
        return etageres;
    } catch (error) {
        console.error("Erreur lors de la récupération des étagères:", error);
        displayError("Impossible de charger les étagères.");
        return []; // Retourne un tableau vide en cas d'erreur pour éviter des erreurs en aval
    }
}

async function deleteEtagere(etagereId) {
    console.log(`Tentative de suppression de l'étagère ID: ${etagereId}`);
    // La confirmation est maintenant gérée dans l'écouteur d'événement
    try {
        const response = await fetch(`/api/etageres/${etagereId}`, {
            method: 'DELETE',
            headers: getAuthHeaders() // Envoi du token
        });

        if (!response.ok) {
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignorer si la réponse n'est pas du JSON */ }
            throw new Error(errorMsg);
        }
        // Pas de .json() si le backend renvoie 204 No Content ou un message simple
        // Si le backend renvoie un JSON { message: "..." }, alors :
        // const data = await response.json();
        // displaySuccessMessage(data.message || "Étagère supprimée avec succès !");
        displaySuccessMessage("Étagère supprimée avec succès !"); // Supposons un message générique

        fetchEtageres().then(displayEtageres); // Met à jour la liste dans la sidebar
        populateGenreDropdown();       // Met à jour le dropdown dans le formulaire livre
        // Si l'étagère supprimée était le filtre actif, réinitialiser
        if (currentGenreFilter !== "Tous" && ! (await fetchEtageres()).find(e => e.name === currentGenreFilter) ) {
            currentGenreFilter = "Tous";
            // Mettre à jour visuellement le filtre actif si nécessaire
        }
        fetchBooks(); // Mettre à jour les livres si le filtre genre a changé

        return true; // Indique le succès

    } catch (error) {
        console.error("Erreur lors de la suppression de l'étagère:", error);
        displayError(error.message || "Impossible de supprimer l'étagère.");
        return false; // Indique un échec
    }
}

async function createEtagere(etagereData) {
    console.log('--- Attempting createEtagere with data:', etagereData);
    console.log('Token in localStorage AT THE START of createEtagere:', localStorage.getItem('authToken'));
    try {
        const response = await fetch('/api/etageres', {
            method: 'POST',
            headers: getAuthHeaders(), // Envoi du token
            body: JSON.stringify(etagereData),
        });

        if (!response.ok) {
            let errorMsg = `Erreur HTTP: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) { /* Ignorer si la réponse n'est pas du JSON */ }
            throw new Error(errorMsg);
        }
        const newEtagere = await response.json();
        console.log("Nouvelle étagère créée:", newEtagere);
        return newEtagere;
    } catch (error) {
        console.error("Erreur DANS createEtagere:", error); // Log plus spécifique
        // Le message d'erreur est déjà géré par l'écouteur du bouton saveNewGenreButton
        // displayError(error.message || "Une erreur inconnue est survenue lors de la création de l'étagère.");
        throw error; // Relance l'erreur pour que l'écouteur du bouton puisse l'attraper et l'afficher dans la modale
    }
}

function displayEtageres(etageres) {
    console.log("DISPLAYETAGERES - Appelée avec (nombre d'étagères):", etageres ? etageres.length : etageres);
    const menuEtagere = document.getElementById('menu-etagere');
    if (!menuEtagere) {
        console.error("Élément #menu-etagere non trouvé !");
        return;
    }
    menuEtagere.innerHTML = ''; // Efface TOUT le contenu précédent

    // 1. Ajout du bouton "Tous mes livres"
    const tousMesLivresLi = createElementWithClasses('li', 'mb-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer');
    tousMesLivresLi.textContent = "Tous mes livres";
    tousMesLivresLi.addEventListener('click', () => {
        console.log("Clic sur 'Tous mes livres' détecté.");
        currentGenreFilter = "Tous";
        currentTagFilter = null;
        currentStatusFilter = "Tous";
        currentPublisherFilter = "";
        const publisherInput = document.getElementById('filter-publisher');
        if (publisherInput) publisherInput.value = "";
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.selectedIndex = 0;
        const searchResultsContainer = document.getElementById('api-search-results');
        if (searchResultsContainer) { searchResultsContainer.classList.add('hidden'); searchResultsContainer.innerHTML = ''; }
        const searchInputApi = document.getElementById('api-search-input');
        if (searchInputApi) searchInputApi.value = '';
        const activeTagDisplay = document.getElementById('active-tag-filter-display');
        if(activeTagDisplay) activeTagDisplay.classList.add('hidden');

        applyFilterOrSort();
        document.querySelectorAll('#menu-etagere li').forEach(item => item.classList.remove('bg-gray-600', 'text-white'));
        tousMesLivresLi.classList.add('bg-gray-600', 'text-white');
        document.querySelectorAll('.filter-button').forEach(button => {
            button.classList.remove('bg-gray-600', 'text-white');
            if (button.dataset.status === "Tous") button.classList.add('bg-gray-600', 'text-white');
        });
    });
    menuEtagere.appendChild(tousMesLivresLi);

    // 2. Ajoute les étagères dynamiques
    if (etageres && etageres.length > 0) {
        etageres.forEach(etagere => {
            const li = createElementWithClasses('li', 'mb-2 p-3 rounded-md hover:bg-gray-700 cursor-pointer flex items-center justify-between');
            li.dataset.etagereId = etagere._id;
            const span = document.createElement('span');
            span.textContent = etagere.name;
            li.appendChild(span);

            const deleteButton = createElementWithClasses('button', 'delete-etagere-button text-red-500 hover:text-red-700 ml-2 opacity-50 hover:opacity-100');
            deleteButton.innerHTML = '<i class="fas fa-trash text-xs"></i>'; // Icône plus petite
            deleteButton.title = `Supprimer l'étagère "${etagere.name}"`;
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm(`Êtes-vous sûr de vouloir supprimer l'étagère "${etagere.name}" ?\nCela ne supprimera pas les livres, mais leur genre sera vidé.`)) {
                    deleteEtagere(etagere._id); // La fonction deleteEtagere gère le rafraîchissement
                }
            });
            li.appendChild(deleteButton);

            li.addEventListener('click', () => {
                currentGenreFilter = etagere.name;
                applyFilterOrSort();
                document.querySelectorAll('#menu-etagere li').forEach(item => item.classList.remove('bg-gray-600', 'text-white'));
                li.classList.add('bg-gray-600', 'text-white');
            });
            menuEtagere.appendChild(li);
        });
    }

    // 3. Sélectionne visuellement l'élément actif
    let activeLi = null;
    if (currentGenreFilter === "Tous") {
        activeLi = tousMesLivresLi;
    } else if (etageres) { // Vérifie si etageres existe
        const foundLi = Array.from(menuEtagere.querySelectorAll('li')).find(li => li.querySelector('span')?.textContent === currentGenreFilter);
        if (foundLi) activeLi = foundLi;
    }
    if (activeLi) {
        activeLi.classList.add('bg-gray-600', 'text-white');
    } else if (currentGenreFilter !== "Tous") {
        tousMesLivresLi.classList.add('bg-gray-600', 'text-white'); // Fallback si le filtre actif n'est pas trouvé
    }
}

async function populateGenreDropdown(genreNameToSelect = null) {
    console.log("Peuplement du dropdown Genre... Appel fetchEtageres.");
    try {
        const genres = await fetchEtageres(); // Utilise la version qui a getAuthHeaders
        const selectElement = document.getElementById('book-genre');
        if (!selectElement) { console.error("Élément select #book-genre non trouvé."); return; }

        const currentValue = selectElement.value;
        selectElement.innerHTML = '<option value="">-- Sélectionner un genre --</option>';

        if (genres && genres.length > 0) {
            genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.name;
                option.textContent = genre.name;
                selectElement.appendChild(option);
                if (genreNameToSelect && genre.name === genreNameToSelect) {
                    option.selected = true;
                } else if (!genreNameToSelect && genre.name === currentValue) {
                    option.selected = true;
                }
            });
        }

        if (genreNameToSelect && selectElement.value === genreNameToSelect) {
            console.log(`Genre "${genreNameToSelect}" sélectionné dans le dropdown.`);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération/population des genres:", error);
        displayError("Impossible de charger les genres pour le formulaire.");
    }
}

function applyFilterOrSort() {
    console.log("applyFilterOrSort appelée, réinitialisation page et fetch...");
    currentPage = 1;
    fetchBooks();
}

// --------- Initialisation et Écouteurs d'Événements (DOMContentLoaded) ---------
// --------- Initialisation et Écouteurs d'Événements (DOMContentLoaded) ---------
document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM prêt."); // Log initial

    // --- Récupération des Éléments DOM Principaux ---
    // Authentification & Modales Auth
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const loginShowButton = document.getElementById('login-show-button');
    const registerShowButton = document.getElementById('register-show-button');
    const logoutButton = document.getElementById('logout-button');
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const registerForm = document.getElementById('register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerErrorMessage = document.getElementById('register-error-message');
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    // Formulaire Livre Principal
    const bookForm = document.getElementById('book-form');
    const addBookButton = document.getElementById('add-book-button');
    const cancelButtonBookForm = document.getElementById('cancel-button');

    // Filtres & Tri
    const filterButtons = document.querySelectorAll('.filter-button');
    const sortSelect = document.getElementById('sort-select');
    const publisherInput = document.getElementById('filter-publisher');
    let publisherFilterTimeout;
    const bookListElementForTags = document.getElementById('book-list');
    const activeTagDisplay = document.getElementById('active-tag-filter-display');
    const activeTagName = document.getElementById('active-tag-name');
    const clearTagFilterButton = document.getElementById('clear-tag-filter-button');

    // Modale de Notes
    const noteModal = document.getElementById('note-modal');
    const noteModalCloseButton = document.getElementById('note-modal-close-button');

    // Pagination
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    // Recherche API Titre
    const searchApiInput = document.getElementById('api-search-input');
    const searchApiButton = document.getElementById('api-search-button');
    const searchApiResultsContainer = document.getElementById('api-search-results');

    // Recherche ISBN
    const checkIsbnButton = document.getElementById('check-isbn-button');
    const isbnInputInBookForm = document.getElementById('book-isbn');

    // Modale Ajout Genre (depuis formulaire livre)
    const addGenreModal = document.getElementById('add-genre-modal');
    const addNewGenreButtonFromBookForm = document.getElementById('add-new-genre-button');
    const cancelNewGenreModalButton = document.getElementById('cancel-new-genre-button');
    const saveNewGenreModalButton = document.getElementById('save-new-genre-button');
    const newGenreModalInput = document.getElementById('new-genre-modal-input');
    const addGenreModalError = document.getElementById('add-genre-modal-error');

    // Formulaire d'ajout d'étagère (sidebar)
    const addEtagereFormSidebar = document.getElementById('add-etagere-form');
    const etagereNameInputSidebar = document.getElementById('etagere-name');
    const cancelAddEtagereButtonSidebar = document.getElementById('cancel-add-etagere');
    const manageEtageresButtonSidebar = document.getElementById('manage-etageres-button');

    // Étoiles de notation interactives dans le formulaire
    const ratingInputContainerForm = document.getElementById('rating-input-container');
    const bookRatingValueInputForm = document.getElementById('book-rating-value');
    const clearRatingButtonForm = document.getElementById('clear-rating-button');

    // Tous les boutons de fermeture de modale génériques
    const modalCloseButtons = document.querySelectorAll('.modal-close-button');


    // --- Fonctions Utilitaires Locales à DOMContentLoaded (si nécessaire, sinon globales) ---
    const openModal = (modalElement) => {
        if (modalElement) modalElement.classList.remove('hidden');
    };
    const closeModal = (modalElement) => {
        if (modalElement) {
            modalElement.classList.add('hidden');
            const form = modalElement.querySelector('form');
            if (form) form.reset();
            const errorMsg = modalElement.querySelector('[id$="-error-message"]'); // Cible les p#...-error-message
            if (errorMsg) errorMsg.textContent = '';
        }
    };

    // --- Initialisation ---
    updateAuthStateUI(); // Met à jour l'UI en fonction de l'état de connexion initial
    fetchBooks();        // Charge les livres initiaux (enverra le token si présent)
    fetchEtageres().then(etageres => { // Charge les étagères initiales
        displayEtageres(etageres);
        populateGenreDropdown(); // Peuple le dropdown une fois les étagères chargées
    });


    // --- Gestion de la Soumission du Formulaire d'Inscription ---
    if (registerForm && registerUsernameInput && registerEmailInput && registerPasswordInput && registerErrorMessage && registerModal) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            registerErrorMessage.textContent = '';
            const username = registerUsernameInput.value.trim();
            const email = registerEmailInput.value.trim();
            const password = registerPasswordInput.value.trim();

            if (!username || !email || !password) {
                registerErrorMessage.textContent = "Tous les champs sont requis."; return;
            }
            if (password.length < 6) {
                registerErrorMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères."; return;
            }
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || `Erreur HTTP: ${response.status}`);
                displaySuccessMessage(data.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.");
                closeModal(registerModal);
                if (loginModal) openModal(loginModal); // Ouvre la modale de connexion après inscription
            } catch (error) {
                console.error("Erreur lors de la tentative d'inscription:", error);
                registerErrorMessage.textContent = error.message || "Impossible de s'inscrire.";
            }
        });
    } else { console.error("Éléments du formulaire d'inscription manquants."); }

    // --- Gestion de la Soumission du Formulaire de Connexion ---
    if (loginForm && loginEmailInput && loginPasswordInput && loginErrorMessage && loginModal) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            loginErrorMessage.textContent = '';
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value.trim();

            if (!email || !password) {
                loginErrorMessage.textContent = 'Email et mot de passe sont requis.'; return;
            }
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || `Erreur HTTP: ${response.status}`);
                displaySuccessMessage(data.message || "Connexion réussie !");
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userInfo', JSON.stringify({ userId: data.userId, username: data.username }));
                    console.log("Token stocké dans localStorage.");
                    console.log("UserInfo stocké:", { userId: data.userId, username: data.username });
                } else {
                    throw new Error("Problème lors de la connexion, token manquant.");
                }
                updateAuthStateUI();
                closeModal(loginModal);
                currentPage = 1;
                fetchBooks();
                fetchEtageres().then(displayEtageres);
            } catch (error) {
                console.error("Erreur lors de la tentative de connexion:", error);
                loginErrorMessage.textContent = error.message || "Impossible de se connecter.";
                localStorage.removeItem('authToken'); // S'assurer qu'aucun token invalide ne reste
                localStorage.removeItem('userInfo');
                updateAuthStateUI(); // Mettre à jour l'UI vers l'état déconnecté
            }
        });
    } else { console.error("Éléments du formulaire de connexion manquants."); }

    // --- Gestion Boutons Ouverture Modales Auth ---
    if (loginShowButton && loginModal) loginShowButton.addEventListener('click', () => openModal(loginModal));
    if (registerShowButton && registerModal) registerShowButton.addEventListener('click', () => openModal(registerModal));

    // --- Gestion Boutons Fermeture Modales (X et Annuler) ---
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modalId;
            if (modalId) {
                const modalToClose = document.getElementById(modalId);
                if (modalToClose) closeModal(modalToClose);
            }
        });
    });

    // --- Gestion Fermeture Modales (clic sur fond) ---
    // Assurez-vous que addGenreModal et noteModal sont bien définis ici
    [loginModal, registerModal, addGenreModal, noteModal].forEach(modalElem => {
        if (modalElem) { // Vérifie si l'élément modal existe avant d'ajouter l'écouteur
            modalElem.addEventListener('click', (event) => {
                if (event.target === modalElem) closeModal(modalElem);
            });
        }
    });

    // --- Gestion Bouton Déconnexion ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log("Déconnexion demandée.");
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
            updateAuthStateUI();
            displayBooks([]);
            const menuEtagere = document.getElementById('menu-etagere');
            if (menuEtagere) menuEtagere.innerHTML = '';
            const bookList = document.getElementById('book-list');
            if (bookList) bookList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Veuillez vous connecter pour voir vos livres.</p>';
            currentStatusFilter = "Tous"; currentGenreFilter = "Tous"; currentTagFilter = null; currentPublisherFilter = ""; currentPage = 1;
            const sortSelectEl = document.getElementById('sort-select'); if (sortSelectEl) sortSelectEl.selectedIndex = 0;
            const publisherInputEl = document.getElementById('filter-publisher'); if (publisherInputEl) publisherInputEl.value = "";
            const activeTagDisplayEl = document.getElementById('active-tag-filter-display'); if (activeTagDisplayEl) activeTagDisplayEl.classList.add('hidden');
            displaySuccessMessage("Vous avez été déconnecté avec succès.");
            // Après déconnexion, les fetchBooks/Etageres initiaux devraient redonner 401
            // et l'UI devrait refléter l'absence de données.
            // On peut explicitement appeler fetchBooks pour actualiser l'affichage à "pas de données"
            fetchBooks();
            fetchEtageres().then(displayEtageres);
        });
    } else { console.error("Bouton de déconnexion #logout-button non trouvé."); }

    // --- Gestion Formulaire Livre ---
    if (bookForm) bookForm.addEventListener('submit', handleFormSubmit);
    if (addBookButton && bookForm) {
        addBookButton.addEventListener('click', async () => {
            resetForm();
            await populateGenreDropdown();
            bookForm.classList.remove('hidden');
            addBookButton.classList.add('hidden');
        });
    }
    if (cancelButtonBookForm && bookForm && addBookButton) {
        cancelButtonBookForm.addEventListener('click', () => {
            bookForm.classList.add('hidden');
            addBookButton.classList.remove("hidden");
        });
    }

    // --- Filtres Statut ---
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                filterButtons.forEach(btn => btn.classList.remove('bg-gray-600', 'text-white'));
                event.currentTarget.classList.add('bg-gray-600', 'text-white');
                currentStatusFilter = event.currentTarget.dataset.status;
                applyFilterOrSort();
            });
        });
    } else { console.warn("Aucun bouton de filtre de statut trouvé.");}


    // --- Tri ---
    if (sortSelect) sortSelect.addEventListener('change', applyFilterOrSort);

    // --- Gestion Ajout Étagère (Sidebar) ---
    if (manageEtageresButtonSidebar && addEtagereFormSidebar && cancelAddEtagereButtonSidebar && etagereNameInputSidebar) {
        manageEtageresButtonSidebar.addEventListener('click', () => {
            addEtagereFormSidebar.classList.toggle('hidden');
            if (!addEtagereFormSidebar.classList.contains('hidden')) etagereNameInputSidebar.focus();
        });
        cancelAddEtagereButtonSidebar.addEventListener('click', () => {
            addEtagereFormSidebar.classList.add('hidden');
            etagereNameInputSidebar.value = '';
        });
         addEtagereFormSidebar.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = etagereNameInputSidebar.value.trim();
            if (!name) { displayError("Le nom de l'étagère ne peut pas être vide."); return; }
            const newEtagere = await createEtagere({ name });
            if (newEtagere) {
                displaySuccessMessage(`Étagère "${newEtagere.name}" ajoutée.`);
                etagereNameInputSidebar.value = '';
                addEtagereFormSidebar.classList.add('hidden');
                fetchEtageres().then(etageres => {
                     displayEtageres(etageres);
                     populateGenreDropdown(newEtagere.name); // Met à jour aussi le dropdown
                });
            }
        });
    } else { console.warn("Éléments pour l'ajout d'étagère sidebar manquants."); }


    // --- Filtre Tag (Délégation) ---
    if (bookListElementForTags && activeTagDisplay && activeTagName) {
        bookListElementForTags.addEventListener('click', (event) => {
            const tagLink = event.target.closest('a.tag-link');
            if (tagLink) {
                event.preventDefault();
                currentTagFilter = tagLink.dataset.tag;
                activeTagName.textContent = currentTagFilter;
                activeTagDisplay.classList.remove('hidden');
                applyFilterOrSort();
            }
        });
    }
    if (clearTagFilterButton && activeTagDisplay) {
        clearTagFilterButton.addEventListener('click', () => {
            currentTagFilter = null;
            activeTagDisplay.classList.add('hidden');
            applyFilterOrSort();
        });
    }

    // --- Filtre Éditeur ---
    if (publisherInput) {
        publisherInput.addEventListener('input', (event) => {
            clearTimeout(publisherFilterTimeout);
            publisherFilterTimeout = setTimeout(() => {
                currentPublisherFilter = event.target.value.trim(); // Ajout trim()
                applyFilterOrSort();
            }, 500);
        });
    }

    // --- Modale Note (Fermeture) ---
    if (noteModalCloseButton) noteModalCloseButton.addEventListener('click', hideNoteModal);
    // Fermeture en cliquant sur le fond est gérée par la boucle [loginModal, registerModal, addGenreModal, noteModal]

    // --- Pagination ---
    if (prevButton) prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; fetchBooks(); } });
    if (nextButton) nextButton.addEventListener('click', () => { currentPage++; fetchBooks(); });

    // --- Recherche API Titre ---
    if (searchApiButton && searchApiInput && searchApiResultsContainer) {
        searchApiButton.addEventListener('click', async () => {
            const query = searchApiInput.value.trim();
            if (!query) { displayError("Veuillez entrer un titre pour la recherche API."); return; }
            if (searchApiResultsContainer.querySelector('#api-search-message')) {
                 searchApiResultsContainer.querySelector('#api-search-message').textContent = 'Recherche en cours...';
                 searchApiResultsContainer.querySelector('#api-search-message').classList.remove('hidden');
            } else { // Au cas où l'élément message aurait été vidé complètement
                let msgElem = document.createElement('p');
                msgElem.id = 'api-search-message';
                msgElem.className = 'text-center text-gray-500';
                msgElem.textContent = 'Recherche en cours...';
                searchApiResultsContainer.innerHTML = ''; // Vide avant d'ajouter le message
                searchApiResultsContainer.appendChild(msgElem);
            }
            searchApiResultsContainer.classList.remove('hidden');
            const results = await searchBooksAPI(query);
            displayAPISearchResults(results);
        });
        searchApiInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); if(searchApiButton) searchApiButton.click(); }
        });
        searchApiInput.addEventListener('input', () => { // Pour vider les résultats quand on efface
            if (searchApiInput.value.trim() === '') {
                searchApiResultsContainer.classList.add('hidden');
                searchApiResultsContainer.innerHTML = '';
            }
        });
    } else { console.error("Éléments pour recherche API titre manquants."); }

    // --- Clic sur "Ajouter" dans les Résultats de Recherche API ---
    if (searchApiResultsContainer) {
        searchApiResultsContainer.addEventListener('click', async (event) => {
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

    // --- Étoiles Notation Formulaire ---
    if (ratingInputContainerForm && bookRatingValueInputForm) {
        const stars = ratingInputContainerForm.querySelectorAll('i');
        ratingInputContainerForm.addEventListener('mouseover', (event) => {
             if (event.target.tagName === 'I') {
                 const hoverValue = parseInt(event.target.dataset.value);
                 stars.forEach(star => {
                     const starValue = parseInt(star.dataset.value);
                     star.classList.toggle('fas', starValue <= hoverValue);
                     star.classList.toggle('text-yellow-400', starValue <= hoverValue);
                     star.classList.toggle('far', starValue > hoverValue);
                 });
             }
        });
        ratingInputContainerForm.addEventListener('mouseout', () => {
            const currentRating = parseInt(bookRatingValueInputForm.value) || 0;
            updateStarInputDisplay(currentRating);
        });
        ratingInputContainerForm.addEventListener('click', (event) => {
            if (event.target.tagName === 'I') {
                const clickedValue = parseInt(event.target.dataset.value);
                bookRatingValueInputForm.value = clickedValue;
                updateStarInputDisplay(clickedValue);
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

    // index.js (DANS document.addEventListener('DOMContentLoaded', ...))

    // --- Gestion du bouton "Vérifier ISBN" dans le formulaire ---
    const checkIsbnButton = document.getElementById('check-isbn-button');
    const isbnInputInForm = document.getElementById('book-isbn'); // Input ISBN dans le formulaire

    if (checkIsbnButton && isbnInputInForm) {
        checkIsbnButton.addEventListener('click', async () => {
            const isbnValue = isbnInputInForm.value.trim();
            if (!isbnValue) {
                displayError("Veuillez entrer un ISBN à vérifier.");
                isbnInputInForm.focus();
                return;
            }

            // Indicateur de chargement simple sur le bouton
            checkIsbnButton.textContent = "Vérif...";
            checkIsbnButton.disabled = true;

            const fetchedData = await fetchBookDataFromISBN(isbnValue); // Appelle l'API

            checkIsbnButton.textContent = "Vérifier"; // Rétablit le texte
            checkIsbnButton.disabled = false; // Réactive

            if (fetchedData) {
                // Pré-remplit le formulaire avec les données trouvées
                prefillBookForm(fetchedData);
                displaySuccessMessage("Informations du livre trouvées et pré-remplies !");
            }
            // Si fetchedData est null, fetchBookDataFromISBN a déjà affiché l'erreur
        });
    } else {
         console.error("Bouton ou input ISBN pour la vérification non trouvé.");
    }

    const addGenreModal = document.getElementById('add-genre-modal');
    const addNewGenreButton = document.getElementById('add-new-genre-button');
    const cancelNewGenreButton = document.getElementById('cancel-new-genre-button');
    const saveNewGenreButton = document.getElementById('save-new-genre-button');
    const newGenreModalInput = document.getElementById('new-genre-modal-input');
    const addGenreModalError = document.getElementById('add-genre-modal-error');
    const bookFormElement = document.getElementById('book-form'); // Pour savoir si le formulaire principal est visible

    if (addGenreModal && addNewGenreButton && cancelNewGenreButton && saveNewGenreButton && newGenreModalInput && addGenreModalError && bookFormElement) {

        // Ouvrir la modale
        addNewGenreButton.addEventListener('click', () => {
            // Ne pas ouvrir si le formulaire principal n'est pas visible
            if (bookFormElement.classList.contains('hidden')) return;

            newGenreModalInput.value = ''; // Vide le champ
            addGenreModalError.textContent = ''; // Vide message erreur
            addGenreModal.classList.remove('hidden'); // Affiche la modale
            newGenreModalInput.focus(); // Met le focus dans le champ
        });

        // Fonction pour fermer la modale
        const closeGenreModal = () => {
            addGenreModal.classList.add('hidden');
        };

        // Fermer la modale (Annuler)
        cancelNewGenreButton.addEventListener('click', closeGenreModal);

        // Enregistrer le nouveau genre
        saveNewGenreButton.addEventListener('click', async () => {
            const newGenreName = newGenreModalInput.value.trim();
            addGenreModalError.textContent = '';
            if (!newGenreName) { addGenreModalError.textContent = "Le nom du genre ne peut pas être vide."; return; }
            saveNewGenreModalButton.disabled = true; saveNewGenreModalButton.textContent = 'Sauvegarde...';
            console.log("SAVE GENRE MODAL (formulaire livre): Token in localStorage:", localStorage.getItem('authToken'));
            try {
                const addedGenre = await createEtagere({ name: newGenreName }); // createEtagere utilise getAuthHeaders
                if (!addedGenre) throw new Error(addGenreModalError.textContent || "Erreur lors de la création du genre."); // Utilise le message d'erreur s'il a été défini dans createEtagere via displayError
                closeModal(addGenreModal);
                displaySuccessMessage(`Genre "${addedGenre.name}" ajouté !`);
                await populateGenreDropdown(addedGenre.name); // Met à jour et sélectionne
                fetchEtageres().then(displayEtageres); // Met à jour la sidebar
            } catch (error) {
                console.error("Erreur lors de l'ajout du genre (modale formulaire livre):", error);
                addGenreModalError.textContent = error.message; // Affiche l'erreur dans la modale
            } finally {
                saveNewGenreModalButton.disabled = false; saveNewGenreModalButton.textContent = 'Enregistrer';
            }
        });
        newGenreModalInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') { event.preventDefault(); saveNewGenreModalButton.click(); }
        });
    } else { console.warn("Éléments pour modale d'ajout de genre (formulaire livre) non trouvés."); }

    // --- Bouton Vérifier ISBN (dans formulaire livre) ---
    if (checkIsbnButton && isbnInputInBookForm) {
        checkIsbnButton.addEventListener('click', async () => {
            const isbnValue = isbnInputInBookForm.value.trim();
            if (!isbnValue) { displayError("Veuillez entrer un ISBN."); return; }
            checkIsbnButton.textContent = "Vérif..."; checkIsbnButton.disabled = true;
            const fetchedData = await fetchBookDataFromISBN(isbnValue);
            checkIsbnButton.textContent = "Vérifier"; checkIsbnButton.disabled = false;
            if (fetchedData) {
                // populateGenreDropdown est appelé dans prefillBookForm
                prefillBookForm(fetchedData);
                displaySuccessMessage("Informations du livre trouvées !");
            }
        });
    } else { console.error("Éléments pour vérification ISBN non trouvés."); }

}); 