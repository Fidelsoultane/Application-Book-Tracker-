# Book Tracker - Application de Suivi de Lectures Personnalisées

Book Tracker est une application web full-stack conçue pour aider les utilisateurs à cataloguer, suivre et gérer leur bibliothèque personnelle ainsi que leur progression de lecture. Chaque utilisateur dispose d'un espace sécurisé pour ses données grâce à un système d'authentification basé sur JWT.

**Lien vers l'application déployée (Render.com) :** (https://application-book-tracker.onrender.com)


## Fonctionnalités Principales

* **Gestion des Utilisateurs :**
    * Inscription et connexion sécurisées.
    * Mots de passe hachés (bcrypt).
    * Authentification par token JWT.
* **Gestion des Livres (CRUD) :**
    * Ajout manuel complet.
    * Pré-remplissage via ISBN (API Google Books).
    * Recherche par titre (API Google Books) et ajout à la collection.
    * Affichage détaillé des livres sous forme de cartes.
    * Modification et suppression des livres.
* **Suivi de Lecture Personnalisé :**
    * Statuts de lecture ("À lire", "En cours", "Terminé", "Souhaité").
    * Suivi de la page actuelle avec barre de progression.
    * Boutons d'action rapide ("+1 Page", "Terminé") sur les cartes.
    * Notation personnelle (0-5 étoiles).
    * Prise de notes pour chaque livre (consultables via modale).
    * Gestion des tags.
    * Dates de début et de fin de lecture.
* **Organisation :**
    * Création et gestion d'étagères/genres personnalisées (uniques par utilisateur).
    * Filtrage des livres (statut, genre, tags, éditeur).
    * Tri des livres (date d'ajout, titre, auteur, etc.).
    * Pagination.
* **Interface Utilisateur :**
    * Développée en HTML, JavaScript Vanilla, et stylisée avec Tailwind CSS.
    * Notifications utilisateur (Toastify.js).
    * Design responsive pour une utilisation sur différents appareils.

## Technologies Utilisées

* **Frontend :**
    * HTML5
    * Tailwind CSS (via CDN)
    * JavaScript Vanilla (ES6+ Modules)
    * Font Awesome (Icônes)
    * Toastify.js (Notifications)
* **Backend :**
    * Node.js
    * Express.js
    * Mongoose (ODM pour MongoDB)
    * `bcrypt.js` (Hachage des mots de passe)
    * `jsonwebtoken` (Gestion des JWT)
    * `dotenv` (Variables d'environnement)
* **Base de Données :**
    * MongoDB (NoSQL)
    * MongoDB Atlas (Hébergement cloud)
* **Tests :**
    * Backend : Jest, Supertest, MongoDB Memory Server
    * Frontend (E2E) : Cypress (introduction)
* **Déploiement :**
    * Render.com

## Installation et Lancement Local

Pour lancer ce projet localement, suivez ces étapes :

1.  **Prérequis :**
    * Node.js et npm  installés.
    * Git installé.
    * Un compte MongoDB Atlas (ou une instance MongoDB locale).

2.  **Cloner le Dépôt :**
    ```bash
    git clone https://github.com/Fidelsoultane/Application-Book
    cd Book-Tracker
    ```

3.  **Installer les Dépendances Backend :**
    ```bash
    npm install
    ```

4.  **Configurer les Variables d'Environnement :**
    * Créez un fichier `.env` à la racine du projet.
    * Ajoutez les variables nécessaires :
        ```env
        PORT=3000
        MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
        JWT_SECRET=VOTRE_CLE_SECRETE_POUR_JWT_TRES_COMPLEXE
        JWT_EXPIRES_IN=1d 
        ```
        *(Remplacez par vos propres informations MongoDB Atlas et choisissez une clé secrète robuste pour JWT_SECRET)*

5.  **Lancer le Serveur de Développement Backend :**
    ```bash
    npm run start
    ```
    Le serveur devrait démarrer sur `http://localhost:3000` (ou le port défini).

6.  **Accéder à l'Application Frontend :**
    * Ouvrez votre navigateur et allez à l'adresse `http://localhost:3000`.
    * Le frontend est servi par le même serveur Express.

## Structure du Projet (Principaux Dossiers)

Book-Tracker/
├── public/             # Fichiers statiques frontend (html, js client, images)
│   ├── js/index.js
│   └── index.html
├── src/                # Code source backend
│   ├── app.js          # Point d'entrée du serveur Express
│   ├── models/         # Schémas et modèles Mongoose (User.js, Book.js, Etagere.js)
│   ├── routes/         # Logique des routes API (authRoutes.js, bookRoutes.js, etagereRoutes.js)
│   └── middleware/     # Middlewares (authMiddleware.js)
├── tests/              # Tests automatisés backend (Jest/Supertest)
├── cypress/            # Tests automatisés frontend E2E (Cypress)
├── .env                # (À créer) Variables d'environnement
├── .gitignore
├── package.json
└── README.md

## Tests

* **Pour lancer les tests backend (Jest) :**
    ```bash
    npm test
    ```
* **Pour ouvrir Cypress et lancer les tests frontend E2E :**
    ```bash
    npx cypress open 
    ```
    *(Assurez-vous que le serveur de développement local est en cours d'exécution sur `http://localhost:3000`)*

## Auteur

* **MOHAMED SOULTANE Mohamed Fadel**
    * https://github.com/Fidelsoultane
   

## Remarques
Ce projet a été développé dans le cadre de la formation de Développeur Web et Web Mobile du Groupe AFEC - Talent School. Il vise à démontrer la maîtrise des compétences acquises tout au long du cursus.






    
## Améliorations prévues
** Finalisation du Design Responsive
** Affichage/Masquage du Mot de Passe
** Gestion de Profil Utilisateur

📄 Licence
Ce projet est sous licence MIT.
