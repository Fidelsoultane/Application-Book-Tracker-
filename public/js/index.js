
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
        let url = '/api/books?'; // Corrigé ici
        url += `page=${currentPage}&limit=${booksPerPage}&`;
        if (currentStatusFilter !== "Tous") { url += `status=${encodeURIComponent(currentStatusFilter)}&`; }
        if (currentGenreFilter !== "Tous") { url += `genre=${encodeURIComponent(currentGenreFilter)}&`; }
        if (currentTagFilter) { url += `tags=${encodeURIComponent(currentTagFilter)}&`; }
        if (currentPublisherFilter) { url += `publisher=${encodeURIComponent(currentPublisherFilter)}&`; }
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value) { url += `sortBy=${sortSelect.value}&`; }
        if (url.endsWith('&')) { url = url.slice(0, -1); }

        console.log("FETCHBOOKS - URL d'appel:", url);
        const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
        console.log("FETCHBOOKS - Statut de la réponse:", response.status, response.statusText);
        const responseBodyText = await response.text();
        console.log("FETCHBOOKS - Corps brut de la réponse:", responseBodyText);

        if (!response.ok) {
            if (response.status === 401) {
                displayError("Session expirée ou non autorisé. Veuillez vous reconnecter.");
                localStorage.removeItem('authToken'); localStorage.removeItem('userInfo');
                updateAuthStateUI(); displayBooks([]); updatePaginationControls(0);
                const menuEtagere = document.getElementById('menu-etagere');
                if (menuEtagere) menuEtagere.innerHTML = '';
                return;
            }
            let errorDetail = responseBodyText;
            try { const errorJson = JSON.parse(responseBodyText); errorDetail = errorJson.message || JSON.stringify(errorJson); } catch(e) {}
            throw new Error(`Erreur HTTP: ${response.status} - ${errorDetail}`);
        }
        const data = JSON.parse(responseBodyText);
        console.log("FETCHBOOKS - Données JSON parsées (data):", data);
        console.log("FETCHBOOKS - data.books (avant appel à displayBooks):", data.books);
        console.log("FETCHBOOKS - Nombre de livres reçus:", data.books ? data.books.length : 'undefined ou null');

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
    console.log("DISPLAYBOOKS - Fonction appelée. Argument 'books':", books ? books.length : books);
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
    console.log("Appel API ISBN:", apiUrl);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) { /* ... gestion 503 avec retry ... */ throw new Error(`Erreur API ISBN: ${response.status}`); }
        const data = await response.json();
        if (data.totalItems === 0) throw new Error("Aucun livre trouvé pour cet ISBN.");
        const bookInfo = data.items[0].volumeInfo;
        let coverUrlFromAPI = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || '';
        if (coverUrlFromAPI && coverUrlFromAPI.startsWith('http://')) {
            coverUrlFromAPI = coverUrlFromAPI.replace(/^http:\/\//i, 'https://');
        }
        return {
            title: bookInfo.title || '', author: bookInfo.authors ? bookInfo.authors.join(', ') : '',
            coverUrl: coverUrlFromAPI, publisher: bookInfo.publisher || '',
            publishedDate: bookInfo.publishedDate || '', pageCount: bookInfo.pageCount || '',
            isbn: isbn, genre: bookInfo.categories?.[0] || ''
        };
    } catch (error) { /* ... */ return null; }
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
    console.log("--- Debug displayAPISearchResults ---");
    const resultsContainer = document.getElementById('api-search-results');
    if (!resultsContainer) { console.error("Conteneur #api-search-results non trouvé!"); return; }
    resultsContainer.innerHTML = ''; // Simplifié: vide tout d'abord
    let messageElement = document.createElement('p'); // Toujours recréer pour la simplicité
    messageElement.id = 'api-search-message';
    messageElement.className = 'text-center text-gray-500';
    resultsContainer.appendChild(messageElement);
    resultsContainer.classList.remove('hidden');

    if (!results || results.length === 0) {
        messageElement.textContent = 'Aucun livre trouvé pour cette recherche.';
        messageElement.classList.remove('hidden');
        return;
    }
    messageElement.classList.add('hidden');
    const resultList = document.createElement('div');
    resultList.className = 'space-y-3';
    results.forEach((item, index) => {
        if (!item.volumeInfo) return;
        const bookInfo = item.volumeInfo;
        let coverUrl = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail || 'images/default-book-cover.png';
        if (coverUrl && coverUrl.startsWith('http://')) {
            coverUrl = coverUrl.replace(/^http:\/\//i, 'https://');
        }
        const title = bookInfo.title || 'Titre inconnu';
        const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Auteur inconnu';
        // ... (extraction autres données) ...
        const resultItem = createElementWithClasses('div', 'api-result-item flex items-start p-2 border-b border-gray-200');
        // ... (création img, textContainer, addButton avec dataset) ...
        const imgElement = createElementWithClasses('img', 'w-16 h-24 object-contain mr-3 flex-shrink-0'); imgElement.src = coverUrl; imgElement.alt = `Couverture de ${title}`; resultItem.appendChild(imgElement);
        const textContainer = document.createElement('div'); textContainer.className = 'flex-grow';
        const titleH4 = document.createElement('h4'); titleH4.className = 'font-semibold text-etagere'; titleH4.textContent = title; textContainer.appendChild(titleH4);
        const authorP = document.createElement('p'); authorP.className = 'text-sm text-gray-600'; authorP.textContent = authors; textContainer.appendChild(authorP);
        const pubP = document.createElement('p'); pubP.className = 'text-xs text-gray-500'; pubP.textContent = `${bookInfo.publisher || ''} ${bookInfo.publishedDate ? '('+bookInfo.publishedDate.substring(0,4)+')' : ''}`.trim(); textContainer.appendChild(pubP);
        resultItem.appendChild(textContainer);
        const addButton = createElementWithClasses('button', 'add-from-api-button bg-green-500 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded ml-2 flex-shrink-0'); addButton.textContent = 'Ajouter';
        Object.assign(addButton.dataset, {title, author, coverUrl, publisher: bookInfo.publisher || '', publishedDate: bookInfo.publishedDate || '', pageCount: bookInfo.pageCount || '', genre: bookInfo.categories?.[0] || '', isbn: (bookInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || bookInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '') });
        resultItem.appendChild(addButton);
        resultList.appendChild(resultItem);
    });
    resultsContainer.appendChild(resultList);
}

// --------- Gestion des Étoiles (Formulaire) ---------
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

// --------- Gestion de la Progression (Mise à jour via carte) ---------
async function updateBookProgress(book, newCurrentPage, totalPages, newStatus = null) {
    console.log(`Début updateBookProgress pour: ${book.title}, Nouvelle page: ${newCurrentPage}, Statut voulu: ${newStatus}`);
    const updateData = { currentPage: newCurrentPage };
    if (newStatus) {
        updateData.status = newStatus;
        if (newStatus === 'Terminé') {
            updateData.currentPage = totalPages; updateData.endDate = new Date().toISOString().split('T')[0];
            if (!book.startDate && totalPages > 0) updateData.startDate = updateData.endDate;
        } else if (newStatus !== 'Terminé') { updateData.endDate = null; }
    } else if (newCurrentPage >= totalPages && totalPages > 0) {
        updateData.currentPage = totalPages; updateData.status = 'Terminé';
        updateData.endDate = new Date().toISOString().split('T')[0];
        if (!book.startDate) updateData.startDate = updateData.endDate;
    }
    console.log("Données envoyées pour mise à jour progression:", updateData);
    try {
        const response = await fetch(`/api/books/${book._id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(updateData) });
        if (!response.ok) { let errorMsg = `Erreur HTTP: ${response.status}`; try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {} throw new Error(errorMsg); }
        displaySuccessMessage("Progression mise à jour !");
        fetchBooks();
    } catch (error) { console.error("Erreur lors de la mise à jour de la progression:", error); displayError(error.message || "Impossible de mettre à jour la progression."); }
}

// --------- Gestion du Formulaire Principal ---------
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
                event.preventDefault();
                const bookDataFromAPI = {};
                Object.keys(addButton.dataset).forEach(key => bookDataFromAPI[key] = addButton.dataset[key]);
                resetForm();
                await populateGenreDropdown(bookDataFromAPI.genre); // peuple et essaie de sélectionner
                prefillBookForm(bookDataFromAPI); // prefillBookForm met à jour la sélection si le genre existe après populate
                document.getElementById('form-title').textContent = "Vérifier et Ajouter le livre";
                const bookFormEl = document.getElementById('book-form');
                if (bookFormEl) bookFormEl.classList.remove('hidden');
                const mainAddBtn = document.getElementById("add-book-button");
                if(mainAddBtn) mainAddBtn.classList.add("hidden");
                searchApiResultsContainer.classList.add('hidden'); searchApiResultsContainer.innerHTML = '';
                if (bookFormEl) window.scrollTo({ top: bookFormEl.offsetTop - 20, behavior: 'smooth' });
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
        if(clearRatingButtonForm) {
            clearRatingButtonForm.addEventListener('click', () => {
                bookRatingValueInputForm.value = 0;
                updateStarInputDisplay(0);
            });
        }
    } else { console.error("Éléments pour notation par étoiles non trouvés."); }

    // --- Modale Ajout Genre (depuis formulaire livre) ---
    if (addGenreModal && addNewGenreButtonFromBookForm && cancelNewGenreModalButton && saveNewGenreModalButton && newGenreModalInput && addGenreModalError && bookForm) {
        addNewGenreButtonFromBookForm.addEventListener('click', () => {
            if (bookForm.classList.contains('hidden')) {console.log("Formulaire livre principal caché, modale genre non ouverte."); return;}
            newGenreModalInput.value = ''; addGenreModalError.textContent = '';
            addGenreModal.classList.remove('hidden'); newGenreModalInput.focus();
        });
        // Fermeture via Annuler et clic sur fond déjà gérée
        saveNewGenreModalButton.addEventListener('click', async () => {
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

}); // FIN de DOMContentLoaded