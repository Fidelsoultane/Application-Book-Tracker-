// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app'); // Chemin vers votre fichier app.js/server.js principal
const User = require('../src/models/User'); // Chemin vers votre modèle User
const bcrypt = require('bcrypt');

let mongoServer;

// Avant tous les tests de ce fichier
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create(); // Démarre un serveur MongoDB en mémoire
    const mongoUri = mongoServer.getUri(); // Récupère son URI
    await mongoose.connect(mongoUri); // Connecte Mongoose à cette DB en mémoire
    console.log("MongoDB Memory Server connecté pour les tests Auth ! URI:", mongoUri);
});

// Après tous les tests de ce fichier
afterAll(async () => {
    await mongoose.disconnect(); // Déconnecte Mongoose
    await mongoServer.stop(); // Arrête le serveur MongoDB en mémoire
    console.log("MongoDB Memory Server déconnecté pour les tests Auth.");
});

// Avant chaque test individuel
beforeEach(async () => {
    await User.deleteMany({}); // Vide la collection users pour s'assurer que les tests sont isolés
});

// --- Début des tests pour l'Authentification ---
describe('Routes /api/auth', () => {

    // Test pour l'inscription réussie
    describe('POST /register', () => {
        it('devrait créer un nouvel utilisateur avec des données valides', async () => {
            const userData = {
                username: 'testuserJest',
                email: 'jest@example.com',
                password: 'password123'
            };

            const response = await request(app) // 'app' est votre instance Express
                .post('/api/auth/register')      // La route à tester
                .send(userData)                  // Le corps de la requête
                .expect('Content-Type', /json/) // S'attend à une réponse JSON
                .expect(201);                    // S'attend à un statut HTTP 201 (Created)

            // Vérifications sur la réponse
            expect(response.body).toHaveProperty('message', 'Utilisateur créé avec succès !');
            expect(response.body).toHaveProperty('userId');
            expect(response.body).toHaveProperty('username', userData.username);

            // Vérification en base de données (optionnel mais bon)
            const userInDb = await User.findById(response.body.userId);
            expect(userInDb).toBeTruthy(); // L'utilisateur doit exister
            expect(userInDb.email).toBe(userData.email.toLowerCase());
        });

        it('devrait retourner une erreur 400 si des champs sont manquants', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'incompleteUser' }) // Email et mot de passe manquants
                .expect(400);

            expect(response.body).toHaveProperty('message');
            // Vous pouvez être plus précis sur le message d'erreur attendu
        });

        it('devrait retourner une erreur 409 si l\'email existe déjà', async () => {
            // Crée un utilisateur initial
            await User.create({ username: 'existingUser', email: 'exists@example.com', password: 'password123' });

            const response = await request(app)
                .post('/api/auth/register')
                .send({ username: 'newUser', email: 'exists@example.com', password: 'newPassword123' })
                .expect(409);

            expect(response.body).toHaveProperty('message', 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà.');
        });
    });

    describe('POST /login', () => {
        let testUser;
        const plainPassword = 'password123';

        // Crée un utilisateur avant les tests de login
        beforeEach(async () => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            testUser = await User.create({
                username: 'loginUser',
                email: 'login@example.com',
                password: hashedPassword
            });
        });

        it('devrait connecter un utilisateur avec des identifiants valides et retourner un token', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: plainPassword
                })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Connexion réussie !');
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).not.toBeNull();
            expect(response.body).toHaveProperty('userId', testUser._id.toString());
            expect(response.body).toHaveProperty('username', testUser.username);
        });

        it('devrait retourner une erreur 401 pour un mot de passe incorrect', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Identifiants invalides.');
        });

        it('devrait retourner une erreur 401 pour un email inexistant', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nouser@example.com',
                    password: 'password123'
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toHaveProperty('message', 'Identifiants invalides.');
        });

        it('devrait retourner une erreur 400 si l\'email est manquant', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Email et mot de passe sont obligatoires.');
        });

        it('devrait retourner une erreur 400 si le mot de passe est manquant', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'login@example.com' })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('message', 'Email et mot de passe sont obligatoires.');
        });
    });

});