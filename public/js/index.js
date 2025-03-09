document.addEventListener('DOMContentLoaded', function() {
    const bookList = document.getElementById('book-list');
    const bookForm = document.getElementById('book-form');
    const filterButtons = document.querySelectorAll('.filter-button');
    let allBooks = [];
    let currentFilterStatus = 'Tous';

    // Fonction pour obtenir la classe de couleur Tailwind CSS pour le statut
    function getStatusColorClass(status) {
        switch (status) {
            case 'À lire':
                return 'text-red-500';
            case 'En cours':
                return 'text-yellow-500';
            case 'Terminé':
                return 'text-green-500';
            case 'Souhaité':
                return 'text-gray-500';
            default:
                return 'text-gray-600';
        }
    }

    // Fonction pour mettre à jour le style des boutons de filtre actifs
    function updateFilterButtonStyles(statusActif) {
        filterButtons.forEach(button => {
            if (button.dataset.status === statusActif) {
                button.classList.remove('bg-[#E5C0A2]', 'hover:bg-[#D0B09D]', 'text-[#7B685E]'); // Supprimer le style inactif (beige)
                button.classList.add('bg-[#A8786A]', 'hover:bg-[#7B685E]', 'text-[#E5C0A2]'); // Ajouter le style actif (brun)
            } else {
                button.classList.remove('bg-[#A8786A]', 'hover:bg-[#7B685E]', 'text-[#E5C0A2]'); // Supprimer le style actif (brun)
                button.classList.add('bg-[#E5C0A2]', 'hover:bg-[#D0B09D]', 'text-[#7B685E]'); // Ajouter le style inactif (beige)
            }
        });
    }

    // Fonction pour filtrer et afficher les livres par statut
    function filterBooksByStatus(status) {
        console.log(`Début de filterBooksByStatus(${status})`);
        currentFilterStatus = status;
        console.log(`filterBooksByStatus : currentFilterStatus mis à jour à : ${currentFilterStatus}`);

        bookList.innerHTML = '';
        console.log("filterBooksByStatus : bookList.innerHTML vidé");

        let filteredBooks = allBooks;
        if (status !== 'Tous') {
            filteredBooks = allBooks.filter(book => book.status === status);
        }
        console.log("filterBooksByStatus : Livres filtrés:", filteredBooks);

        filteredBooks.forEach(book => {
            console.log('Objet book dans filterBooksByStatus:', book);
            const bookCard = document.createElement('div');
            bookCard.className = "bg-opacity-50 bg-[#F5F0EC] rounded-lg overflow-hidden shadow-md book-card hover:shadow-lg transition-shadow duration-200 flex flex-col";

            bookCard.innerHTML = `
                <img src="${book.coverUrl || '/images/default-book-cover.png'}" alt="${book.title} Cover" class="book-cover w-full h-48 object-cover rounded-t-lg">
                <div class="p-4 flex flex-col justify-between h-full">
                    <div>
                        <h2 class="text-[#4E342E] text-xl font-semibold book-title mb-2">${book.title}</h2>
                        <p class="text-[#7B685E] book-author mb-4">${book.author}</p>
                    </div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="font-bold ${getStatusColorClass(book.status)} book-status inline-block px-2 py-1 rounded-full text-sm bg-opacity-75">${book.status}</span>
                        <div class="space-x-2">
                            <button data-id="${book._id}" class="edit-button inline-block bg-[#E5C0A2] hover:bg-[#D0B09D] text-[#7B685E] font-semibold py-2 px-4 rounded-lg transition-colors duration-200">Modifier</button>
                            <button type="button" data-id="${book._id}" class="bg-[#BFA094] hover:bg-[#A8786A] text-[#E5C0A2] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 delete-button">Supprimer</button>
                        </div>
                    </div>
                    <div class="edit-form hidden mt-4">
                        <form class="book-edit-form">
                            <div class="mb-2">
                                <label for="edit-title-${book._id}" class="block text-[#4E342E] text-sm font-bold mb-1">Titre:</label>
                                <input type="text" id="edit-title-${book._id}" name="edit-title" class="edit-title shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]" value="${book.title}">
                            </div>
                            <div class="mb-2">
                                <label for="edit-author-${book._id}" class="block text-[#4E342E] text-sm font-bold mb-1">Auteur:</label>
                                <input type="text" id="edit-author-${book._id}" name="edit-author" class="edit-author shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]" value="${book.author}">
                            </div>
                            <div class="mb-2">
                                <label for="edit-status-${book._id}" class="block text-[#4E342E] text-sm font-bold mb-1">Statut:</label>
                                <select id="edit-status-${book._id}" name="edit-status" class="edit-status shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A] book-status">
                                    <option value="À lire" ${book.status === 'À lire' ? 'selected' : ''}>À lire</option>
                                    <option value="En cours" ${book.status === 'En cours' ? 'selected' : ''}>En cours</option>
                                    <option value="Terminé" ${book.status === 'Terminé' ? 'selected' : ''}>Terminé</option>
                                    <option value="Souhaité" ${book.status === 'Souhaité' ? 'selected' : ''}>Souhaité</option>
                                </select>
                            </div>
                             <div class="mb-2">
                                <label for="edit-coverUrl-${book._id}" class="block text-[#4E342E] text-sm font-bold mb-1">URL de Couverture:</label>
                                <input type="text" id="edit-coverUrl-${book._id}" name="edit-coverUrl" class="edit-coverUrl shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]" value="${book.coverUrl}">
                            </div>
                            <div class="flex justify-end">
                                <button type="button" data-id="${book._id}" class="bg-[#A8786A] hover:bg-[#7B685E] text-[#E5C0A2] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 save-button">Sauvegarder</button>
                                <button type="button" class="bg-[#E5C0A2] hover:bg-[#D0B09D] text-[#7B685E] font-semibold py-2 px-4 rounded-lg transition-colors duration-200 cancel-button ml-2">Annuler</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            bookList.appendChild(bookCard);
        });

        // **SUPPRIMÉ : attachBookCardEventListeners() n'est plus appelé ici**
        console.log(`Fin de filterBooksByStatus(${status})`);
    }


    // Fonction pour récupérer les livres depuis l'API et afficher la liste (MODIFIÉE pour appeler setupEventListeners une seule fois)
    function fetchBooks() {
        console.log("Début de l'exécution de la fonction fetchBooks()");

        fetch('/api/books')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP dans fetchBooks! statut: ${response.status}`);
                }
                return response.json();
            })
            .then(books => {
                console.log("fetchBooks() : Données des livres récupérées du serveur:", books);
                allBooks = books;
                console.log("fetchBooks() : allBooks mis à jour:", allBooks);
                filterBooksByStatus(currentFilterStatus);
            })
            .catch(error => {
                console.error('Erreur DANS fetchBooks() lors de la récupération des livres:', error);
                alert('Erreur lors du chargement initial des livres.');
            });
        console.log("Fin de la fonction fetchBooks() (avant la réponse du serveur)");
    }


    // **NOUVELLE fonction pour initialiser les écouteurs d'événements (appelée une seule fois au démarrage)**
    function setupEventListeners() {
        bookList.addEventListener('click', function(event) {
            if (event.target.classList.contains('delete-button')) {
                const bookIdToDelete = event.target.dataset.id;
                deleteBook(bookIdToDelete);
            } else if (event.target.classList.contains('edit-button')) {
                const bookCard = event.target.closest('.book-card');
                const editForm = bookCard.querySelector('.edit-form');
                editForm.classList.toggle('hidden');
            } else if (event.target.classList.contains('cancel-button')) {
                const bookCard = event.target.closest('.book-card');
                const editForm = bookCard.querySelector('.edit-form');
                editForm.classList.add('hidden');
            } else if (event.target.classList.contains('save-button')) {
                const bookIdToEdit = event.target.dataset.id;
                const bookCard = event.target.closest('.book-card');
                const title = bookCard.querySelector('.edit-title').value.trim();
                const author = bookCard.querySelector('.edit-author').value.trim();
                const status = bookCard.querySelector('.edit-status').value;
                const coverUrl = bookCard.querySelector('.edit-coverUrl').value.trim();

                if (!title || !author) {
                    alert('Titre et auteur sont obligatoires pour la modification.');
                    return;
                }
                updateBook(bookIdToEdit, { title, author, status, coverUrl });
            }
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const statusToFilter = this.dataset.status;
                filterBooksByStatus(statusToFilter);
                updateFilterButtonStyles(statusToFilter); // Mettre à jour les styles des boutons de filtre
            });
        });

        bookForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const title = document.getElementById('book-title').value.trim();
            const author = document.getElementById('book-author').value.trim();
            const status = document.getElementById('book-status').value;
            const coverUrl = document.getElementById('book-coverUrl').value.trim();

            if (!title || !author) {
                alert('Titre et auteur sont obligatoires.');
                return;
            }

            const newBook = { title, author, status, coverUrl };

            fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(book => {
                console.log('Livre ajouté:', book);
                alert('Livre ajouté avec succès!');
                bookForm.reset();
                console.log("Appel à fetchBooks() après l'ajout du livre");
                fetchBooks();
            })
            .catch(error => {
                console.error('Erreur lors de l\'ajout du livre:', error);
                alert('Erreur lors de l\'ajout du livre.');
            });
        });
    }


    // Fonction pour supprimer un livre
    function deleteBook(id) {
        fetch(`/api/books/${id}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    alert('Livre non trouvé sur le serveur.');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            return response.text();
        })
        .then(message => {
            console.log('Livre supprimé avec succès:', message);
            alert('Livre supprimé avec succès!');
            console.log("Appel à fetchBooks() après la suppression du livre");
            fetchBooks();
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du livre:', error);
            alert('Erreur lors de la suppression du livre.');
        });
    }

    // Fonction pour mettre à jour un livre
    function updateBook(id, bookData) {
        fetch(`/api/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(updatedBook => {
            console.log('Livre mis à jour:', updatedBook);
            const bookCard = document.querySelector(`.book-card .edit-button[data-id="${id}"]`).closest('.book-card');
            if (bookCard) {
                bookCard.querySelector('.book-title').textContent = updatedBook.title;
                bookCard.querySelector('.book-author').textContent = updatedBook.author;
                bookCard.querySelector('.book-status').textContent = updatedBook.status;
                bookCard.querySelector('.book-status').className = `font-bold ${getStatusColorClass(updatedBook.status)} book-status inline-block px-2 py-1 rounded-full text-sm bg-opacity-75`;
                bookCard.querySelector('.book-cover').src = updatedBook.coverUrl || '/images/default-book-cover.png';

                const editForm = bookCard.querySelector('.edit-form');
                editForm.classList.add('hidden');
            }
            alert('Livre mis à jour avec succès!');
            console.log("Appel à fetchBooks() après la mise à jour du livre");
            fetchBooks();
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour du livre:', error);
            alert('Erreur lors de la mise à jour du livre.');
        });
    }


    // Initialisation : récupérer les livres et configurer les écouteurs d'événements au chargement de la page
    fetchBooks();
    setupEventListeners(); // **Appeler setupEventListeners une seule fois au démarrage**
    updateFilterButtonStyles('Tous'); // Sélectionner 'Tous' par défaut visuellement


    const menuItems = [
        {
            nom: "Livres", // <--  NOUVEAU LIEN "Livres" AJOUTÉ ICI (au début)
            lien: "#livres", // <-- Lien associé : "#livres"
            icone: "icone_livre" // <-- Optionnel : icône
        },
        {
            nom: "Recherche",
            lien: "#recherche",
            icone: "icone_recherche"
        },
        {
            nom: "Étagères", // Nouvelle entrée pour la section "Étagères"
            lien: "#etageres",
            icone: "icone_etagere"
        },

    ];

    const menuElement = document.getElementById('menu-lateral');
    console.log("Menu détecté :", menuElement); // <-- Vérifie si l'élément existe


    if (menuElement) {
        menuItems.forEach(item => {
            console.log("Ajout du menu :", item.nom, "->", item.lien);

            const menuItem = document.createElement('li');
            const menuLink = document.createElement('a');
            menuLink.href = item.lien;
            menuLink.textContent = item.nom;
            // --- Classes Tailwind CSS pour le style du lien de menu ---
            menuLink.className = 'block py-2 px-4 text-[#E5C0A2] hover:bg-[#7B685E] hover:text-[#F5F0EC]'; // Style épuré et moderne

            // --- Optionnel : Ajouter une icône si vous utilisez des icônes ---
            if (item.icone) {
                const iconSpan = document.createElement('span');
                iconSpan.className = item.icone;
                menuLink.prepend(iconSpan);
            }
            // --- Fin Optionnel ---

            menuItem.appendChild(menuLink);
            menuElement.appendChild(menuItem);
            console.log("Ajouté au menu :", item.nom, "->", menuLink.href); 

            menuLink.addEventListener('click', function(event) {
                event.preventDefault();
                console.log("Clic sur le menu :", item.nom, "->", item.lien);
                afficherSectionContenu(item.lien);
            });
        });
    } else {
        console.error("Élément de menu etagere non trouvé (ID: 'menu-lateral')");
    }
    

    function afficherSectionContenu(sectionLien) {
        const contenuPrincipalElement = document.getElementById('contenu-principal');
        console.log("afficherSectionContenu() appelée avec :", sectionLien);

        if (contenuPrincipalElement) {
            contenuPrincipalElement.innerHTML = ""; // Vide le contenu de <main>
            console.log("Contenu principal vidé, chargement de :", sectionLien);
    
            if (sectionLien === "#livres") {
                // ---  NOUVEAU : Insérer le code HTML initial (titre et formulaire) pour le lien "#livres" ---
                contenuPrincipalElement.innerHTML = `
                    <h1 class="text-[#A8786A] text-2xl font-bold">Bienvenue sur Book Tracker</h1>
                    <p>Contenu de la section Recherche (à implémenter)</p>
    
                    <form id="book-form" class="mb-8 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto">
                        <h2 class="text-[#A8786A] text-2xl font-bold">Ajouter un nouveau livre</h2>
                        <div class="mb-4">
                            <label for="title" class="block text-[#4E342E] text-sm font-bold mb-1">Titre:</label>
                            <input type="text" id="book-title" placeholder="Titre du livre" class="shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]">
                        </div>
                        <div class="mb-4">
                            <label for="author" class="block text-[#4E342E] text-sm font-bold mb-1">Auteur:</label>
                            <input type="text" id="book-author" placeholder="Auteur du livre" class="shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]">
                        </div>
                        <div class="mb-4">
                            <label for="coverUrl" class="block text-[#4E342E] text-sm font-bold mb-1">URL de la couverture (optionnel):</label>
                            <input type="text" id="book-coverUrl" placeholder="URL de l'image de couverture" class="shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]">
                        </div>
                        <div class="mb-6">
                            <label for="status" class="block text-[#4E342E] text-sm font-bold mb-1">Statut de lecture:</label>
                            <select id="book-status" class="shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A] book-status">
                                <option value="À lire">À lire</option>
                                <option value="En cours">En cours</option>
                                <option value="Terminé">Terminé</option>
                                <option value="Souhaité">Souhaité</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-center">
                            <button class="bg-[#A8786A] hover:bg-[#7B685E] text-[#E5C0A2] font-semibold py-2 px-4 rounded-lg transition-colors duration-200" type="submit">
                                Ajouter un livre
                            </button>
                        </div>
                    </form>
                `; // <-- Fin du code HTML initial inséré
            } else if (sectionLien === "#recherche") {
                contenuPrincipalElement.textContent = "Contenu de la section Recherche (à implémenter)";
            } else if (sectionLien === "#etageres") {
                // --- Pour la section "Étagères", on appelle la fonction de bookshelf.js ---
                afficherSectionEtagere(contenuPrincipalElement);
            } else {
                contenuPrincipalElement.textContent = "Section non implémentée";
            }
        } else {
            console.error("Zone de contenu principal non trouvée (ID: 'contenu-principal')");
        }
    }


    function initialiserAffichage() {
        afficherSectionContenu("#livres");
    }

    // initialiserAffichage();  <-- COMMENTER CETTE LIGNE


});