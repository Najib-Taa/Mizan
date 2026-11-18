<!-- Mémoire architecturale du projet -->

# PROJECT MAP — MIZAN

## [TECH_STACK]

### Technologies
- **HTML5** : structure de l'interface.
- **CSS3** : mise en forme et design responsive.
- **JavaScript Vanilla (ES Modules)** : logique dynamique de l'application.
- **Fetch API** : communication avec l'API distante.
- **localStorage** : mémorisation de la devise sélectionnée.
- **Git & GitHub** : gestion des versions et hébergement du code.

### Data Source
- **API choisie : XAUS API**
- Documentation : https://xaus.com/api/
- API publique utilisée pour récupérer les cours de l'or et de l'argent.

### Technical Constraints
- Aucun framework JavaScript.
- Aucune bibliothèque de graphiques.
- Aucun backend ni base de données.
- Aucune authentification ni gestion de comptes.
- Les données des métaux proviennent de l'API distante.
- Les données distantes sont affichées avec `textContent`, sans utiliser `innerHTML`.
- Les identifiants du code sont en anglais.
- Les textes de l'interface sont en français.
- Aucun rafraîchissement automatique à une fréquence inférieure à 60 secondes.

---

## [SYSTEM_FLOW]

### 1. Initialisation
- `index.html` charge le fichier `js/main.js`.
- `main.js` initialise l'application.
- La devise précédemment choisie est récupérée depuis `localStorage`.

### 2. Récupération des données
- `main.js` demande les données nécessaires à `api.js`.
- `api.js` envoie les requêtes HTTP à XAUS API avec Fetch API.
- Les réponses JSON sont récupérées et vérifiées avant leur utilisation.

### 3. Affichage des prix
- Les données reçues sont transmises à `ui.js`.
- `ui.js` génère dynamiquement les cartes des métaux.
- Les prix, les devises et les dates de mise à jour sont affichés dans l'interface.

### 4. Changement de devise
- L'utilisateur sélectionne MAD, USD ou EUR.
- La nouvelle devise est enregistrée dans `localStorage`.
- Une nouvelle requête est envoyée à l'API.
- L'interface est mise à jour sans recharger la page.

### 5. Historique
- L'utilisateur choisit un métal et une période de 7 ou 30 jours.
- `history.js` traite les données historiques reçues.
- Un graphique simple est construit avec les technologies natives du navigateur.

**Point à vérifier :** la disponibilité des données historiques doit être confirmée pour chaque métal et chaque période. Aucune donnée historique manquante ne doit être inventée.

### 6. Estimateur de bijou
- L'utilisateur saisit un poids en grammes.
- Il sélectionne le métal concerné.
- `calculator.js` calcule la valeur estimée à partir du prix courant.
- Les saisies invalides sont refusées avec un message explicatif.

### 7. Gestion des erreurs
L'application doit gérer les états suivants :
- Loading : chargement des données.
- Success : données récupérées avec succès.
- Error : problème réseau, erreur HTTP ou réponse JSON invalide.

Un bouton « Réessayer » permet de relancer la dernière requête.

---

## [ARCHITECTURE]

### Project Structure

```text
Mizan/
│
├── index.html
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── api.js
│   ├── ui.js
│   ├── calculator.js
│   └── history.js
│
├── samples/
│   ├── prices-reponse.json
│   └── history-reponse.json
│
├── captures/
│
├── .gitignore
├── README.md
└── PROJECT_MAP.md
```

### File Responsibilities

| File | Responsibility |
|---|---|
| `index.html` | Structure principale de l'application |
| `css/style.css` | Styles et mise en page |
| `js/main.js` | Point d'entrée et coordination des modules |
| `js/api.js` | Communication avec XAUS API |
| `js/ui.js` | Affichage et mise à jour de l'interface |
| `js/calculator.js` | Calcul de la valeur estimée des bijoux |
| `js/history.js` | Traitement et représentation de l'historique |
| `samples/prices-reponse.json` | Exemple de réponse JSON des prix courants |
| `samples/history-reponse.json` | Exemple de réponse JSON historique |
| `captures/` | Captures des différents états de l'application |
| `README.md` | Documentation du projet |
| `PROJECT_MAP.md` | Documentation de l'architecture technique |
| `.gitignore` | Fichiers exclus du suivi Git |

### Architecture Principles
- Chaque module possède une responsabilité précise.
- Les appels réseau sont séparés de la présentation.
- Les calculs sont séparés de la manipulation du DOM.
- Les fonctions restent simples et faciles à comprendre.
- Aucune fonctionnalité supplémentaire n'est ajoutée sans justification dans le brief.

---

## [ORPHANS & PENDING]

### Pending Verification
- [ ] Vérifier les réponses JSON réelles de XAUS API.
- [ ] Confirmer les paramètres nécessaires pour les prix courants.
- [ ] Confirmer la disponibilité des données historiques pour l'or et l'argent.
- [ ] Vérifier la possibilité de calculer les variations par rapport à la période précédente.
- [ ] Vérifier les conversions entre MAD, USD et EUR.
- [ ] Vérifier le comportement de l'API en cas d'erreur ou d'indisponibilité.

### Pending Development
- [ ] Construire la structure HTML de l'interface.
- [ ] Développer la connexion à l'API.
- [ ] Afficher dynamiquement les cartes de prix.
- [ ] Ajouter le sélecteur de devise.
- [ ] Développer l'historique et le graphique.
- [ ] Développer l'estimateur de bijou.
- [ ] Gérer les états de chargement, succès et erreur.
- [ ] Tester les fonctionnalités et les erreurs.
- [ ] Ajouter les captures d'écran.
- [ ] Compléter le README.
- [ ] Préparer la démonstration finale.

### Optional Bonus
- [ ] Ajouter un journal des requêtes HTTP pour faciliter le débogage.

### Project Status
**Phase actuelle :** Initialisation du projet et préparation de l'architecture.

**Next milestone :** API Discovery — vérification des endpoints et des réponses JSON réelles avant le développement.

