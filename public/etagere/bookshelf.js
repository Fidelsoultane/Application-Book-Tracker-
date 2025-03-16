// bookshelf.js

// --- Données d'étagères exemples (pour commencer, données statiques) ---
export let etageresExemples = [
  { id: 1, nom: "Tous mes livres", nombreLivres: 150 },
  { id: 2, nom: "À Lire", nombreLivres: 35 },
  { id: 3, nom: "Science-Fiction", nombreLivres: 62 },
  { id: 4, nom: "Romans Historiques", nombreLivres: 28 },
  { id: 5, nom: "Cuisine et Recettes", nombreLivres: 120 },
  { id: 6, nom: "Développement Personnel", nombreLivres: 75 },
  { id: 7, nom: "Voyages et Aventures", nombreLivres: 90 },
];

export function creerCarteEtagereHTML(etagere) {
  const carteEtagere = document.createElement('li');
  carteEtagere.className = 'mb-2 p-3 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer';

  const nomEtagere = document.createElement('h3');
  nomEtagere.textContent = etagere.nom;
  nomEtagere.className = 'text-lg font-semibold text-gray-100';

  const nombreLivres = document.createElement('p');
  nombreLivres.textContent = `${etagere.nombreLivres} livres`;
  nombreLivres.className = 'text-sm text-gray-300';

  carteEtagere.appendChild(nomEtagere);
  carteEtagere.appendChild(nombreLivres);

  return carteEtagere;
}

export

   