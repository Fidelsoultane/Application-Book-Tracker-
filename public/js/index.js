document.addEventListener('DOMContentLoaded', function() {
    const bookList = document.getElementById('book-list');
    const bookForm = document.getElementById('book-form');

    // Fonction pour afficher la couleur du statut en Tailwind CSS
    function getStatusColorClass(status) {
        switch (status) {
            case 'À lire':
                return 'text-red-500';
            case 'En cours':
                return 'text-yellow-500';
            case 'Terminé':
                return 'text-green-500';
            case 'Souhaité':
                return 'text-gray-500'; // ou une autre couleur pour "Souhaité"
            default:
                return 'text-gray-600';
        }
    }

    // Fonction pour récupérer et afficher les livres
    function fetchBooks() {
        fetch('/api/books')
            .then(response => response.json())
            .then(books => {
                bookList.innerHTML = ''; // Efface la liste de livres actuelle
                books.forEach(book => {
                    const bookCard = document.createElement('div');
                    bookCard.className = "bg-white rounded-lg overflow-hidden shadow-md book-card hover:shadow-lg transition-shadow duration-200 flex flex-col";

                    const statusColor = getStatusColorClass(book.status);

                    bookCard.innerHTML = `
                        <div class="flex flex-col h-full">
                            <img src="${book.coverUrl || '/images/default-book-cover.png'}" alt="${book.title} Cover" class="book-cover w-full h-48 object-cover rounded-t-lg">
                            <div class="p-4 flex flex-col flex-grow">
                                <h2 class="text-xl font-semibold book-title mb-2">${book.title}</h2>
                                <p class="text-gray-700 book-author mb-2">${book.author}</p>
                                <div class="mt-auto">
                                    <p class="font-bold ${statusColor} book-status inline-block px-2 py-1 rounded-full text-sm bg-opacity-75" style="background-color: rgba(255, 255, 255, 0.8);">
                                        ${book.status}
                                    </p>
                                    <div class="mt-2 actions">
                                        <button class="edit-button bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm" data-id="${book._id}">Modifier</button>
                                        <button class="delete-button bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm" data-id="${book._id}">Supprimer</button>
                                    </div>
                                </div>
                            </div>
                            <div class="edit-form hidden mt-4 p-4 bg-gray-50 rounded-b-lg">
                                <input type="text" class="edit-title shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Titre" value="${book.title}">
                                <input type="text" class="edit-author shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="Auteur" value="${book.author}">
                                <input type="text" class="edit-coverUrl shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" placeholder="URL de la couverture" value="${book.coverUrl || ''}">
                                <select class="edit-status shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2">
                                    <option value="À lire" ${book.status === 'À lire' ? 'selected' : ''}>À lire</option>
                                    <option value="En cours" ${book.status === 'En cours' ? 'selected' : ''}>En cours</option>
                                    <option value="Terminé" ${book.status === 'Terminé' ? 'selected' : ''}>Terminé</option>
                                    <option value="Souhaité" ${book.status === 'Souhaité' ? 'selected' : ''}>Souhaité</option>
                                </select>
                                <div class="flex justify-end">
                                    <button class="save-edit-button bg-green-500 text-white px-3 py-1 rounded mr-2" data-id="${book._id}">Sauvegarder</button>
                                    <button class="cancel-edit-button bg-gray-400 text-white px-3 py-1 rounded">Annuler</button>
                                </div>
                            </div>
                        </div>
                    `;

                    bookList.appendChild(bookCard);
                });

                // Gestion des événements après l'ajout des cartes de livres (délégation d'événements)
                attachBookCardEventListeners();


            })
            .catch(error => console.error('Erreur lors de la récupération des livres:', error));
    }

    function attachBookCardEventListeners() {
        bookList.addEventListener('click', function(event) {
            if (event.target.classList.contains('delete-button')) {
                const bookIdToDelete = event.target.dataset.id;
                deleteBook(bookIdToDelete);
            } else if (event.target.classList.contains('edit-button')) {
                const bookCard = event.target.closest('.book-card');
                const editForm = bookCard.querySelector('.edit-form');
                editForm.classList.toggle('hidden');
            } else if (event.target.classList.contains('cancel-edit-button')) {
                const bookCard = event.target.closest('.book-card');
                const editForm = bookCard.querySelector('.edit-form');
                editForm.classList.add('hidden');
            } else if (event.target.classList.contains('save-edit-button')) {
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
    }


    // Fonction pour ajouter un livre
    bookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value.trim();
        const author = document.getElementById("author").value.trim();
        const status = document.getElementById("status").value;
        const coverUrl = document.getElementById("coverUrl").value.trim();


        if (!title || !author) {
            alert("Veuillez remplir tous les champs obligatoires (Titre et Auteur).");
            return;
        }

        fetch("/api/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, status, coverUrl })
        })
            .then(response => response.json())
            .then(() => {
                bookForm.reset();
                fetchBooks();
            })
            .catch(err => console.error(err));
    });

    // Fonction pour supprimer un livre
    function deleteBook(id) {
        fetch(`/api/books/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression du livre');
                }
                fetchBooks(); // Actualise la liste des livres après suppression
            })
            .catch(error => console.error('Erreur:', error));
    }

    // Fonction pour mettre à jour un livre
    function updateBook(id, bookData) {
        fetch(`/api/books/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour du livre');
                }
                fetchBooks(); // Actualiser la liste des livres après la mise à jour
            })
            .catch(error => console.error('Erreur:', error));
    }


    // Chargement initial des livres au démarrage de la page
    fetchBooks();
});