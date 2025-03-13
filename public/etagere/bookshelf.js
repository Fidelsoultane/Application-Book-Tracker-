// --- Données d'étagères exemples (pour commencer, données statiques) ---
const etageresExemples = [
      { id: 1, nom: "Tous mes livres", nombreLivres: 150 },
      { id: 2, nom: "À Lire", nombreLivres: 35 },
      { id: 3, nom: "Science-Fiction", nombreLivres: 62 },
      { id: 4, nom: "Romans Historiques", nombreLivres: 28 },
      { id: 5, nom: "Cuisine et Recettes", nombreLivres: 120 },
      { id: 6, nom: "Développement Personnel", nombreLivres: 75 },
      { id: 7, nom: "Voyages et Aventures", nombreLivres: 90 },
    ];
    
    function creerCarteEtagereHTML(etagere) {
      // Fonction pour créer le code HTML d'une carte d'étagère à partir des données d'une étagère
    
      const carteEtagere = document.createElement('li'); // Élément de liste pour chaque carte
      carteEtagere.className = 'mb-2 p-3 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer'; // Classes Tailwind CSS pour la carte
    
      const nomEtagere = document.createElement('h3');
      nomEtagere.textContent = etagere.nom;
      nomEtagere.className = 'text-lg font-semibold text-gray-100'; // Classes Tailwind CSS pour le nom
    
      const nombreLivres = document.createElement('p');
      nombreLivres.textContent = `${etagere.nombreLivres} livres`; // Afficher le nombre de livres
      nombreLivres.className = 'text-sm text-gray-300'; // Classes Tailwind CSS pour le nombre de livres
    
      carteEtagere.appendChild(nomEtagere);
      carteEtagere.appendChild(nombreLivres);
    
      return carteEtagere; // Retourner l'élément HTML de la carte
    }
    
    function afficherSectionEtagere(contenuPrincipalElement) {
      // Fonction appelée depuis menu.js pour afficher le contenu de la section "Étagères"
    
      // 1. Effacer le contenu précédent de la zone principale
  contenuPrincipalElement.innerHTML = "";

  // 2. Parcourir le tableau des étagères exemples et créer une carte HTML pour chaque étagère
    etageresExemples.forEach(etagere => {
        const carteHTML = creerCarteEtagereHTML(etagere); // Appeler la fonction pour créer la carte HTML
        contenuPrincipalElement.appendChild(carteHTML); // Ajouter la carte HTML *DIRECTEMENT* à contenuPrincipalElement (zone principale)
      });
    }

   