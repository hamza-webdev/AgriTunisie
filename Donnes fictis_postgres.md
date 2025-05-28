-- Script de Création de Schéma et d'Insertion de Données Fictives pour AgriTunisie Connect

-- Activer l'extension PostGIS si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS postgis;

-- Supprimer les tables existantes dans le bon ordre pour respecter les clés étrangères (CASCADE)
-- Attention: Ces commandes suppriment TOUTES les données et la structure des tables.
DROP TABLE IF EXISTS logs_interactions_gemini CASCADE;
DROP TABLE IF EXISTS notifications_utilisateur CASCADE;
DROP TABLE IF EXISTS forum_commentaires CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS donnees_meteo_cache CASCADE;
DROP TABLE IF EXISTS observations_prix_marches CASCADE;
DROP TABLE IF EXISTS produits_agricoles_prix CASCADE;
DROP TABLE IF EXISTS regions_tunisie CASCADE;
DROP TABLE IF EXISTS rations_conseils_ia CASCADE;
DROP TABLE IF EXISTS animaux_elevage_utilisateur CASCADE;
DROP TABLE IF EXISTS animaux_types_catalogue CASCADE;
DROP TABLE IF EXISTS interventions_culturelles CASCADE;
DROP TABLE IF EXISTS parcelles CASCADE;
DROP TABLE IF EXISTS cultures_catalogue CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- 1. Table: utilisateurs
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL, -- Assez long pour les hashs bcrypt
    numero_telephone VARCHAR(20) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'agriculteur' CHECK (role IN ('agriculteur', 'admin', 'collecteur')),
    localisation_preference_lat DECIMAL(9,6),
    localisation_preference_lon DECIMAL(10,6), -- Longitude peut aller jusqu'à -180/+180
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMPTZ
);
COMMENT ON TABLE utilisateurs IS 'Stocke les informations des utilisateurs de l''application.';
COMMENT ON COLUMN utilisateurs.mot_de_passe_hash IS 'Hash du mot de passe utilisateur (ex: bcrypt).';

-- 2. Table: cultures_catalogue
CREATE TABLE cultures_catalogue (
    id SERIAL PRIMARY KEY,
    nom_culture VARCHAR(255) UNIQUE NOT NULL,
    description_generale TEXT,
    periode_semis_ideale_debut VARCHAR(50),
    periode_semis_ideale_fin VARCHAR(50),
    besoins_eau_mm_cycle INTEGER, -- en mm par cycle de culture
    type_sol_recommande VARCHAR(255),
    notes_fertilisation TEXT,
    sensibilite_maladies_communes TEXT
);
COMMENT ON TABLE cultures_catalogue IS 'Catalogue des informations générales sur les types de cultures.';

-- 3. Table: parcelles
CREATE TABLE parcelles (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    nom_parcelle VARCHAR(255) NOT NULL,
    description TEXT,
    geometrie GEOMETRY(Polygon, 4326) NOT NULL, -- Stocke les coordonnées géographiques de la parcelle (SRID 4326 pour WGS84)
    superficie_calculee_ha DECIMAL(10,4), -- en hectares
    type_sol_predominant VARCHAR(100),
    culture_actuelle_id INTEGER REFERENCES cultures_catalogue(id) ON DELETE SET NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_parcelles_geometrie ON parcelles USING GIST (geometrie); -- Index spatial pour les requêtes géographiques
COMMENT ON TABLE parcelles IS 'Informations sur les parcelles agricoles des utilisateurs.';
COMMENT ON COLUMN parcelles.geometrie IS 'Géométrie de la parcelle au format PostGIS (SRID 4326).';

-- 4. Table: interventions_culturelles
CREATE TABLE interventions_culturelles (
    id SERIAL PRIMARY KEY,
    parcelle_id INTEGER NOT NULL REFERENCES parcelles(id) ON DELETE CASCADE,
    type_intervention VARCHAR(100) NOT NULL, -- ex: 'Semis', 'Fertilisation', 'Traitement', 'Irrigation', 'Récolte'
    date_intervention DATE NOT NULL,
    description_intervention TEXT,
    produits_utilises JSONB, -- ex: [{"nom": "Engrais NPK", "quantite": 50, "unite": "kg"}]
    cout_estime_dinars DECIMAL(10,2)
);
COMMENT ON TABLE interventions_culturelles IS 'Journal de bord des interventions effectuées sur les parcelles.';

-- 5. Table: animaux_types_catalogue
CREATE TABLE animaux_types_catalogue (
    id SERIAL PRIMARY KEY,
    nom_espece VARCHAR(100) UNIQUE NOT NULL, -- ex: 'Ovin (Barbarine)', 'Bovin Laitier (Holstein)'
    description_generale TEXT
);
COMMENT ON TABLE animaux_types_catalogue IS 'Catalogue des types et races d''animaux d''élevage.';

-- 6. Table: animaux_elevage_utilisateur
CREATE TABLE animaux_elevage_utilisateur (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    animal_type_id INTEGER NOT NULL REFERENCES animaux_types_catalogue(id) ON DELETE RESTRICT,
    identifiant_animal VARCHAR(100), -- ex: numéro de boucle, nom
    date_naissance_approx DATE,
    notes_sante TEXT
);
COMMENT ON TABLE animaux_elevage_utilisateur IS 'Animaux spécifiques possédés par un utilisateur.';

-- 7. Table: rations_conseils_ia
CREATE TABLE rations_conseils_ia (
    id SERIAL PRIMARY KEY,
    animal_type_id INTEGER REFERENCES animaux_types_catalogue(id) ON DELETE SET NULL,
    stade_production VARCHAR(100), -- ex: 'Croissance', 'Gestation', 'Lactation'
    aliments_disponibles_json JSONB, -- [{"nom": "Foin", "valeur_nutritionnelle_approx": {...}}, ...]
    ration_suggeree_par_ia_text TEXT,
    ration_suggeree_par_ia_details_json JSONB, -- {"composition": [...], "valeurs_nutritionnelles": {...}}
    date_generation_conseil TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE rations_conseils_ia IS 'Stocke les conseils de rations générés par l''IA.';

-- 8. Table: produits_agricoles_prix
CREATE TABLE produits_agricoles_prix (
    id SERIAL PRIMARY KEY,
    nom_produit VARCHAR(255) UNIQUE NOT NULL,
    categorie_produit VARCHAR(100) -- ex: 'Fruit', 'Légume', 'Céréale', 'Viande', 'Huile'
);
COMMENT ON TABLE produits_agricoles_prix IS 'Catalogue des produits agricoles pour la bourse des prix.';

-- 9. Table: regions_tunisie
CREATE TABLE regions_tunisie (
    id SERIAL PRIMARY KEY,
    nom_region VARCHAR(100) UNIQUE NOT NULL,
    gouvernorat VARCHAR(100)
);
COMMENT ON TABLE regions_tunisie IS 'Liste des régions et gouvernorats de Tunisie.';

-- 10. Table: observations_prix_marches
CREATE TABLE observations_prix_marches (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER NOT NULL REFERENCES produits_agricoles_prix(id) ON DELETE CASCADE,
    region_id INTEGER NOT NULL REFERENCES regions_tunisie(id) ON DELETE CASCADE,
    nom_marche_specifique VARCHAR(255),
    prix_moyen_kg_ou_unite DECIMAL(10,3) NOT NULL, -- Permet 3 décimales pour les prix (ex: 1.800 TND)
    unite_prix VARCHAR(20) DEFAULT 'TND/kg',
    date_observation DATE NOT NULL,
    source_information VARCHAR(255) -- ex: 'Utilisateur', 'API ONAGRI', 'Collecteur'
);
CREATE INDEX idx_observations_prix_date ON observations_prix_marches (date_observation DESC);
COMMENT ON TABLE observations_prix_marches IS 'Observations des prix des produits agricoles sur les marchés.';

-- 11. Table: donnees_meteo_cache
CREATE TABLE donnees_meteo_cache (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    date_prevision DATE NOT NULL,
    temperature_min_celsius DECIMAL(5,2),
    temperature_max_celsius DECIMAL(5,2),
    precipitations_mm DECIMAL(5,2),
    humidite_pourcentage INTEGER CHECK (humidite_pourcentage >= 0 AND humidite_pourcentage <= 100),
    vitesse_vent_kmh DECIMAL(5,2),
    description_meteo VARCHAR(255),
    icone_meteo_code VARCHAR(10), -- Code icône de l'API météo
    date_enregistrement_cache TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (latitude, longitude, date_prevision) -- Éviter les doublons pour une même localisation/date
);
COMMENT ON TABLE donnees_meteo_cache IS 'Cache pour les données météo récupérées d''APIs externes.';

-- 12. Table: forum_categories
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    nom_categorie VARCHAR(100) UNIQUE NOT NULL,
    description_categorie TEXT
);
COMMENT ON TABLE forum_categories IS 'Catégories pour les discussions du forum.';

-- 13. Table: forum_posts
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL, -- Le post reste si l'utilisateur est supprimé
    categorie_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE RESTRICT, -- Une catégorie doit exister
    titre_post VARCHAR(255) NOT NULL,
    contenu_post TEXT NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    dernier_commentaire_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP -- Mis à jour lors d'un nouveau commentaire
);
CREATE INDEX idx_forum_posts_categorie ON forum_posts (categorie_id);
CREATE INDEX idx_forum_posts_dernier_commentaire ON forum_posts (dernier_commentaire_date DESC);
COMMENT ON TABLE forum_posts IS 'Sujets de discussion créés par les utilisateurs dans le forum.';

-- 14. Table: forum_commentaires
CREATE TABLE forum_commentaires (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL, -- Le commentaire reste
    contenu_commentaire TEXT NOT NULL,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_commentaires_post ON forum_commentaires (post_id, date_creation ASC);
COMMENT ON TABLE forum_commentaires IS 'Commentaires faits sur les posts du forum.';

-- 15. Table: notifications_utilisateur
CREATE TABLE notifications_utilisateur (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    type_notification VARCHAR(50) NOT NULL, -- ex: 'ALERTE_METEO', 'NOUVEAU_PRIX', 'CONSEIL_CULTURE_IA', 'NOUVEAU_COMMENTAIRE_FORUM'
    message_notification TEXT NOT NULL,
    lien_associe VARCHAR(255), -- Lien optionnel vers une section de l'app
    est_lue BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_utilisateur_non_lues ON notifications_utilisateur (utilisateur_id, est_lue);
COMMENT ON TABLE notifications_utilisateur IS 'Notifications envoyées aux utilisateurs.';

-- 16. Table: logs_interactions_gemini
CREATE TABLE logs_interactions_gemini (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id) ON DELETE SET NULL,
    type_requete_gemini VARCHAR(100), -- ex: 'conseil_culture', 'optimisation_ration', 'analyse_actualite'
    prompt_envoye TEXT,
    reponse_recue TEXT, -- Peut être long, ou stocker un résumé et un lien vers un stockage plus grand si nécessaire
    parametres_entree_json JSONB, -- Paramètres spécifiques passés à la requête
    succes_appel BOOLEAN,
    erreur_message TEXT,
    duree_appel_ms INTEGER,
    date_interaction TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE logs_interactions_gemini IS 'Logs des interactions avec l''API Gemini.';


-- --- INSERTION DES DONNÉES FICTIVES ---

-- 1. Utilisateurs
-- Les mots de passe sont 'password123' hashés avec bcrypt (vous devrez les hasher correctement dans votre application)
-- Exemple de hash pour 'password123' : $2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V
INSERT INTO utilisateurs (nom_complet, email, mot_de_passe_hash, numero_telephone, role, localisation_preference_lat, localisation_preference_lon) VALUES
('Ahmed Ben Salah', 'ahmed.bensalah@example.com', '$2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V', '21698123456', 'agriculteur', 36.8065, 10.1815), -- Tunis
('Fatma Gharbi', 'fatma.gharbi@example.com', '$2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V', '21697765432', 'agriculteur', 35.8256, 10.6411), -- Sousse
('Ali Trabelsi', 'ali.trabelsi@example.com', '$2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V', '21696112233', 'agriculteur', 34.7479, 10.7662), -- Sfax
('Admin AgriApp', 'admin@agritunisie.com', '$2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V', '21695000000', 'admin', NULL, NULL),
('Collecteur Prix', 'collecteur@agritunisie.com', '$2b$10$E2oV3w8zR29vO7U5zG3j3O3XqYw8qZ.K.N.O.P.Q.R.S.T.U.V', '21694000000', 'collecteur', NULL, NULL);

-- 2. Cultures Catalogue
INSERT INTO cultures_catalogue (nom_culture, description_generale, periode_semis_ideale_debut, periode_semis_ideale_fin, besoins_eau_mm_cycle, type_sol_recommande, notes_fertilisation, sensibilite_maladies_communes) VALUES
('Blé Dur', 'Céréale de base pour la production de semoule et de pâtes.', 'Octobre', 'Novembre', 450, 'Argilo-limoneux, bien drainé', 'Apport NPK au semis, azote en couverture.', 'Rouille, Septoriose'),
('Olivier', 'Arbre fruitier pour la production d''huile d''olive et olives de table.', 'Novembre', 'Mars (plantation)', 600, 'Tolérant, préfère sols calcaires et bien drainés', 'Fertilisation organique et minérale équilibrée.', 'Mouche de l''olive, Oeil de paon'),
('Tomate (plein champ)', 'Légume fruit populaire, cultivé pour la consommation fraîche et la transformation.', 'Mars', 'Avril (semis direct ou repiquage)', 700, 'Riche en matière organique, meuble et bien drainé', 'Apports réguliers en NPK, calcium important.', 'Mildiou, Tuta absoluta'),
('Pomme de terre', 'Tubercule amylacé, culture importante pour l''alimentation.', 'Février', 'Avril', 550, 'Léger, profond, sablo-limoneux', 'Riche en potasse et phosphore.', 'Mildiou, Doryphore'),
('Datier (Deglet Nour)', 'Palmier cultivé pour ses dattes de haute qualité.', 'Mars', 'Mai (plantation rejets)', 1200, 'Sablo-argileux, profond, bonne rétention d''eau', 'Apports organiques importants, irrigation contrôlée.', 'Bayoud, Cochenille blanche');

-- 3. Parcelles
-- Les géométries sont des polygones simples (rectangles) pour l'exemple.
-- Utilisez ST_GeomFromText('POLYGON((lon1 lat1, lon2 lat2, lon3 lat3, lon4 lat4, lon1 lat1))', 4326)
-- Note: Les IDs des utilisateurs sont 1, 2, 3...
INSERT INTO parcelles (utilisateur_id, nom_parcelle, description, geometrie, superficie_calculee_ha, type_sol_predominant, culture_actuelle_id) VALUES
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), 'Champ Nord Ahmed', 'Parcelle principale près de la route', ST_GeomFromText('POLYGON((10.1800 36.8000, 10.1850 36.8000, 10.1850 36.8050, 10.1800 36.8050, 10.1800 36.8000))', 4326), 5.2, 'Argilo-limoneux', (SELECT id FROM cultures_catalogue WHERE nom_culture = 'Blé Dur')),
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), 'Oliveraie Ahmed', 'Vieille oliveraie familiale', ST_GeomFromText('POLYGON((10.1750 36.7950, 10.1780 36.7950, 10.1780 36.7980, 10.1750 36.7980, 10.1750 36.7950))', 4326), 2.1, 'Calcaire', (SELECT id FROM cultures_catalogue WHERE nom_culture = 'Olivier')),
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), 'Serre Tomates Fatma', 'Serre pour tomates précoces', ST_GeomFromText('POLYGON((10.6400 35.8200, 10.6420 35.8200, 10.6420 35.8210, 10.6400 35.8210, 10.6400 35.8200))', 4326), 0.5, 'Sableux enrichi', (SELECT id FROM cultures_catalogue WHERE nom_culture = 'Tomate (plein champ)')),
((SELECT id FROM utilisateurs WHERE email = 'ali.trabelsi@example.com'), 'Champ de Blé Ali', 'Grand champ de blé irrigué', ST_GeomFromText('POLYGON((10.7600 34.7500, 10.7700 34.7500, 10.7700 34.7550, 10.7600 34.7550, 10.7600 34.7500))', 4326), 12.0, 'Limoneux', (SELECT id FROM cultures_catalogue WHERE nom_culture = 'Blé Dur'));

-- 4. Interventions Culturelles
-- Note: Les IDs des parcelles sont 1, 2, 3, 4...
INSERT INTO interventions_culturelles (parcelle_id, type_intervention, date_intervention, description_intervention, produits_utilises, cout_estime_dinars) VALUES
(1, 'Semis', '2024-10-15', 'Semis de blé dur variété Karim', '[{"nom": "Semence Blé Karim", "quantite": 150, "unite": "kg/ha"}]', 350.00),
(1, 'Fertilisation', '2024-10-16', 'Apport NPK au semis', '[{"nom": "Engrais NPK 15-15-15", "quantite": 200, "unite": "kg/ha"}]', 400.00),
(2, 'Taille', '2025-01-20', 'Taille de fructification des oliviers', NULL, 150.00),
(3, 'Repiquage', '2025-03-10', 'Repiquage plants de tomates', '[{"nom": "Plants Tomate Marmande", "quantite": 2000, "unite": "plants"}]', 600.00);

-- 5. Animaux Types Catalogue
INSERT INTO animaux_types_catalogue (nom_espece, description_generale) VALUES
('Ovin (Barbarine)', 'Race ovine locale rustique, élevée pour la viande et la laine.'),
('Bovin Laitier (Holstein)', 'Race bovine spécialisée dans la production laitière.'),
('Volaille de chair (Poulet Cobb)', 'Souche de poulet à croissance rapide pour la production de viande.'),
('Caprin (Race Locale)', 'Chèvre adaptée aux conditions locales, pour lait et viande.');

-- 6. Animaux Elevage Utilisateur
INSERT INTO animaux_elevage_utilisateur (utilisateur_id, animal_type_id, identifiant_animal, date_naissance_approx, notes_sante) VALUES
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), (SELECT id FROM animaux_types_catalogue WHERE nom_espece = 'Ovin (Barbarine)'), 'OVN-FTM-001', '2023-03-15', 'Bon état général, vaccinée.'),
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), (SELECT id FROM animaux_types_catalogue WHERE nom_espece = 'Ovin (Barbarine)'), 'OVN-FTM-002', '2023-04-01', 'Traitement antiparasitaire récent.'),
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), (SELECT id FROM animaux_types_catalogue WHERE nom_espece = 'Bovin Laitier (Holstein)'), 'BVN-AHM-Milk01', '2022-07-10', 'Bonne productrice, suivi vétérinaire régulier.');

-- 7. Rations Conseils IA (Exemple, normalement généré)
INSERT INTO rations_conseils_ia (animal_type_id, stade_production, aliments_disponibles_json, ration_suggeree_par_ia_text, ration_suggeree_par_ia_details_json) VALUES
((SELECT id FROM animaux_types_catalogue WHERE nom_espece = 'Bovin Laitier (Holstein)'), 'Lactation', '{"aliments": [{"nom": "Foin de luzerne", "dispo_kg": 500}, {"nom": "Orge concassé", "dispo_kg": 200}, {"nom": "Son de blé", "dispo_kg": 100}, {"nom": "CMV Lactation", "dispo_kg": 20}]}',
'Ration équilibrée pour vache laitière en lactation : Foin (15kg), Orge (4kg), Son (2kg), CMV (100g). Eau à volonté.',
'{"composition": [{"aliment": "Foin de luzerne", "quantite_kg": 15}, {"aliment": "Orge concassé", "quantite_kg": 4}, {"aliment": "Son de blé", "quantite_kg": 2}, {"aliment": "CMV Lactation", "quantite_g": 100}], "valeurs_nutritionnelles_estimees": {"UFL": 10, "PDIN": 900, "PDIE": 850}}');

-- 8. Produits Agricoles Prix
INSERT INTO produits_agricoles_prix (nom_produit, categorie_produit) VALUES
('Tomate Ronde', 'Légume'),
('Pomme de Terre Spunta', 'Légume'),
('Blé Dur (grain)', 'Céréale'), -- Précisé "grain" pour éviter confusion
('Huile d''Olive Extra Vierge', 'Huile'),
('Orange Maltaise', 'Fruit'),
('Datte Deglet Nour', 'Fruit'),
('Agneau (carcasse)', 'Viande');

-- 9. Regions Tunisie
INSERT INTO regions_tunisie (nom_region, gouvernorat) VALUES
('Grand Tunis', 'Tunis'),
('Cap Bon', 'Nabeul'),
('Sahel Est', 'Sousse'),
('Centre Est', 'Sfax'),
('Nord Ouest', 'Béja'),
('Centre Ouest', 'Kairouan'),
('Sud Est', 'Médenine'),
('Sud Ouest', 'Tozeur');

-- 10. Observations Prix Marches
INSERT INTO observations_prix_marches (produit_id, region_id, nom_marche_specifique, prix_moyen_kg_ou_unite, unite_prix, date_observation, source_information) VALUES
((SELECT id FROM produits_agricoles_prix WHERE nom_produit = 'Tomate Ronde'), (SELECT id FROM regions_tunisie WHERE nom_region = 'Grand Tunis'), 'Marché Central Tunis', 1.800, 'TND/kg', '2025-05-27', 'Collecteur Prix'),
((SELECT id FROM produits_agricoles_prix WHERE nom_produit = 'Pomme de Terre Spunta'), (SELECT id FROM regions_tunisie WHERE nom_region = 'Sahel Est'), 'Marché de Gros Sousse', 1.200, 'TND/kg', '2025-05-27', 'Utilisateur Fatma Gharbi'),
((SELECT id FROM produits_agricoles_prix WHERE nom_produit = 'Blé Dur (grain)'), (SELECT id FROM regions_tunisie WHERE nom_region = 'Nord Ouest'), 'Souk Béja', 0.950, 'TND/kg', '2025-05-26', 'API ONAGRI (simulé)'),
((SELECT id FROM produits_agricoles_prix WHERE nom_produit = 'Huile d''Olive Extra Vierge'), (SELECT id FROM regions_tunisie WHERE nom_region = 'Cap Bon'), 'Coopérative Nabeul', 18.500, 'TND/Litre', '2025-05-28', 'Collecteur Prix'),
((SELECT id FROM produits_agricoles_prix WHERE nom_produit = 'Tomate Ronde'), (SELECT id FROM regions_tunisie WHERE nom_region = 'Grand Tunis'), 'Marché Central Tunis', 1.750, 'TND/kg', '2025-05-20', 'Collecteur Prix');


-- 11. Donnees Meteo Cache (Exemples)
INSERT INTO donnees_meteo_cache (latitude, longitude, date_prevision, temperature_min_celsius, temperature_max_celsius, precipitations_mm, humidite_pourcentage, vitesse_vent_kmh, description_meteo, icone_meteo_code) VALUES
(36.8065, 10.1815, '2025-05-28', 18.5, 27.2, 0, 65, 15, 'Clair', '01d'),
(36.8065, 10.1815, '2025-05-29', 19.0, 28.0, 0, 60, 12, 'Peu nuageux', '02d'),
(35.8256, 10.6411, '2025-05-28', 20.1, 29.5, 0, 70, 18, 'Ensoleillé', '01d');

-- 12. Forum Categories
INSERT INTO forum_categories (nom_categorie, description_categorie) VALUES
('Cultures Céréalières', 'Discussions sur la culture du blé, orge, maïs, etc.'),
('Oléiculture', 'Tout sur la culture des oliviers et la production d''huile.'),
('Cultures Maraîchères', 'Échanges sur les tomates, poivrons, concombres, etc.'),
('Élevage Ovin et Caprin', 'Conseils et partages sur l''élevage des moutons et chèvres.'),
('Machinisme Agricole', 'Discussions sur les tracteurs, outils et équipements.'),
('Problèmes Phytosanitaires', 'Identification et traitement des maladies et nuisibles.');

-- 13. Forum Posts
-- Note: Les IDs des utilisateurs et catégories sont récupérés par sous-requêtes
INSERT INTO forum_posts (utilisateur_id, categorie_id, titre_post, contenu_post, dernier_commentaire_date) VALUES
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), (SELECT id FROM forum_categories WHERE nom_categorie = 'Cultures Céréalières'), 'Quelle variété de blé dur pour la région de Béja ?', 'Bonjour, je cherche des retours d''expérience sur les variétés de blé dur les plus adaptées et performantes pour la région de Béja, notamment en termes de rendement et de résistance à la sécheresse. Merci !', NOW() - INTERVAL '1 day'),
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), (SELECT id FROM forum_categories WHERE nom_categorie = 'Cultures Maraîchères'), 'Urgent : Mildiou sur tomates sous serre', 'J''ai une forte attaque de mildiou sur mes tomates sous serre à Sousse. Quels sont les traitements bio efficaces que vous recommandez en urgence ?', NOW()),
((SELECT id FROM utilisateurs WHERE email = 'ali.trabelsi@example.com'), (SELECT id FROM forum_categories WHERE nom_categorie = 'Oléiculture'), 'Meilleure période pour la taille des oliviers à Sfax ?', 'Je suis un peu perdu sur la période optimale pour la taille de mes oliviers (variété Chemlali) dans la région de Sfax. Des conseils ?', NOW() - INTERVAL '2 hours');

-- 14. Forum Commentaires
-- Note: Les IDs des posts sont 1, 2, 3...
INSERT INTO forum_commentaires (post_id, utilisateur_id, contenu_commentaire) VALUES
(1, (SELECT id FROM utilisateurs WHERE email = 'ali.trabelsi@example.com'), 'Pour Béja, la variété "Karim" a donné de bons résultats chez moi, surtout avec une bonne fertilisation de fond.'),
(1, (SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), 'J''ai entendu parler de la variété "Maali" aussi, elle serait plus tolérante au stress hydrique.'),
(2, (SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), 'Pour le mildiou en bio, essayez la bouillie bordelaise en préventif et curatif léger. Assurez une bonne aération de la serre.'),
(2, (SELECT id FROM utilisateurs WHERE email = 'ali.trabelsi@example.com'), 'Le bicarbonate de soude dilué peut aussi aider à stopper la progression si l''attaque est récente.');

-- 15. Notifications Utilisateur (Exemples)
INSERT INTO notifications_utilisateur (utilisateur_id, type_notification, message_notification, lien_associe) VALUES
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), 'ALERTE_METEO', 'Risque de fortes pluies prévu pour votre localisation (Champ Nord Ahmed) demain. Prenez vos précautions.', '/meteo/previsions?lat=36.8000&lon=10.1800'),
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), 'NOUVEAU_PRIX', 'Le prix de la Tomate Ronde a baissé au Marché de Gros Sousse. Consultez la bourse.', '/prix/observations?produitId=1&regionId=3'),
((SELECT id FROM utilisateurs WHERE email = 'ali.trabelsi@example.com'), 'CONSEIL_CULTURE_IA', 'Nouveau conseil disponible pour votre parcelle "Champ de Blé Ali" concernant la fertilisation azotée.', '/parcelles/4/conseils');

-- 16. Logs Interactions Gemini (Exemples)
INSERT INTO logs_interactions_gemini (utilisateur_id, type_requete_gemini, prompt_envoye, reponse_recue, parametres_entree_json, succes_appel, duree_appel_ms) VALUES
((SELECT id FROM utilisateurs WHERE email = 'ahmed.bensalah@example.com'), 'conseil_culture', 'Prompt simulé pour conseil culture blé...', '{"conseil": "Conseil IA: Pour le blé dur à Tunis, surveillez la septoriose..."}', '{"parcelle_id": 1, "culture_nom": "Blé Dur"}', TRUE, 1250),
((SELECT id FROM utilisateurs WHERE email = 'fatma.gharbi@example.com'), 'optimiser_ration', 'Prompt simulé pour ration ovine...', '{"ration": "Ration IA: Foin 70%, Orge 25%, CMV 5%..."}', '{"animal_type": "Ovin Barbarine", "aliments_disponibles": ["foin", "orge"]}', TRUE, 980);

SELECT 'Schéma créé et données fictives insérées avec succès !' AS message;
