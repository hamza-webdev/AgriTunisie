# **Structure du Projet AgriTunisie Connect: Frontend, Backend et Base de Données**

## **1\. Introduction**

Ce document décrit une proposition de structure pour le projet d'application web mobile "AgriTunisie Connect". Il couvre l'arborescence générale du projet, l'architecture frontend (basée sur React), l'architecture backend (basée sur Node.js avec Express.js), et le schéma de la base de données PostgreSQL (avec l'extension PostGIS pour les fonctionnalités géospatiales). L'objectif est de fournir une fondation claire et modulable pour le développement.

## **2\. Arborescence Générale du Projet**

Une structure monorepo ou polyrepo peut être envisagée. Pour cet exemple, nous partons sur une structure de dossiers séparés au sein d'un même dépôt principal pour simplifier.

agritunisie-connect/  
├── frontend/         \# Code source de l'application frontend (React)  
├── backend/          \# Code source de l'application backend (Node.js/Express)  
├── database/         \# Scripts SQL pour la création de la base, migrations, seeds  
│   ├── migrations/  
│   └── seeds/  
├── docs/             \# Documentation du projet (API, architecture, etc.)  
└── README.md         \# Informations générales sur le projet

## **3\. Partie Frontend (Exemple avec React)**

L'interface utilisateur sera une Progressive Web App (PWA) pour assurer une accessibilité maximale.

### **3.1. Technologies Clés Suggérées**

* **Framework :** React.js (avec Create React App ou Vite pour le setup)  
* **Routage :** React Router  
* **Gestion d'état :** Redux Toolkit, Zustand, ou React Context API (selon la complexité)  
* **Appels API :** Axios ou Fetch API  
* **UI Components :** Tailwind CSS (comme utilisé dans l'infographie), ou une librairie de composants comme Material-UI, Ant Design.  
* **Cartographie :** Leaflet.js (avec React-Leaflet) ou Google Maps API (via wrapper React)  
* **Graphiques :** Chart.js (avec React-Chartjs-2)  
* **Tests :** Jest, React Testing Library

### **3.2. Structure des Dossiers (dans frontend/src/)**

frontend/  
└── src/  
    ├── assets/               \# Fichiers statiques (images, polices, icônes, styles globaux CSS/SCSS)  
    │   ├── images/  
    │   ├── fonts/  
    │   └── styles/  
    ├── components/           \# Composants UI réutilisables et génériques  
    │   ├── common/           \# Boutons, Cartes, Modales, Champs de saisie, etc.  
    │   │   ├── Button.jsx  
    │   │   └── Card.jsx  
    │   ├── layout/           \# Composants de structure (Navbar, Sidebar, Footer)  
    │   │   └── Navbar.jsx  
    │   └── specific/         \# Composants plus spécifiques mais réutilisables dans plusieurs features  
    │       ├── MapDisplay.jsx  
    │       └── ChartRenderer.jsx  
    ├── features/             \# Logique et composants spécifiques à chaque module/fonctionnalité de l'app  
    │   ├── auth/             \# Authentification (Login, Register, Profile)  
    │   │   ├── components/  
    │   │   ├── pages/  
    │   │   └── services/authService.js  
    │   ├── culture/          \# Module Assistant de Culture  
    │   │   ├── components/   \# CultureCard, CultureForm, PlantingCalendar  
    │   │   ├── pages/        \# CultureListPage, CultureDetailPage  
    │   │   └── services/cultureService.js  
    │   ├── elevage/          \# Module Assistant d'Élevage  
    │   ├── prix/             \# Module Bourse des Prix  
    │   ├── meteo/            \# Module Météo Agricole  
    │   ├── cartographie/     \# Module Cartographie et Gestion des Parcelles  
    │   │   ├── components/   \# FieldEditorCanvas, ParcelInfoCard  
    │   │   └── pages/        \# MapEditorPage  
    │   ├── communaute/       \# Module Communauté et Informations  
    │   └── gemini/           \# Fonctionnalités liées à l'IA Gemini  
    │       ├── components/   \# GeminiAIChat.jsx, GeminiReportView.jsx  
    │       └── services/geminiApiService.js  
    ├── hooks/                \# Custom Hooks (ex: useAuth, useForm, useGeolocation)  
    ├── layouts/              \# Gabarits de page principaux (ex: MainLayout, DashboardLayout)  
    ├── pages/                \# Pages principales de l'application (assemblage de composants et features)  
    │   ├── HomePage.jsx  
    │   └── NotFoundPage.jsx  
    ├── router/               \# Configuration des routes de l'application (index.js utilisant React Router)  
    ├── services/             \# Services globaux, configuration des appels API (api.js)  
    ├── store/                \# Gestion d'état global (ex: Redux slices, Zustand store)  
    ├── translations/         \# Fichiers de traduction (i18n)  
    ├── utils/                \# Fonctions utilitaires (formatters, validators, helpers)  
    ├── App.js                \# Composant racine de l'application  
    ├── index.js              \# Point d'entrée de l'application React  
    └── reportWebVitals.js

### **3.3. Exemples de Composants Clés (Illustratif)**

* **FieldEditorCanvas (features/cartographie/components/) :** Composant utilisant Leaflet ou Google Maps pour permettre à l'utilisateur de dessiner ses parcelles.  
* **PlantingCalendar (features/culture/components/) :** Affiche un calendrier des tâches agricoles personnalisé.  
* **PriceDashboardChart (features/prix/components/) :** Graphique affichant l'évolution des prix (utilisant Chart.js).  
* **GeminiAIChat (features/gemini/components/) :** Interface de chat pour interagir avec l'IA Gemini pour des conseils.

## **4\. Partie Backend (Exemple avec Node.js et Express.js)**

Le backend gérera la logique métier, l'authentification, les interactions avec la base de données et l'intégration avec des APIs externes (Météo, Gemini).

### **4.1. Technologies Clés Suggérées**

* **Framework :** Express.js  
* **Langage :** JavaScript (ou TypeScript pour une meilleure maintenabilité)  
* **ORM/Query Builder :** Sequelize (pour PostgreSQL), Prisma, ou pg (node-postgres) directement.  
* **Authentification :** JWT (JSON Web Tokens)  
* **Validation des données :** Joi, express-validator  
* **Gestion des erreurs :** Middleware personnalisé  
* **Tests :** Jest, Supertest  
* **API Gemini :** SDK officiel de Google ou appels HTTP directs.

### **4.2. Structure des Dossiers (dans backend/)**

backend/  
├── src/  
│   ├── config/             \# Configuration (database, server, .env variables, API keys)  
│   │   ├── db.config.js  
│   │   ├── server.config.js  
│   │   └── gemini.config.js  
│   ├── controllers/        \# Logique de gestion des requêtes et réponses HTTP  
│   │   ├── auth.controller.js  
│   │   ├── culture.controller.js  
│   │   ├── parcelle.controller.js  
│   │   ├── prix.controller.js  
│   │   ├── meteo.controller.js  
│   │   └── gemini.controller.js  
│   ├── middleware/         \# Middlewares (authentification, gestion des erreurs, validation)  
│   │   ├── auth.middleware.js  
│   │   └── error.middleware.js  
│   ├── models/             \# Définitions des modèles de données (ex: Sequelize models)  
│   │   ├── User.model.js  
│   │   ├── Parcelle.model.js  
│   │   └── Culture.model.js  
│   ├── routes/             \# Définition des routes de l'API  
│   │   ├── index.routes.js   \# Routeur principal  
│   │   ├── auth.routes.js  
│   │   └── culture.routes.js  
│   ├── services/           \# Logique métier complexe, interaction avec APIs externes  
│   │   ├── culture.service.js  
│   │   ├── meteo.service.js      \# Intégration API Météo  
│   │   └── gemini.service.js     \# Logique d'appel à l'API Gemini  
│   ├── utils/              \# Fonctions utilitaires (logger, password hashing, API helpers)  
│   └── jobs/               \# Tâches planifiées (ex: collecte de prix, envoi de notifications)  
├── tests/                  \# Tests unitaires et d'intégration  
├── server.js               \# Point d'entrée du serveur Express  
├── .env                    \# Variables d'environnement (clés API, config DB)  
└── package.json

### **4.3. API Endpoints Principaux (Exemples)**

* **Authentification & Utilisateurs:**  
  * POST /api/auth/register  
  * POST /api/auth/login  
  * GET /api/users/me (protégé)  
  * PUT /api/users/me (protégé)  
* **Parcelles:**  
  * POST /api/parcelles (protégé, créer une parcelle avec sa géométrie)  
  * GET /api/parcelles/user (protégé, lister les parcelles de l'utilisateur)  
  * GET /api/parcelles/:id (protégé)  
  * PUT /api/parcelles/:id (protégé)  
  * DELETE /api/parcelles/:id (protégé)  
* **Cultures (Catalogue & Conseils):**  
  * GET /api/cultures (catalogue général)  
  * GET /api/cultures/:id  
  * GET /api/cultures/parcelle/:parcelleId/calendrier (protégé)  
* **Élevage:**  
  * GET /api/elevage/animaux-types  
  * POST /api/elevage/rations/calculer (protégé)  
* **Prix des Marchés:**  
  * GET /api/prix?produitId=\&regionId=\&dateStart=\&dateEnd=  
* **Météo:**  
  * GET /api/meteo/previsions?lat=\&lon= (utilise un service externe)  
  * GET /api/meteo/historique?lat=\&lon=\&dateStart=\&dateEnd=  
* **Communauté (Forum):**  
  * GET /api/forum/posts  
  * POST /api/forum/posts (protégé)  
  * POST /api/forum/posts/:postId/commentaires (protégé)  
* **Intégration IA Gemini:**  
  * POST /api/gemini/conseil-culture (protégé, prend des données de parcelle/culture en entrée)  
  * POST /api/gemini/optimiser-ration (protégé)  
  * POST /api/gemini/analyser-actualite (protégé, prend une URL ou un texte d'actualité)

## **5\. Base de Données (PostgreSQL avec PostGIS)**

PostgreSQL est un SGBDR puissant, et son extension PostGIS est idéale pour stocker et interroger des données géospatiales (les parcelles des agriculteurs).

### **5.1. Schéma Général des Relations (Description)**

* Un utilisateur peut avoir plusieurs parcelles.  
* Une parcelle peut être associée à une culture\_en\_cours (référence à la table cultures).  
* Des interventions\_culturelles sont liées à une parcelle et potentiellement à une culture.  
* La table prix\_marches référence des produits\_agricoles et des regions.  
* Les posts\_forum sont créés par des utilisateurs et peuvent avoir plusieurs commentaires\_forum.  
* Les logs\_interactions\_gemini enregistrent les requêtes et réponses de l'IA pour un utilisateur.

### **5.2. Description des Tables Principales**

(Les types SERIAL PRIMARY KEY ou UUID PRIMARY KEY sont implicites pour les id)

* **utilisateurs**  
  * id: SERIAL PRIMARY KEY  
  * nom\_complet: VARCHAR(255)  
  * email: VARCHAR(255) UNIQUE NOT NULL  
  * mot\_de\_passe\_hash: VARCHAR(255) NOT NULL  
  * numero\_telephone: VARCHAR(20) UNIQUE  
  * role: VARCHAR(50) DEFAULT 'agriculteur' (ex: 'agriculteur', 'admin')  
  * localisation\_preference\_lat: DECIMAL(9,6)  
  * localisation\_preference\_lon: DECIMAL(9,6)  
  * date\_creation: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
  * derniere\_connexion: TIMESTAMPTZ  
* **parcelles**  
  * id: SERIAL PRIMARY KEY  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE  
  * nom\_parcelle: VARCHAR(255) NOT NULL  
  * description: TEXT  
  * geometrie: GEOMETRY(Polygon, 4326\) NOT NULL (Stocke les coordonnées de la parcelle)  
  * superficie\_calculee\_ha: DECIMAL(10,4)  
  * type\_sol\_predominant: VARCHAR(100)  
  * culture\_actuelle\_id: INTEGER REFERENCES cultures\_catalogue(id) NULL  
  * date\_creation: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
* **cultures\_catalogue** (Informations générales sur les types de cultures)  
  * id: SERIAL PRIMARY KEY  
  * nom\_culture: VARCHAR(255) UNIQUE NOT NULL  
  * description\_generale: TEXT  
  * periode\_semis\_ideale\_debut: VARCHAR(50)  
  * periode\_semis\_ideale\_fin: VARCHAR(50)  
  * besoins\_eau\_mm\_cycle: INTEGER  
  * type\_sol\_recommande: VARCHAR(255)  
  * notes\_fertilisation: TEXT  
  * sensibilite\_maladies\_communes: TEXT  
* **interventions\_culturelles** (Journal de bord des parcelles)  
  * id: SERIAL PRIMARY KEY  
  * parcelle\_id: INTEGER REFERENCES parcelles(id) ON DELETE CASCADE  
  * type\_intervention: VARCHAR(100) NOT NULL (ex: 'Semis', 'Fertilisation', 'Traitement', 'Irrigation', 'Récolte')  
  * date\_intervention: DATE NOT NULL  
  * description\_intervention: TEXT  
  * produits\_utilises: JSONB (ex: \[{"nom": "Engrais NPK", "quantite": 50, "unite": "kg"}\])  
  * cout\_estime\_dinars: DECIMAL(10,2)  
* **animaux\_types\_catalogue**  
  * id: SERIAL PRIMARY KEY  
  * nom\_espece: VARCHAR(100) UNIQUE NOT NULL (ex: 'Ovin', 'Bovin Laitier', 'Volaille de chair')  
  * description\_generale: TEXT  
* **animaux\_elevage\_utilisateur**  
  * id: SERIAL PRIMARY KEY  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE  
  * animal\_type\_id: INTEGER REFERENCES animaux\_types\_catalogue(id)  
  * identifiant\_animal: VARCHAR(100) (ex: numéro de boucle)  
  * date\_naissance\_approx: DATE  
  * notes\_sante: TEXT  
* **rations\_conseils\_ia** (Peut être alimentée/utilisée par Gemini)  
  * id: SERIAL PRIMARY KEY  
  * animal\_type\_id: INTEGER REFERENCES animaux\_types\_catalogue(id)  
  * stade\_production: VARCHAR(100) (ex: 'Croissance', 'Gestation', 'Lactation')  
  * aliments\_disponibles\_json: JSONB (décrivant les aliments de l'utilisateur)  
  * ration\_suggeree\_par\_ia\_text: TEXT  
  * ration\_suggeree\_par\_ia\_details\_json: JSONB (composition détaillée)  
  * date\_generation\_conseil: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
* **produits\_agricoles\_prix** (Pour la bourse des prix)  
  * id: SERIAL PRIMARY KEY  
  * nom\_produit: VARCHAR(255) UNIQUE NOT NULL  
  * categorie\_produit: VARCHAR(100) (ex: 'Fruit', 'Légume', 'Céréale')  
* **regions\_tunisie**  
  * id: SERIAL PRIMARY KEY  
  * nom\_region: VARCHAR(100) UNIQUE NOT NULL  
  * gouvernorat: VARCHAR(100)  
* **observations\_prix\_marches**  
  * id: SERIAL PRIMARY KEY  
  * produit\_id: INTEGER REFERENCES produits\_agricoles\_prix(id)  
  * region\_id: INTEGER REFERENCES regions\_tunisie(id)  
  * nom\_marche\_specifique: VARCHAR(255)  
  * prix\_moyen\_kg\_ou\_unite: DECIMAL(10,2) NOT NULL  
  * unite\_prix: VARCHAR(20) DEFAULT 'TND/kg'  
  * date\_observation: DATE NOT NULL  
  * source\_information: VARCHAR(255) (ex: 'Utilisateur', 'API ONAGRI', 'Collecteur')  
* **donnees\_meteo\_cache** (Pour stocker les données d'API externes)  
  * id: SERIAL PRIMARY KEY  
  * latitude: DECIMAL(9,6) NOT NULL  
  * longitude: DECIMAL(9,6) NOT NULL  
  * date\_prevision: DATE NOT NULL  
  * temperature\_min\_celsius: DECIMAL(5,2)  
  * temperature\_max\_celsius: DECIMAL(5,2)  
  * precipitations\_mm: DECIMAL(5,2)  
  * humidite\_pourcentage: INTEGER  
  * vitesse\_vent\_kmh: DECIMAL(5,2)  
  * description\_meteo: VARCHAR(255)  
  * icone\_meteo\_code: VARCHAR(10)  
  * date\_enregistrement\_cache: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
  * UNIQUE (latitude, longitude, date\_prevision)  
* **forum\_categories**  
  * id: SERIAL PRIMARY KEY  
  * nom\_categorie: VARCHAR(100) UNIQUE NOT NULL  
  * description\_categorie: TEXT  
* **forum\_posts**  
  * id: SERIAL PRIMARY KEY  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL  
  * categorie\_id: INTEGER REFERENCES forum\_categories(id)  
  * titre\_post: VARCHAR(255) NOT NULL  
  * contenu\_post: TEXT NOT NULL  
  * date\_creation: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
  * dernier\_commentaire\_date: TIMESTAMPTZ  
* **forum\_commentaires**  
  * id: SERIAL PRIMARY KEY  
  * post\_id: INTEGER REFERENCES forum\_posts(id) ON DELETE CASCADE  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL  
  * contenu\_commentaire: TEXT NOT NULL  
  * date\_creation: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
* **notifications\_utilisateur**  
  * id: SERIAL PRIMARY KEY  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE  
  * type\_notification: VARCHAR(50) NOT NULL (ex: 'ALERTE\_METEO', 'NOUVEAU\_PRIX', 'CONSEIL\_CULTURE')  
  * message\_notification: TEXT NOT NULL  
  * lien\_associe: VARCHAR(255)  
  * est\_lue: BOOLEAN DEFAULT FALSE  
  * date\_creation: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP  
* **logs\_interactions\_gemini**  
  * id: SERIAL PRIMARY KEY  
  * utilisateur\_id: INTEGER REFERENCES utilisateurs(id)  
  * type\_requete\_gemini: VARCHAR(100) (ex: 'conseil\_culture', 'optimisation\_ration')  
  * prompt\_envoye: TEXT  
  * reponse\_recue: TEXT  
  * parametres\_entree\_json: JSONB  
  * succes\_appel: BOOLEAN  
  * erreur\_message: TEXT  
  * duree\_appel\_ms: INTEGER  
  * date\_interaction: TIMESTAMPTZ DEFAULT CURRENT\_TIMESTAMP

## **6\. Conclusion**

Cette structure de projet, bien que détaillée, est une proposition de base. Elle devra être adaptée et affinée au fur et à mesure du développement et en fonction des choix technologiques finaux et des retours utilisateurs. L'accent est mis sur la modularité et la séparation des préoccupations pour faciliter la maintenance et l'évolution de "AgriTunisie Connect". Les prochaines étapes impliqueraient la mise en place de l'environnement de développement, le prototypage des modules clés et la configuration initiale de la base de données.