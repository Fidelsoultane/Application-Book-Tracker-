// tests/book.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app'); // Chemin vers votre app Express
const User = require('../src/models/User'); // Pour créer/logger un utilisateur de test
const Book = require('../src/models/Book'); // Pour vérifier la création/suppression de livres
const bcrypt = require('bcrypt'); // Si on crée un user manuellement avec mdp haché

let mongoServer;
let testUserToken; // Pour stocker le token JWT du testUser
let testUserId;    // Pour stocker l'ID du testUser

// --- Configuration de la base de données en mémoire ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("MongoDB Memory Server connecté pour les tests Book ! URI:", mongoUri);

    // Créer et logger un utilisateur de test pour obtenir un token
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({ // Crée directement l'utilisateur pour le test
        username: 'bookTestUser',
        email: 'booktest@example.com',
        password: password
    });

    // Se connecter avec cet utilisateur pour obtenir un token
    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'booktest@example.com',
            password: password
        });
    
    if (loginResponse.body.token) {
        testUserToken = loginResponse.body.token;
        testUserId = loginResponse.body.userId;
        console.log("Utilisateur de test connecté, token obtenu pour les tests de livres.");
    } else {
        console.error("ERREUR: Impossible de connecter l'utilisateur de test pour les tests de livres.");
        // Gérer cette erreur, peut-être en faisant échouer les tests
        throw new Error("Échec de la connexion de l'utilisateur de test requis pour les tests de livres.");
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log("MongoDB Memory Server déconnecté pour les tests Book.");
});

// Vider les collections avant chaque test
beforeEach(async () => {
    await Book.deleteMany({}); // Vide les livres

    // Recréer et relogger l'utilisateur de test si on vide User à chaque fois
    // Pour l'instant, on le fait dans beforeAll, donc il persiste pour tous les tests de ce fichier
    // Si vous videz User dans beforeEach, il faudra le recréer et relogger ici aussi, ou adapter.
    // Pour plus de simplicité, on va supposer que le testUser créé dans beforeAll suffit pour ce describe.
    // Si on testait des droits différents, on créerait des users différents dans chaque test.
});


// --- Début des Tests pour les Routes /api/books ---
describe('Routes /api/books', () => {

    // --- Tests pour POST /api/books (Créer un livre) ---
    describe('POST / (Créer un livre)', () => {
        it('devrait créer un nouveau livre si l\'utilisateur est authentifié', async () => {
            const bookData = {
                title: 'Le Grand Test',
                author: ['Auteur de Test'],
                status: 'À lire',
                genre: 'Test',
                // userId est géré par le backend via req.user.userId
            };

            const response = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${testUserToken}`) // Envoi du token
                .send(bookData)
                .expect('Content-Type', /json/)
                .expect(201); // Statut "Created"

            expect(response.body).toHaveProperty('_id');
            expect(response.body.title).toBe(bookData.title);
            expect(response.body.author).toEqual(expect.arrayContaining(bookData.author));
            expect(response.body.userId).toBe(testUserId); // Vérifie que le livre est bien lié à l'utilisateur

            // Vérification en base
            const bookInDb = await Book.findById(response.body._id);
            expect(bookInDb).toBeTruthy();
            expect(bookInDb.title).toBe(bookData.title);
            expect(bookInDb.userId.toString()).toBe(testUserId);
        });

        it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
            const bookData = { title: 'Livre sans Token', author: ['Auteur Anonyme'] };
            const response = await request(app)
                .post('/api/books')
                .send(bookData)
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Non autorisé, aucun token fourni.');
        });

        it('devrait retourner une erreur 400 si le titre est manquant', async () => {
            const bookData = { author: ['Auteur Seul'], status: 'À lire' };
            const response = await request(app)
                .post('/api/books')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(bookData)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body.message).toContain('Le titre est obligatoire.');
        });

        // Vous pouvez ajouter d'autres tests pour la validation (auteur manquant, etc.)
    });

    describe('GET / (Récupérer les livres)', () => {
        it('devrait retourner les livres de l\'utilisateur authentifié', async () => {
            // Créer quelques livres pour cet utilisateur
            await Book.create([
                { title: 'Livre A de User', author: ['Auteur'], status: 'À lire', userId: testUserId, genre: 'Test' },
                { title: 'Livre B de User', author: ['Auteur'], status: 'En cours', userId: testUserId, genre: 'Test' }
            ]);
            // Créer un livre pour un autre utilisateur (ne doit pas être retourné)
            await Book.create({ title: 'Livre C Autre User', author: ['Autre'], status: 'Terminé', userId: new mongoose.Types.ObjectId(), genre: 'Autre' });


            const response = await request(app)
                .get('/api/books') // Pas de query params spécifiques, utilise les défauts de l'API (page 1, limit 12, sort createdAt desc)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('books');
            expect(response.body.books).toBeInstanceOf(Array);
            expect(response.body.books.length).toBe(2); // Seulement les 2 livres de testUser
            expect(response.body.books[0].userId.toString()).toBe(testUserId);
            expect(response.body.books[1].userId.toString()).toBe(testUserId);
            expect(response.body).toHaveProperty('totalBooks', 2);
            expect(response.body).toHaveProperty('currentPage', 1);
        });

        it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
            const response = await request(app)
                .get('/api/books')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Non autorisé, aucun token fourni.');
        });

        it('devrait gérer la pagination correctement', async () => {
            // Créer 3 livres pour testUser pour tester la pagination
            await Book.insertMany([
                { title: 'Livre B - Milieu', author: ['A'], status: 'À lire', userId: testUserId, genre: 'Pagination', createdAt: new Date(2025, 0, 1) }, // Pour le tri par défaut
                { title: 'Livre A - Premier', author: ['B'], status: 'À lire', userId: testUserId, genre: 'Pagination', createdAt: new Date(2025, 0, 2) },
                { title: 'Livre C - Dernier', author: ['C'], status: 'À lire', userId: testUserId, genre: 'Pagination', createdAt: new Date(2025, 0, 3) }
            ]);

            // Demande la page 2, avec une limite de 1, trié par titre ascendant
            const response = await request(app)
                .get('/api/books?page=2&limit=1&sortBy=title:asc')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);

            expect(response.body.books.length).toBe(1);
            // Après tri title:asc : "Livre A - Premier", "Livre B - Milieu", "Livre C - Dernier"
            // La page 2 avec limite 1 est donc "Livre B - Milieu"
            expect(response.body.books[0].title).toBe('Livre B - Milieu'); // <-- CORRECTION ICI
            expect(response.body.totalBooks).toBe(3);
            expect(response.body.currentPage).toBe(2);
            expect(response.body.totalPages).toBe(3);
        });

        it('devrait filtrer par statut correctement', async () => {
            await Book.insertMany([
                { title: 'Livre Statut A', author: ['A'], status: 'Terminé', userId: testUserId, genre: 'Filtre' },
                { title: 'Livre Statut B', author: ['B'], status: 'En cours', userId: testUserId, genre: 'Filtre' },
                { title: 'Livre Statut C', author: ['C'], status: 'Terminé', userId: testUserId, genre: 'Filtre' }
            ]);

            const response = await request(app)
                .get('/api/books?status=Termin%C3%A9') // %C3%A9 est l'encodage URL pour 'é'
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);

            expect(response.body.books.length).toBe(2);
            response.body.books.forEach(book => {
                expect(book.status).toBe('Terminé');
            });
        });

        it('devrait trier par titre ascendant correctement', async () => {
            await Book.insertMany([
                { title: 'Charlie', author: ['A'], status: 'À lire', userId: testUserId, genre: 'Tri' },
                { title: 'Alpha', author: ['B'], status: 'À lire', userId: testUserId, genre: 'Tri' },
                { title: 'Bravo', author: ['C'], status: 'À lire', userId: testUserId, genre: 'Tri' }
            ]);

            const response = await request(app)
                .get('/api/books?sortBy=title:asc')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);

            expect(response.body.books.length).toBe(3);
            expect(response.body.books[0].title).toBe('Alpha');
            expect(response.body.books[1].title).toBe('Bravo');
            expect(response.body.books[2].title).toBe('Charlie');
        });

    });

    describe('PUT /:id (Modifier un livre)', () => {
        let bookToUpdate; // Pour stocker un livre créé pour ces tests

        // Avant chaque test de ce bloc, crée un livre pour le testUser
        beforeEach(async () => {
            await Book.deleteMany({}); // Assure-toi que la collection est vide pour ce test spécifique
            bookToUpdate = await Book.create({
                title: 'Livre Original à Modifier',
                author: ['Auteur Original'],
                status: 'À lire',
                genre: 'Test PUT',
                userId: testUserId // Lié à notre utilisateur de test
            });
        });

        it('devrait modifier un livre si l\'utilisateur est authentifié et propriétaire', async () => {
            const updatedData = {
                title: 'Titre Modifié par Test',
                status: 'En cours',
                notes: 'Ceci est une note mise à jour.'
            };

            const response = await request(app)
                .put(`/api/books/${bookToUpdate._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(updatedData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('_id', bookToUpdate._id.toString());
            expect(response.body.title).toBe(updatedData.title);
            expect(response.body.status).toBe(updatedData.status);
            expect(response.body.notes).toBe(updatedData.notes);
            expect(response.body.userId.toString()).toBe(testUserId);

            // Vérification en base de données
            const bookInDb = await Book.findById(bookToUpdate._id);
            expect(bookInDb.title).toBe(updatedData.title);
            expect(bookInDb.status).toBe(updatedData.status);
        });

        it('devrait retourner une erreur 400 si le titre est vidé (validation)', async () => {
            const invalidUpdate = { title: '', author: ['Auteur Valide Pour Test'] };

            const response = await request(app)
                .put(`/api/books/${bookToUpdate._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(invalidUpdate)
                .expect('Content-Type', /json/)
                .expect(400);

                expect(response.body.message).toBe('Le titre ne peut pas être vide s\'il est fourni pour modification.');
        });

        it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
            const response = await request(app)
                .put(`/api/books/${bookToUpdate._id}`)
                .send({ title: 'Tentative non authentifiée' })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Non autorisé, aucun token fourni.');
        });

        it('devrait retourner une erreur 404 si le livre n\'existe pas', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/books/${nonExistentId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({ title: 'Titre pour ID inexistant', author: ['Auteur Test'] }) // AJOUTER UN AUTEUR
                .expect('Content-Type', /json/)
                .expect(404);
            expect(response.body).toHaveProperty('message', 'Livre non trouvé.');
        });

        it('devrait retourner une erreur 403 si l\'utilisateur essaie de modifier le livre d\'un autre', async () => {
            const anotherUserId = new mongoose.Types.ObjectId().toString();
            const anotherUserBook = await Book.create({ // S'ASSURER QUE CETTE PARTIE EST CORRECTE
                title: 'Livre d\'un Autre Utilisateur',
                author: ['Auteur Test'],
                status: 'Terminé',
                genre: 'Secret',
                userId: anotherUserId
            });
        
            const response = await request(app)
                .put(`/api/books/${anotherUserBook._id}`) // Maintenant anotherUserBook._id sera défini
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({ title: 'Tentative de Hack', author: ['Auteur Valide'] }) // Fournir un auteur
                .expect('Content-Type', /json/)
                .expect(403);
        
            expect(response.body).toHaveProperty('message', 'Accès non autorisé.');
        });
    
        describe('DELETE /:id (Supprimer un livre)', () => {
            let bookToDelete;
    
            // Avant chaque test de ce bloc, crée un livre pour le testUser
            beforeEach(async () => {
                await Book.deleteMany({}); // Vide la collection pour l'isolation
                bookToDelete = await Book.create({
                    title: 'Livre à Supprimer',
                    author: ['Auteur Jetable'],
                    status: 'Terminé',
                    genre: 'Test DELETE',
                    userId: testUserId // Lié à notre utilisateur de test
                });
            });
    
            it('devrait supprimer un livre si l\'utilisateur est authentifié et propriétaire', async () => {
                const response = await request(app)
                    .delete(`/api/books/${bookToDelete._id}`)
                    .set('Authorization', `Bearer ${testUserToken}`)
                    .expect('Content-Type', /json/)
                    .expect(200); // Ou 204 No Content si votre API ne renvoie pas de corps
    
                expect(response.body).toHaveProperty('message', 'Livre supprimé avec succès');
    
                // Vérification en base de données que le livre a bien été supprimé
                const bookInDb = await Book.findById(bookToDelete._id);
                expect(bookInDb).toBeNull();
            });
    
            it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
                const response = await request(app)
                    .delete(`/api/books/${bookToDelete._id}`)
                    .expect('Content-Type', /json/)
                    .expect(401);
    
                expect(response.body).toHaveProperty('message', 'Non autorisé, aucun token fourni.');
            });
    
            it('devrait retourner une erreur 404 si le livre n\'existe pas', async () => {
                const nonExistentId = new mongoose.Types.ObjectId();
                const response = await request(app)
                    .delete(`/api/books/${nonExistentId}`)
                    .set('Authorization', `Bearer ${testUserToken}`)
                    .expect('Content-Type', /json/)
                    .expect(404);
    
                expect(response.body).toHaveProperty('message', 'Livre non trouvé');
            });
    
            it('devrait retourner une erreur 403 si l\'utilisateur essaie de supprimer le livre d\'un autre', async () => {
                // Créer un livre pour un autre utilisateur
                const anotherUserId = new mongoose.Types.ObjectId().toString();
                const anotherUserBook = await Book.create({
                    title: 'Livre Protégé d\'un Autre',
                    author: ['Autre'],
                    status: 'À lire',
                    genre: 'Secret',
                    userId: anotherUserId
                });
    
                const response = await request(app)
                    .delete(`/api/books/${anotherUserBook._id}`)
                    .set('Authorization', `Bearer ${testUserToken}`) // Token de testUser
                    .expect('Content-Type', /json/)
                    .expect(403);
    
                expect(response.body).toHaveProperty('message', 'Accès non autorisé.');
    
                // Vérifier que le livre de l'autre utilisateur est toujours en base
                const bookInDb = await Book.findById(anotherUserBook._id);
                expect(bookInDb).toBeTruthy();
            });
        });

});
});
