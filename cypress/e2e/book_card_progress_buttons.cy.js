describe('Fonctionnalités des Cartes de Livre - Boutons de Progression', () => {
    const userCredentials = { email: 'testeur.cypress@example.com', password: 'password123' };
    const timestamp = Date.now(); // Un seul timestamp pour les deux livres
    const bookForProgressData = {
        title: "Livre Prog " + timestamp,
        author: ["Auteur Cypress"],
        status: "En cours", pageCount: 200, currentPage: 50, genre: "Cypress Prog"
    };
    const bookForFinishedData = {
        title: "Livre Fin " + timestamp,
        author: ["Auteur Cypress"],
        status: "Terminé", pageCount: 150, currentPage: 150, genre: "Cypress Fin"
    };
    let authToken;

    beforeEach(() => {
        cy.request('POST', 'http://localhost:3000/api/auth/login', userCredentials).then(loginResponse => {
            authToken = loginResponse.body.token;
            const userId = loginResponse.body.userId;

            // Mettre le token dans localStorage AVANT la première visite de l'application
            cy.visit('http://localhost:3000', {
                onBeforeLoad: (win) => {
                    win.localStorage.setItem('authToken', authToken);
                    win.localStorage.setItem('userInfo', JSON.stringify({ userId, username: loginResponse.body.username }));
                }
            });

            // Attendre que l'UI de base (post-login) soit là
            cy.get('#user-greeting', { timeout: 10000 }).should('contain.text', 'Bonjour');

            // Optionnel : Nettoyer les livres de test s'ils existent (plus robuste)
            // Cette partie est complexe à faire parfaitement sans connaître les ID à l'avance
            // Pour l'instant, on se fie à des titres uniques par run.

            // Créer les livres de test
            return cy.request({
                method: 'POST', url: 'http://localhost:3000/api/books',
                headers: { Authorization: `Bearer ${authToken}` }, body: { ...bookForProgressData, userId }
            }).its('status').should('eq', 201).then(() => {
                return cy.request({
                    method: 'POST', url: 'http://localhost:3000/api/books',
                    headers: { Authorization: `Bearer ${authToken}` }, body: { ...bookForFinishedData, userId }
                }).its('status').should('eq', 201);
            });
        }).then(() => {
            // Recharger la page pour que fetchBooks récupère les nouvelles données
            cy.reload();
            cy.get('#user-greeting').should('contain.text', 'Bonjour'); // Confirme que la session est maintenue

            // Attendre que les livres soient affichés
            cy.log('Attente de l\'affichage des livres de test...');
            cy.contains('.book-card h3', bookForProgressData.title, { timeout: 20000 }).should('be.visible');
            cy.contains('.book-card h3', bookForFinishedData.title, { timeout: 10000 }).should('be.visible');
            cy.log('Livres de test trouvés sur la page !');
        });
    });

    it('devrait afficher les boutons "+1 Page" et "Terminé" pour un livre "En cours" éligible', () => {
        cy.log(`Test 1 - Recherche du livre: "${bookForProgressData.title}"`);
        cy.contains('.book-card h3', bookForProgressData.title, { matchCase: false })
            .parents('.book-card').first().within(() => {
                cy.contains('Progression :').should('be.visible');
                cy.get('button.increment-page-btn').should('be.visible').and('contain.text', '+1 Page');
                cy.get('button.mark-as-read-card-btn').should('be.visible').and('contain.text', 'Terminé');
            });
    });

    it('NE devrait PAS afficher les boutons de progression pour un livre "Terminé"', () => {
        cy.log(`Test 2 - Recherche du livre: "${bookForFinishedData.title}"`);
        cy.contains('.book-card h3', bookForFinishedData.title, { matchCase: false })
            .parents('.book-card').first().within(() => {
                cy.get('button.increment-page-btn').should('not.exist');
                cy.get('button.mark-as-read-card-btn').should('not.exist');
            });
    });
});