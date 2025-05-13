// tests/etagere.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app'); // Chemin vers votre app Express
const User = require('../src/models/User');
const Etagere = require('../src/models/Etagere'); // Votre modèle Etagere
const bcrypt = require('bcrypt');

let mongoServer;
let testUserToken;
let testUserId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log("MongoDB Memory Server connecté pour les tests Etagere ! URI:", mongoUri);

    // Nettoyer la collection User et créer un utilisateur de test frais
    await User.deleteMany({});
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        username: 'etagereTestUser',
        email: 'etageretest@example.com',
        password: hashedPassword
    });
    testUserId = user._id.toString();

    const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'etageretest@example.com', password: password });

    if (loginResponse.body.token) {
        testUserToken = loginResponse.body.token;
        console.log("Utilisateur de test connecté, token obtenu pour les tests d'étagères.");
    } else {
        throw new Error("Échec de la connexion de l'utilisateur de test pour les tests d'étagères.");
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log("MongoDB Memory Server déconnecté pour les tests Etagere.");
});

// Vider la collection etageres avant chaque test
beforeEach(async () => {
    await Etagere.deleteMany({});
});

// --- Début des Tests pour les Routes /api/etageres ---
describe('Routes /api/etageres', () => {

    // --- Tests pour POST / (Créer une étagère) ---
    describe('POST / (Créer une étagère)', () => {
        it('devrait créer une nouvelle étagère si l\'utilisateur est authentifié', async () => {
            const etagereData = { name: 'Fantaisie Épique' };

            const response = await request(app)
                .post('/api/etageres')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(etagereData)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('_id');
            expect(response.body.name).toBe(etagereData.name);
            expect(response.body.userId.toString()).toBe(testUserId);

            const etagereInDb = await Etagere.findById(response.body._id);
            expect(etagereInDb).toBeTruthy();
            expect(etagereInDb.name).toBe(etagereData.name);
        });

        it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
            const response = await request(app)
                .post('/api/etageres')
                .send({ name: 'Étagère sans token' })
                .expect('Content-Type', /json/)
                .expect(401);
            expect(response.body.message).toContain('aucun token fourni');
        });

        it('devrait retourner une erreur 400 si le nom est manquant', async () => {
            const response = await request(app)
                .post('/api/etageres')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({}) // Nom manquant
                .expect('Content-Type', /json/)
                .expect(400);
            expect(response.body.message).toBe('Le nom de l\'étagère est obligatoire et ne peut pas être vide.'); // MESSAGE EXACT
        });

        it('devrait retourner une erreur 409 si l\'utilisateur essaie de créer une étagère avec un nom existant pour lui', async () => {
            // Crée une première étagère
            await Etagere.create({ name: 'Science-Fiction', userId: testUserId });

            // Tente de recréer la même
            const response = await request(app)
                .post('/api/etageres')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({ name: 'Science-Fiction' }) // Nom dupliqué pour cet utilisateur
                .expect('Content-Type', /json/)
                .expect(409);
            expect(response.body.message).toContain('existe déjà');
        });
    });

    // --- Tests pour GET / (Récupérer les étagères de l'utilisateur) ---
    describe('GET / (Récupérer les étagères)', () => {
        it('devrait retourner les étagères de l\'utilisateur authentifié', async () => {
            await Etagere.create([
                { name: 'Thriller', userId: testUserId },
                { name: 'Biographie', userId: testUserId }
            ]);
            // Étagère pour un autre utilisateur (ne doit pas être retournée)
            await Etagere.create({ name: 'Autre Genre', userId: new mongoose.Types.ObjectId() });


            const response = await request(app)
                .get('/api/etageres')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBe(2); // Seulement les 2 étagères de testUser
            expect(response.body.some(e => e.name === 'Thriller')).toBeTruthy();
            expect(response.body.some(e => e.name === 'Biographie')).toBeTruthy();
        });

        it('devrait retourner un tableau vide si l\'utilisateur n\'a pas d\'étagères', async () => {
            const response = await request(app)
                .get('/api/etageres')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
            expect(response.body).toEqual([]);
        });

        it('devrait retourner une erreur 401 si aucun token n\'est fourni', async () => {
             await request(app)
                .get('/api/etageres')
                .expect('Content-Type', /json/)
                .expect(401);
        });
    });


    // --- TODO: Tests pour PUT /api/etageres/:id (Modifier une étagère) ---
    describe('PUT /:id (Modifier une étagère)', () => {
        let etagereToUpdate;
        beforeEach(async () => {
            etagereToUpdate = await Etagere.create({ name: 'Ancien Nom', userId: testUserId });
        });

        it('devrait modifier une étagère si authentifié et propriétaire', async () => {
            const response = await request(app)
                .put(`/api/etageres/${etagereToUpdate._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({ name: 'Nouveau Nom Étagère' })
                .expect(200);
            expect(response.body.name).toBe('Nouveau Nom Étagère');
        });

        it('devrait retourner 403 si essaie de modifier étagère d\'un autre', async () => {
            const otherUserEtagere = await Etagere.create({ name: 'Étagère Autre User', userId: new mongoose.Types.ObjectId() });
            await request(app)
                .put(`/api/etageres/${otherUserEtagere._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({ name: 'Tentative Modif' })
                .expect(403);
        });
        // Ajouter tests pour nom vide, nom dupliqué pour le même user (409)
    });


    // --- TODO: Tests pour DELETE /api/etageres/:id (Supprimer une étagère) ---
    describe('DELETE /:id (Supprimer une étagère)', () => {
        let etagereToDelete;
        beforeEach(async () => {
            etagereToDelete = await Etagere.create({ name: 'À Supprimer', userId: testUserId });
        });

        it('devrait supprimer une étagère si authentifié et propriétaire', async () => {
            await request(app)
                .delete(`/api/etageres/${etagereToDelete._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200); // Ou 204 si pas de corps de message

            const etagereInDb = await Etagere.findById(etagereToDelete._id);
            expect(etagereInDb).toBeNull();
        });

        it('devrait retourner 403 si essaie de supprimer étagère d\'un autre', async () => {
            const otherUserEtagere = await Etagere.create({ name: 'Étagère Autre User', userId: new mongoose.Types.ObjectId() });
            await request(app)
                .delete(`/api/etageres/${otherUserEtagere._id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(403);
        });
    });

}); 