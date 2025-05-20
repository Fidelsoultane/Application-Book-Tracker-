
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
    const textInfo = document.createElement('div'); 

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

    
    // --- Affichage de la Progression ---
    if (book.status === 'En cours' && book.pageCount && parseInt(book.pageCount, 10) > 0) {
        console.log(`[${book.title}] - CONDITION VRAIE: Affichage progression et boutons (Statut: ${book.status}, PageCount: ${book.pageCount})`);

        const progressOuterContainer = createElementWithClasses('div', 'mt-2'); // Conteneur pour tout ce qui concerne la progression

        // 1. Texte de progression
        const progressTextContainer = createElementWithClasses('div', 'text-xs text-gray-600');
        const currentPageForDisplay = book.currentPage || 0;
        const totalPagesForDisplay = parseInt(book.pageCount, 10) || 0;
        const percentageForDisplay = totalPagesForDisplay > 0 ? Math.round((currentPageForDisplay / totalPagesForDisplay) * 100) : 0;
        progressTextContainer.textContent = `Progression : ${currentPageForDisplay} / ${totalPagesForDisplay} pages (${percentageForDisplay}%)`;
        progressOuterContainer.appendChild(progressTextContainer);
        console.log(`[${book.title}] - Texte de progression ajouté: ${progressTextContainer.textContent}`);

        // 2. Barre de progression
        const progressBarContainer = createElementWithClasses('div', 'w-full bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700');
        const progressBar = createElementWithClasses('div', 'bg-blue-600 h-1.5 rounded-full dark:bg-blue-500');
        progressBar.style.width = `${percentageForDisplay}%`;
        progressBarContainer.appendChild(progressBar);
        progressOuterContainer.appendChild(progressBarContainer);
        console.log(`[${book.title}] - Barre de progression ajoutée (largeur: ${percentageForDisplay}%).`);

        // 3. Boutons d'action pour la progression
        const progressActions = createElementWithClasses('div', 'mt-1 flex items-center space-x-2');
        console.log(`[${book.title}] - Création du conteneur 'progressActions'.`);

        // Utilise les valeurs spécifiques à CE livre pour les listeners et conditions
        const currentBookPageForButtons = book.currentPage || 0;
        const totalBookPagesForButtons = parseInt(book.pageCount, 10) || 0;

        // Bouton "+1 Page"
        // Ce bouton s'affiche toujours si pageCount > 0, mais sera désactivé logiquement dans son listener si current >= total
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

        // Bouton "Terminé"
        // S'affiche seulement si le livre n'est pas déjà considéré comme à la dernière page
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

        // Ajoute le conteneur des boutons (progressActions) au conteneur général de progression (progressOuterContainer)
        // SEULEMENT si progressActions contient effectivement des enfants (des boutons)
        if (progressActions.hasChildNodes()) {
            progressOuterContainer.appendChild(progressActions);
            console.log(`[${book.title}] - 'progressActions' (avec enfants) AJOUTÉ à 'progressOuterContainer'.`);
        } else {
            console.log(`[${book.title}] - 'progressActions' est VIDE, non ajouté à 'progressOuterContainer'.`);
        }
        // --- Fin Boutons d'action ---

        // Insertion de tout le bloc de progression (progressOuterContainer) dans la carte
        const ratingElement = card.querySelector('.text-yellow-400'); // Cherche l'élément de notation
        if (ratingElement) {
            ratingElement.insertAdjacentElement('afterend', progressOuterContainer);
            console.log(`[${book.title}] - 'progressOuterContainer' inséré après les étoiles de notation.`);
        } else {
            const genreElement = card.querySelector('p.text-xs.text-gray-500:last-of-type'); // Cherche le dernier paragraphe de genre/info
            if (genreElement) {
                genreElement.insertAdjacentElement('afterend', progressOuterContainer);
                console.log(`[${book.title}] - 'progressOuterContainer' inséré après l'élément genre.`);
            } else {
                // Fallback : si ni notation ni genre, on ajoute à la fin de textInfo
                if (textInfo) {
                    textInfo.appendChild(progressOuterContainer);
                    console.log(`[${book.title}] - 'progressOuterContainer' ajouté à la fin de 'textInfoDiv'.`);
                } else {
                    card.appendChild(progressOuterContainer); // En dernier recours, ajoute directement à la carte
                    console.warn(`[${book.title}] - 'textInfoDiv' non trouvé, 'progressOuterContainer' ajouté directement à la carte.`);
                }
            }
        }
    } else {
        console.log(`[${book.title}] - PAS d'affichage de progression/boutons (Condition Principale FAUSSE: Statut: ${book.status}, PageCount: ${book.pageCount})`);
    }



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

function getAuthHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('authToken');
    // LOGS DE DÉBOGAGE CRUCIAUX
    console.log('getAuthHeaders CALLED. Token from localStorage:', token);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('getAuthHeaders RETURNING headers:', headers);
    return headers;
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

        let url = '/api/books/?'; // Commence par '?'

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

        const response = await fetch(url, { 
            method: 'GET', 
            headers: getAuthHeaders() 
        });

        if (!response.ok) {
            if (response.status === 401) { // Gérer spécifiquement le 401
                displayError("Session expirée ou non autorisé. Veuillez vous reconnecter.");
                // Optionnel : Déconnecter l'utilisateur côté client
                localStorage.removeItem('authToken');
                localStorage.removeItem('userInfo');
                updateAuthStateUI();
                displayBooks([]);
                updatePaginationControls(0);
                // Vider aussi les étagères, etc.
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
        console.error("Erreur lors de la récupération des livres:", error);
        // N'affiche plus l'erreur générique si c'était un 401 déjà géré
        if (!error.message.includes("Session expirée")) {
             displayError("Impossible de récupérer les livres. Veuillez réessayer.");
        }
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
            headers: getAuthHeaders()
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
    document.getElementById('book-pageCount').value = book.pageCount || '';
    document.getElementById('book-currentPage').value = book.currentPage || '0'; // Pré-remplit currentPage
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

    const currentPageInput = document.getElementById('book-currentPage');
    if (currentPageInput) currentPageInput.value = '0'; // Remet à 0


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
    // Récupère TOUTES les valeurs ACTUELLES du formulaire
    const isbn = document.getElementById('book-isbn').value;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;
    const status = document.getElementById('book-status').value;
    const coverUrl = document.getElementById('book-coverUrl').value;
    const publisher = document.getElementById('book-publisher').value;
    const publishedDate = document.getElementById('book-publishedDate').value;
    const pageCountInput = document.getElementById('book-pageCount');
const pageCountValue = pageCountInput.value.trim();
const pageCount = pageCountValue === '' ? null : parseInt(pageCountValue); // null si vide, sinon Number

const currentPageInput = document.getElementById('book-currentPage');
const currentPageValue = currentPageInput.value.trim();
const currentPage = currentPageValue === '' ? 0 : parseInt(currentPageValue); // 0 si vide, sinon Number

    const genre = document.getElementById('book-genre').value;
    const startDate = document.getElementById('book-startDate').value || null;
    const endDate = document.getElementById('book-endDate').value || null;
    const tagsString = document.getElementById('book-tags').value;
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "") : [];
    const notes = document.getElementById('book-notes').value.trim();
    const rating = parseInt(document.getElementById('book-rating-value').value) || 0;
  

    // Validation de base
    if (!title || !author) {
        displayError("Veuillez remplir les champs titre et auteur.");
        return;
    }
    // Validation des nombres côté client (recommandé)
if (pageCount !== null && (isNaN(pageCount) || pageCount < 0 || !Number.isInteger(pageCount))) {
    displayError("Le nombre de pages doit être un nombre entier positif ou zéro (ou laissé vide).");
    return;
}
if (isNaN(currentPage) || currentPage < 0 || !Number.isInteger(currentPage)) {
     displayError("La page actuelle doit être un nombre entier positif ou zéro.");
     return;
}
// Validation currentPage <= pageCount
if (pageCount !== null && currentPage > pageCount) {
    displayError(`La page actuelle (${currentPage}) ne peut pas dépasser le nombre total de pages (${pageCount}).`);
     return;
}

    // Construit l'objet de données DIRECTEMENT à partir des champs du formulaire
    const bookData = {
        title, author, status, coverUrl, isbn, publisher, publishedDate,
        pageCount, genre, startDate, endDate, tags, notes, rating, currentPage // Inclut toutes les données
    };

    console.log("Données finales envoyées au serveur :", bookData);

    // --- Envoi au serveur ---
    try {
        let response;
        let method = bookId ? 'PUT' : 'POST';
        let apiUrl = bookId ? `/api/books/${bookId}` : '/api/books';

        response = await fetch(apiUrl, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(bookData),
        });

        if (!response.ok) {
           let errorMsg = `Erreur HTTP: ${response.status}`;
           try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {/* Ignore */}
           throw new Error(errorMsg);
        }

        displaySuccessMessage(bookId ? "Livre modifié !" : "Livre ajouté !");
        fetchBooks();
        resetForm();
        const bookFormElement = document.getElementById('book-form');
        if(bookFormElement) bookFormElement.classList.add('hidden');
        const searchInputApi = document.getElementById('api-search-input');
        if (searchInputApi) searchInputApi.value = '';
        const searchResultsContainerElement = document.getElementById('api-search-results');
         if (searchResultsContainerElement) {
             searchResultsContainerElement.classList.add('hidden');
             searchResultsContainerElement.innerHTML = '';
         }

    } catch (error) {
        console.error("Erreur lors de l'enregistrement du livre:", error);
        displayError(error.message || "Impossible d'enregistrer le livre.");
    }
}

function updateAuthStateUI() {
    const token = localStorage.getItem('authToken');
    const userInfoDiv = document.getElementById('user-info');
    const authLinksDiv = document.getElementById('auth-links');
    const userGreetingSpan = document.getElementById('user-greeting');

    if (token) {
        // Utilisateur connecté
        if (authLinksDiv) authLinksDiv.classList.add('hidden'); // Cache Connexion/Inscription
        if (userInfoDiv) userInfoDiv.classList.remove('hidden'); // Affiche Bonjour/Déconnexion
        if (userGreetingSpan) {
             // Essaie de récupérer le nom d'utilisateur stocké
             try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                userGreetingSpan.textContent = `Bonjour, ${userInfo?.username || 'Utilisateur'} !`;
             } catch(e) {
                 userGreetingSpan.textContent = 'Bonjour !';
             }
        }
    } else {
        // Utilisateur déconnecté
        if (authLinksDiv) authLinksDiv.classList.remove('hidden'); // Affiche Connexion/Inscription
        if (userInfoDiv) userInfoDiv.classList.add('hidden'); // Cache Bonjour/Déconnexion
    }
     console.log("UI mise à jour pour l'état d'authentification.");
}



// --------- Fonctions pour gérer les étagères  ---------

async function fetchEtageres() {
    try {
        const response = await fetch('/api/etageres', {
            method: 'GET',
            headers: getAuthHeaders() // <<< AJOUTER CECI
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.warn("Accès non autorisé pour récupérer les étagères.");
                // Ne pas afficher d'erreur ici si fetchBooks le fait déjà ou si l'UI est gérée
                return [];
            }
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const etageres = await response.json();
        return etageres;
    } catch (error) {
        console.error("Erreur lors de la récupération des étagères:", error);
        // displayError("Impossible de récupérer les étagères."); // Peut-être redondant si fetchBooks échoue aussi
        return [];
    }
}

async function deleteEtagere(etagereId) {
    try {
        const response = await fetch(`/api/etageres/${etagereId}`, { // Appel à l'API DELETE
            method: 'DELETE',
            headers: getAuthHeaders()
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

        
        return true; // Indique le succès

    } catch (error) {
        console.error("Erreur lors de la suppression de l'étagère:", error);
        displayError(error.message || "Une erreur inconnue est survenue lors de la suppression de l'étagère.");
        return false; // Indique un échec
    }
}

async function createEtagere(etagereData) {
    console.log('--- Attempting createEtagere with data:', etagereData); // LOG C
    console.log('Token in localStorage AT THE START of createEtagere:', localStorage.getItem('authToken')); // LOG D
    try {
        const response = await fetch('/api/etageres', { // Appel à l'API POST
            method: 'POST',
            headers: getAuthHeaders(),
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




// index.js (Modifier populateGenreDropdown)

async function populateGenreDropdown(genreNameToSelect = null) { // Ajout paramètre optionnel
    console.log("Peuplement du dropdown Genre... Vérification token AVANT fetchEtageres.");
    // const tokenForDropdown = localStorage.getItem('authToken'); // Test supplémentaire
    // console.log("Token dans localStorage (populateGenreDropdown):", tokenForDropdown);
    try {
        
        const response = await fetch('/api/etageres', { // Cet appel utilise fetchEtageres qui appelle getAuthHeaders
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const genres = await response.json();
        const selectElement = document.getElementById('book-genre');
        if (!selectElement) {
             console.error("Élément select #book-genre non trouvé.");
             return;
        }

        const currentValue = selectElement.value; // Sauvegarde la valeur actuelle au cas où
        selectElement.innerHTML = '<option value="">-- Sélectionner un genre --</option>';

        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            selectElement.appendChild(option);
            // Pré-sélection après ajout OU si on recharge les options et qu'une valeur existait
             if (genreNameToSelect && genre.name === genreNameToSelect) {
                option.selected = true;
            } else if (!genreNameToSelect && genre.name === currentValue) {
                option.selected = true; // Maintient la sélection précédente si pas de nouvelle sélection
            }
        });

         // Si un nouveau genre a été ajouté et sélectionné, on le log
         if (genreNameToSelect && selectElement.value === genreNameToSelect) {
             console.log(`Genre "${genreNameToSelect}" sélectionné dans le dropdown.`);
         }

    } catch (error) {
        console.error("Erreur lors de la récupération/population des genres:", error);
        displayError("Impossible de charger les genres."); // Informer l'utilisateur
    }
}

function applyFilterOrSort() {
    console.log("applyFilterOrSort appelée, réinitialisation page et fetch..."); // Log pour débogage
    currentPage = 1; // Réinitialise à la page 1
    fetchBooks();    // Appelle la fonction pour récupérer les livres
}


// --------- Initialisation et écouteurs d'événements ---------

document.addEventListener('DOMContentLoaded', () => {

    console.log("DOM prêt."); // Log initial

    // Met à jour l'UI en fonction de l'état de connexion initial
    updateAuthStateUI(); // APPEL INITIAL

    // 1. Chargement initial des données (sera modifié ensuite pour utiliser le token)
    fetchBooks();
    fetchEtageres().then(displayEtageres);

    // --- Gestion de la Soumission du Formulaire d'Inscription ---
    const registerForm = document.getElementById('register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerModalElement = document.getElementById('register-modal');

    if (registerForm && registerUsernameInput && registerEmailInput && registerPasswordInput && registerErrorMessage && registerModalElement) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            registerErrorMessage.textContent = ''; // Vide l'ancien message d'erreur

            const username = registerUsernameInput.value.trim();
            const email = registerEmailInput.value.trim();
            const password = registerPasswordInput.value.trim(); // Le backend validera la longueur

            // Validation simple côté client
            if (!username || !email || !password) {
                registerErrorMessage.textContent = "Tous les champs sont requis.";
                return;
            }
            if (password.length < 6) {
                registerErrorMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
                return;
            }

            try {
                // Appel à l'API d'inscription
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `Erreur HTTP: ${response.status}`);
                }

                // --- Inscription Réussie ---
                console.log("Inscription réussie:", data);
                displaySuccessMessage(data.message || "Inscription réussie ! Vous pouvez maintenant vous connecter.");

                closeModal(registerModalElement); // Ferme la modale d'inscription

                // Optionnel : Ouvrir automatiquement la modale de connexion ?
                // openModal(document.getElementById('login-modal'));

                // OU Optionnel : Tenter de connecter l'utilisateur automatiquement (plus complexe)
                // Pour l'instant, l'utilisateur devra se connecter manuellement.

            } catch (error) {
                console.error("Erreur lors de la tentative d'inscription:", error);
                registerErrorMessage.textContent = error.message || "Impossible de s'inscrire.";
                // Optionnel: displayError(error.message || "Impossible de s'inscrire.");
            }
        });
    } else {
        console.error("Élément(s) manquant(s) pour le formulaire d'inscription.");
    }

        // --- Gestion Affichage Initial Auth & Modales ---
        const authLinks = document.getElementById('auth-links'); // Liens Connexion/Inscription
        const userInfo = document.getElementById('user-info'); // Infos utilisateur connecté
        const loginShowButton = document.getElementById('login-show-button');
        const registerShowButton = document.getElementById('register-show-button');
        const registerModal = document.getElementById('register-modal');
        const loginModal = document.getElementById('login-modal');
        const modalCloseButtons = document.querySelectorAll('.modal-close-button'); // Tous les boutons de fermeture
    
        // Fonction pour ouvrir une modale
        const openModal = (modalElement) => {
            if (modalElement) {
                modalElement.classList.remove('hidden');
            }
        };
    
        // Fonction pour fermer une modale
        const closeModal = (modalElement) => {
             if (modalElement) {
                modalElement.classList.add('hidden');
                // Optionnel: Vider les champs et messages d'erreur en fermant
                const form = modalElement.querySelector('form');
                if (form) form.reset();
                const errorMsg = modalElement.querySelector('[id$="-error-message"]'); // Trouve l'élément d'erreur
                if (errorMsg) errorMsg.textContent = '';
             }
        };
    
        // Écouteurs pour ouvrir les modales
        if (loginShowButton && loginModal) {
            loginShowButton.addEventListener('click', () => openModal(loginModal));
        }
        if (registerShowButton && registerModal) {
            registerShowButton.addEventListener('click', () => openModal(registerModal));
        }
    
        // Écouteurs pour fermer les modales via les boutons (X ou Annuler)
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.dataset.modalId; // Récupère l'ID depuis data-modal-id
                const modalToClose = document.getElementById(modalId);
                closeModal(modalToClose);
            });
        });
    
        // Écouteurs pour fermer les modales en cliquant sur le fond
         [loginModal, registerModal].forEach(modal => {
             if (modal) {
                modal.addEventListener('click', (event) => {
                    if (event.target === modal) { // Si le clic est sur le fond directement
                        closeModal(modal);
                    }
                });
             }
         });

 // --- Gestion de la Soumission du Formulaire de Connexion ---
 const loginForm = document.getElementById('login-form');
 const loginEmailInput = document.getElementById('login-email');
 const loginPasswordInput = document.getElementById('login-password');
 const loginErrorMessage = document.getElementById('login-error-message');
 const loginModalElement = document.getElementById('login-modal'); // Pour le fermer

 if (loginForm && loginEmailInput && loginPasswordInput && loginErrorMessage && loginModalElement) {
     loginForm.addEventListener('submit', async (event) => {
         event.preventDefault(); // Empêche le rechargement
         loginErrorMessage.textContent = ''; // Vide l'ancien message d'erreur

         const email = loginEmailInput.value.trim();
         const password = loginPasswordInput.value.trim(); // Ne pas trimmer les mdp normalement, mais ok ici

         // Validation simple côté client
         if (!email || !password) {
             loginErrorMessage.textContent = 'Email et mot de passe sont requis.';
             return;
         }

         try {
             // Appel à l'API de connexion
             const response = await fetch('/api/auth/login', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({ email, password }),
             });

             const data = await response.json(); // Attend la réponse JSON

             if (!response.ok) {
                 // Si le statut HTTP n'est pas OK (ex: 400, 401, 500)
                 throw new Error(data.message || `Erreur HTTP: ${response.status}`);
             }

             // --- Connexion Réussie ---
             console.log("Connexion réussie:", data);
             displaySuccessMessage(data.message || "Connexion réussie !");

             // 1. Stocker le Token JWT (TRÈS IMPORTANT)
             // localStorage persiste même après fermeture du navigateur
             // sessionStorage persiste seulement pour la session du navigateur
             if (data.token) {
                 localStorage.setItem('authToken', data.token); // Stocke le token
                 // Optionnel: stocker aussi les infos utilisateur de base
                 localStorage.setItem('userInfo', JSON.stringify({
                     userId: data.userId,
                     username: data.username
                 }));
                  console.log("Token stocké dans localStorage.");
             } else {
                  console.error("Aucun token reçu après login réussi !");
                  displayError("Problème lors de la connexion, token manquant.");
                  return; // Arrête si pas de token
             }


             // 2. Mettre à jour l'interface utilisateur (état connecté)
             updateAuthStateUI(); // Appelle la fonction pour maj l'UI

             // 3. Fermer la modale de connexion
             closeModal(loginModalElement); // Appelle la fonction pour fermer

             // 4. Recharger les données de l'utilisateur connecté !
             currentPage = 1; // Réinitialise la page
             fetchBooks();    // Recharge les livres (maintenant avec le token)
             fetchEtageres().then(displayEtageres); // Recharge les étagères (maintenant avec le token)


         } catch (error) {
             console.error("Erreur lors de la tentative de connexion:", error);
             // Affiche l'erreur dans la modale
             loginErrorMessage.textContent = error.message || "Impossible de se connecter.";
              // Optionnel: afficher aussi un toast
              // displayError(error.message || "Impossible de se connecter.");
         }
     });
 } else {
     console.error("Élément(s) manquant(s) pour le formulaire de connexion.");
 }

 // --- Gestion du Bouton de Déconnexion ---
 const logoutButton = document.getElementById('logout-button');
 if (logoutButton) {
     logoutButton.addEventListener('click', () => {
         console.log("Déconnexion demandée.");

         // 1. Supprimer le token et les infos utilisateur du localStorage
         localStorage.removeItem('authToken');
         localStorage.removeItem('userInfo'); // Si vous stockez aussi userInfo

         // 2. Mettre à jour l'interface pour refléter l'état déconnecté
         updateAuthStateUI();

         // 3. Effacer les données spécifiques à l'utilisateur de la page
         // (Optionnel mais recommandé pour une déconnexion propre)
         displayBooks([]); // Affiche une liste de livres vide
         const menuEtagere = document.getElementById('menu-etagere');
         if (menuEtagere) menuEtagere.innerHTML = ''; // Vide les étagères
         const bookList = document.getElementById('book-list');
         if (bookList) bookList.innerHTML = '<p class="text-center text-gray-500 col-span-full">Veuillez vous connecter pour voir vos livres.</p>';


         // Réinitialiser les filtres et la pagination à leur état par défaut
         currentStatusFilter = "Tous";
         currentGenreFilter = "Tous";
         currentTagFilter = null;
         currentPublisherFilter = "";
         currentPage = 1;
         const sortSelect = document.getElementById('sort-select');
         if (sortSelect) sortSelect.selectedIndex = 0;
         const publisherInput = document.getElementById('filter-publisher');
         if (publisherInput) publisherInput.value = "";
         const activeTagDisplay = document.getElementById('active-tag-filter-display');
         if (activeTagDisplay) activeTagDisplay.classList.add('hidden');


         // Optionnel: Afficher un message de succès pour la déconnexion
         displaySuccessMessage("Vous avez été déconnecté avec succès.");

         // Optionnel: Rediriger vers une page de connexion ou la page d'accueil publique
         // window.location.href = '/login.html'; // Si vous aviez une page dédiée
     });
 } else {
     console.error("Bouton de déconnexion #logout-button non trouvé.");
 }




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

            if (!newGenreName) {
                addGenreModalError.textContent = "Le nom du genre ne peut pas être vide.";
                return;
            }

            saveNewGenreButton.disabled = true;
            saveNewGenreButton.textContent = 'Sauvegarde...';

            console.log("SAVE GENRE MODAL: Token in localStorage BEFORE calling createEtagere:", localStorage.getItem('authToken')); // LOG E (gardez-le pour vérifier)

            try {
                // Utilise la bonne route API pour les étagères/genres
                const response = await fetch('/api/etageres', { // Appel à l'API POST
                    method: 'POST',
                    headers: getAuthHeaders(), // <<<< UTILISE getAuthHeaders() ICI
                    body: JSON.stringify({ name: newGenreName })
                });

                if (!response.ok) {
                   let errorMsg = `Erreur: ${response.status}`;
                   try {
                       const errorData = await response.json();
                        if (response.status === 409) { // Conflit (duplicata)
                            errorMsg = errorData.message || `Le genre "${newGenreName}" existe déjà.`;
                        } else if (response.status === 401) { // Non autorisé
                            errorMsg = errorData.message || "Non autorisé. Veuillez vous reconnecter.";
                        } else {
                           errorMsg = errorData.message || `Impossible d'ajouter le genre (${response.status}).`;
                        }
                   } catch(e) {
                       errorMsg = `Impossible d'ajouter le genre (${response.status}). Réponse invalide du serveur.`;
                   }
                   throw new Error(errorMsg);
                }

                const addedGenre = await response.json();

                // Succès !
                closeGenreModal();
                displaySuccessMessage(`Genre "${addedGenre.name}" ajouté !`);
                await populateGenreDropdown(addedGenre.name);
                fetchEtageres().then(displayEtageres);

            } catch (error) {
                console.error("Erreur lors de l'ajout du genre:", error);
                addGenreModalError.textContent = error.message;
            } finally {
                saveNewGenreButton.disabled = false;
                saveNewGenreButton.textContent = 'Enregistrer';
            }
        });
        
         // Permettre de sauver avec Entrée dans le champ input de la modale
         newGenreModalInput.addEventListener('keypress', (event) => {
             if (event.key === 'Enter') {
                 event.preventDefault(); // Empêche la soumission du formulaire principal si la modale est par-dessus
                 saveNewGenreButton.click(); // Simule un clic sur le bouton Enregistrer
             }
         });

          // Fermer la modale si on clique en dehors (sur le fond semi-transparent)
          addGenreModal.addEventListener('click', (event) => {
             // Si le clic est directement sur l'élément modal (le fond)
             if (event.target === addGenreModal) {
                 closeGenreModal();
             }
         });


    } else {
        console.warn("Éléments requis pour la modale d'ajout de genre non trouvés dans le DOM.");
    }

}); // FIN de DOMContentLoaded