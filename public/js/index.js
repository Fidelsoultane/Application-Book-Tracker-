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

    function afficherMenuLateral(menuElement) {
        // --- NOUVEAU : Récupérer le nombre d'étagères depuis etageresExemples (bookshelf.js) ---
        const nombreEtageres = etageresExemples.length;
        console.log(`Nombre d'étagères détecté : ${nombreEtageres}`);
    
        if (menuElement) {

            menuElement.innerHTML = `
            <div class="mb-4 flex space-x-2">
        <button id="ajouter-etagere-btn" class="bg-[#A8786A] hover:bg-[#7B685E] text-[#E5C0A2] font-semibold py-2 px-3 rounded-lg transition-colors duration-200">  
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 inline-block align-middle">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
        <button id="supprimer-etagere-btn" class="bg-red-600 hover:bg-red-700 text-gray-100 font-semibold py-2 px-3 rounded-lg transition-colors duration-200">  
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 inline-block align-middle">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
        `;

          menuItems.forEach(menuItem => {
            console.log("Ajout du menu :", menuItem.nom, "->", menuItem.lien);

          
            const carteMenu = document.createElement('li'); // <-- correction : carteMenu au lieu de menuItem
            let lienTextNode; // <-- Déclarer lienTextNode en dehors du if/else
    
            if (menuItem.nom === "Étagères") { // <-- CONDITION : SI le libellé est "Étagères" (correction : menuItem.nom au lieu de menuItem.label)
              // --- Pour le lien "Étagères", ajouter le nombre d'étagères entre parenthèses ---
              lienTextNode = document.createTextNode(`${menuItem.nom} (${nombreEtageres})`); // <-- MODIFICATION : Ajouter (${nombreEtageres}) (correction : menuItem.nom au lieu de menuItem.label)
              console.log(`Texte du lien "Étagères" modifié : ${menuItem.nom} (${nombreEtageres})`);
            } else {
              // --- Pour les autres liens (Livres, Recherche), texte normal ---
              lienTextNode = document.createTextNode(menuItem.nom); // <-- LAISSER CETTE LIGNE INTACTE pour les autres liens (correction : menuItem.nom au lieu de menuItem.label)
            }
    
            const lienElement = document.createElement('a');
            lienElement.href = `?${menuItem.lien}`;
            lienElement.className = 'block py-2 px-4 hover:bg-gray-700 text-gray-100'; // <-- correction : text-gray-100
            lienElement.appendChild(lienTextNode); // <-- Utiliser lienTextNode (déclaré et défini au-dessus)
            carteMenu.appendChild(lienElement); // <-- correction : carteMenu au lieu de menuItem
            menuElement.appendChild(carteMenu); // <-- correction : carteMenu au lieu de menuItem
            console.log(`Ajouté au menu : ${menuItem.nom} -> ${lienElement.href}`);
    
            lienElement.addEventListener('click', function(event) {
              event.preventDefault();
             console.log("Clic sur le menu :", menuItem.nom, "->", menuItem.lien);
              afficherSectionContenu(menuItem.lien);
            });
          });

          // --- NOUVEAU :  Appeler afficherMenuEtagere POUR AFFICHER DYNAMIQUEMENT LA LISTE DES ÉTAGÈRES SOUS LE TITRE "Étagères" ---
          const menuEtagereElement = document.getElementById('menu-etagere'); // Récupérer l'élément <ul> AVEC L'ID "menu-etagere" QUE NOUS AVONS AJOUTÉ DANS LE HTML CI-DESSUS
          afficherMenuEtagere(menuEtagereElement); // Appeler la fonction afficherMenuEtagere POUR REMPLIR DYNAMIQUEMENT CET ÉLÉMENT <ul> AVEC LA LISTE DES ÉTAGÈRES (À PARTIR DE etageresExemples)

        } else {
          console.error("Élément de menu latéral non trouvé (ID: 'menu-lateral')");
        }

        

    const ajouterEtagereBtn = document.getElementById('ajouter-etagere-btn'); // <-- CETTE LIGNE DOIT DÉJÀ EXISTER (récupération du bouton "Ajouter")
const supprimerEtagereBtn = document.getElementById('supprimer-etagere-btn'); // <-- CETTE LIGNE DOIT DÉJÀ EXISTER (récupération du bouton "Supprimer")

// --- NOUVEAU : Ajouter un écouteur d'événement 'click' sur le bouton "Ajouter" ---
ajouterEtagereBtn.addEventListener('click', function() { // <-- AJOUT DE L'ÉCOUTEUR D'ÉVÉNEMENT 'click' SUR LE BOUTON "ajouter-etagere-btn"
    console.log("Bouton 'Ajouter une étagère' cliqué (dans index.js) !"); // <-- Message de log (pour vérifier que le bouton est cliqué)

    // --- 1. Demander à l'utilisateur le nom de la nouvelle étagère (avec un prompt) ---
    const nomNouvelleEtagere = prompt("Nom de la nouvelle étagère :", "Nouvelle étagère"); // Ouvrir une boîte de dialogue prompt pour demander le nom de la nouvelle étagère

    if (nomNouvelleEtagere) { // <-- Vérifier si l'utilisateur a saisi un nom (et n'a pas cliqué sur "Annuler")
        console.log("Nom de la nouvelle étagère saisi :", nomNouvelleEtagere); // <-- Message de log (pour afficher le nom saisi par l'utilisateur)

        // --- 2. Créer un nouvel objet étagère (avec un ID unique et le nom saisi) ---
        const nouvelleEtagere = { // Créer un nouvel objet étagère
            id: Date.now(), // Générer un ID unique basé sur le timestamp actuel (pour simplifier dans cette version)
            nom: nomNouvelleEtagere, // Utiliser le nom saisi par l'utilisateur
            nombreLivres: 0 // Initialiser le nombre de livres à 0 pour une nouvelle étagère
        };

        console.log("Nouvelle étagère créée :", nouvelleEtagere); // <-- Message de log (pour afficher le nouvel objet étagère créé)

        // --- 3. Ajouter la nouvelle étagère au tableau etageresExemples ---
        etageresExemples.push(nouvelleEtagere); // Ajouter le nouvel objet étagère à la fin du tableau etageresExemples

        console.log("Tableau etageresExemples mis à jour :", etageresExemples); // <-- Message de log (pour afficher le tableau mis à jour avec la nouvelle étagère)

        // --- 4. Re-render le menu latéral pour mettre à jour la liste des étagères (avec la nouvelle étagère ajoutée) ---
        const menuEtagereElement = document.getElementById('menu-etagere'); // Récupérer l'élément <ul> du menu latéral (où la liste des étagères est affichée)
        afficherMenuEtagere(menuEtagereElement); // Appeler la fonction afficherMenuEtagere pour re-générer le menu latéral (AVEC LA NOUVELLE ÉTAGÈRE !)

        // --- 5. (Optionnel) Afficher un message de confirmation à l'utilisateur ---
        alert("Étagère '" + nouvelleEtagere.nom + "' ajoutée avec succès !"); // <-- Afficher un message d'alerte pour confirmer à l'utilisateur que l'étagère a bien été ajoutée (TEMPORAIRE,  POUR CONFIRMATION RAPIDE)

    } else {
        console.log("Nom de la nouvelle étagère non saisi ou annulé."); // <-- Message de log (si l'utilisateur annule le prompt ou ne saisit pas de nom)
    }
});

supprimerEtagereBtn.addEventListener('click', function() { // <-- ÉCOUTEUR D'ÉVÉNEMENT 'click' SUR LE BOUTON "supprimer-etagere-btn"
      console.log("Bouton 'Supprimer une étagère' cliqué (dans index.js) !"); // <-- MESSAGE DE LOG (POUR TEST - VOUS POUVEZ GARDER CETTE LIGNE POUR VÉRIFICATION)
    
      // --- CODE POUR LA SUPPRESSION D'ÉTAGÈRE (VERSION  *TRÈS  *BASIQUE*  - SUPPRIME  *TOUJOURS LA PREMIÈRE*  ÉTAGÈRE DE LA LISTE) ---
      if (etageresExemples.length > 0) { // <-- VÉRIFIER SI LA LISTE DES ÉTAGÈRES N'EST PAS DÉJÀ VIDE (POUR ÉVITER UNE ERREUR SI ON ESSAIE DE SUPPRIMER UNE ÉTAGÈRE D'UNE LISTE VIDE)
        const etagereSupprimee = etageresExemples.shift(); // <-- SUPPRIMER  *LA PREMIÈRE*  ÉTAGÈRE DU TABLEAU etageresExemples AVEC  `.shift()`  (ET  `.shift()`  RETOURNE AUSSI L'ÉTAGÈRE SUPPRIMÉE,  QUE NOUS STOCKONS DANS la variable etagereSupprimee,  MÊME SI NOUS NE L'UTILISONS PAS POUR L'INSTANT DANS CET EXEMPLE BASIQUE)
    
        console.log("Étagère supprimée (version basique - 1ère étagère supprimée) :", etagereSupprimee); // <-- MESSAGE DE LOG (POUR CONFIRMATION - AFFICHER L'ÉTAGÈRE QUI A ÉTÉ SUPPRIMÉE)
        console.log("Tableau etageresExemples mis à jour (après suppression) :", etageresExemples); // <-- MESSAGE DE LOG (POUR AFFICHER LE TABLEAU MIS À JOUR APRÈS SUPPRESSION)
    
        // --- RE-RENDER LE MENU LATÉRAL POUR METTRE À JOUR LA LISTE DES ÉTAGÈRES (APRÈS LA SUPPRESSION) ---
        const menuEtagereElement = document.getElementById('menu-etagere'); // Récupérer l'élément <ul> du menu latéral (où la liste des étagères est affichée)
        afficherMenuEtagere(menuEtagereElement); // Appeler la fonction afficherMenuEtagere pour re-générer le menu latéral (SANS L'ÉTAGÈRE SUPPRIMÉE !)
    
        // --- (OPTIONNEL) AFFICHER UN MESSAGE DE CONFIRMATION À L'UTILISATEUR ---
        alert("Première étagère supprimée avec succès (version basique) !"); // <-- MESSAGE D'ALERTE (TEMPORAIRE - POUR CONFIRMATION RAPIDE)
    
      } else { // <-- SI LA LISTE DES ÉTAGÈRES EST DÉJÀ VIDE
        console.log("Aucune étagère à supprimer (liste déjà vide)."); // <-- MESSAGE DE LOG (SI LISTE DÉJÀ VIDE)
        alert("Aucune étagère à supprimer (liste déjà vide) !"); // <-- MESSAGE D'ALERTE (TEMPORAIRE - POUR CONFIRMATION RAPIDE)
      }
      // --- FIN DU CODE POUR LA SUPPRESSION D'ÉTAGÈRE (VERSION TRÈS BASIQUE) ---
    
     });

      } 

      function afficherMenuEtagere(menuEtagereElement) {
        if (menuEtagereElement && Array.isArray(etageresExemples)) {
            menuEtagereElement.innerHTML = ''; // Vider la liste des étagères AVANT de la re-remplir
    
            etageresExemples.forEach(etagere => {
                const carteEtagereHTML = creerCarteEtagereHTML(etagere); // Utiliser la fonction creerCarteEtagereHTML pour créer le HTML de la carte de l'étagère
                menuEtagereElement.appendChild(carteEtagereHTML); // Ajouter la carte de l'étagère (<li>) à la liste (<ul>) dans le menu latéral
            });
        } else {
            console.error("Élément de menu étagère non trouvé ou etageresExemples n'est pas un tableau.");
        }
    }


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
    afficherMenuLateral(menuElement);
    console.log("Menu détecté :", menuElement); // <-- Vérifie si l'élément existe

    function creerCarteLivreHTML(livre) {
          // Fonction pour créer le code HTML d'une carte de livre à partir des données d'un livre
        
          const carteLivre = document.createElement('div'); // DIV pour englober toute la carte
          carteLivre.className = 'livre-carte p-4 rounded-md shadow-md bg-white hover:shadow-lg transition-shadow duration-200 flex'; // Classes Tailwind CSS pour la carte
        
          // --- Couverture du livre (image) ---
          const couvertureElement = document.createElement('img');
          couvertureElement.src = livre.coverUrl ? livre.coverUrl : "/images/default-book-cover.png";
          couvertureElement.alt = `Couverture de ${livre.title}`; // Texte alternatif pour l'image
          couvertureElement.className = 'livre-couverture w-24 h-32 object-cover rounded-md mr-4'; // Classes Tailwind CSS pour la couverture (taille, style...)
        
          // --- Conteneur pour les infos (titre, auteur...) ---
          const infosElement = document.createElement('div');
          infosElement.className = 'livre-infos flex-1'; // Prend l'espace restant dans la carte
        
          // --- Titre du livre ---
          const titreElement = document.createElement('h3');
          titreElement.textContent = livre.title; // <-- Assurez-vous que l'objet 'livre' a une propriété 'titre'
          titreElement.className = 'livre-titre text-lg font-semibold text-[#4E342E] mb-1'; // Classes Tailwind CSS pour le titre
        
          // --- Auteur du livre ---
          const auteurElement = document.createElement('p');
          auteurElement.textContent = `Par ${livre.author}`; // <-- Assurez-vous que l'objet 'livre' a une propriété 'auteur'
          auteurElement.className = 'livre-auteur text-sm text-gray-600'; // Classes Tailwind CSS pour l'auteur
        
          // --- Ajouter les éléments enfants à la carte ---
          infosElement.appendChild(titreElement);
          infosElement.appendChild(auteurElement);
        
          carteLivre.appendChild(couvertureElement);
          carteLivre.appendChild(infosElement);
        
          return carteLivre; // Retourner l'élément HTML de la carte de livre
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
                contenuPrincipalElement.innerHTML = `
          <h1 class="text-[#A8786A] text-2xl font-bold mb-4">Rechercher un livre</h1>
          <div class="mb-4">
         <input type="text" id="bt-search-input" placeholder="Titre ou auteur du livre..." class="shadow appearance-none border border-[#7B685E] rounded-md w-full py-2 px-3 text-[#4E342E] leading-tight focus:outline-none focus:shadow-md focus:border-[#A8786A]">
          </div>
          <div id="search-results" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      </div>
                     `;

                     // --- NOUVEAU : Récupérer l'élément input de recherche et ajouter un écouteur d'événement ---
        const searchInputElement = document.getElementById('bt-search-input');
        const searchResultsElement = document.getElementById('search-results'); // <-- Récupérer l'élément pour les résultats

        searchInputElement.addEventListener('keyup', function(event) { // <-- Écoute l'événement 'keyup' (quand une touche est relâchée)
          const searchTerm = searchInputElement.value.toLowerCase(); // <-- Récupérer le terme de recherche (en minuscules)

          if (searchTerm === "") { // <-- AJOUTER CETTE CONDITION : VÉRIFIER SI LE TERME DE RECHERCHE EST VIDE
            searchResultsElement.innerHTML = ""; // <-- SI OUI, VIDER LE CONTENEUR DES RÉSULTATS (UTILISER searchResultsElement que vous avez déjà)
            console.log("Terme de recherche vide : résultats effacés."); // <-- (Optionnel : message de log)
            return; // <-- IMPORTANT : ARRÊTER L'EXÉCUTION DE LA FONCTION ICI
        }

          console.log("Recherche en cours pour :", searchTerm); // <-- LOG : Vérification du terme de recherche

          // --- Filtrer les livres en fonction du terme de recherche ---
          const livresFiltres = allBooks.filter(livre => { // <-- Supposant que vos livres sont dans 'livresExemples'
            const titreLower = livre.title.toLowerCase(); // <-- Titre du livre en minuscules
            const auteurLower = livre.author.toLowerCase(); // <-- Auteur du livre en minuscules
            return titreLower.includes(searchTerm) || auteurLower.includes(searchTerm); // <-- Vrai si le titre OU l'auteur contient le terme
          });

          console.log("Livres filtrés :", livresFiltres); // <-- LOG : Vérification des livres filtrés

          // --- Afficher les livres filtrés dans la zone de résultats ---
          searchResultsElement.innerHTML = ''; // <-- Vider les résultats précédents avant d'afficher les nouveaux

          if (livresFiltres.length > 0) { // <-- Vérifier s'il y a des livres filtrés
            livresFiltres.forEach(livre => { // <-- Parcourir les livres filtrés
              const carteLivreHTML = creerCarteLivreHTML(livre); // <-- Réutiliser votre fonction creerCarteLivreHTML (si elle existe)
              searchResultsElement.appendChild(carteLivreHTML); // <-- Ajouter la carte de livre à la zone de résultats
            });
          } else {
            searchResultsElement.innerHTML = '<p class="text-gray-500 mt-2">Aucun livre trouvé correspondant à votre recherche.</p>'; // <-- Message si aucun livre trouvé
          }
        });
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