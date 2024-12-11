# Radar Zone - Application Mobile

## 🎯 Objectif
Une application mobile qui permet aux utilisateurs de découvrir et d'interagir avec des zones radar en temps réel. Les utilisateurs peuvent gagner des points en restant dans ces zones, créant ainsi une expérience gamifiée de la sécurité routière.

## 🚀 Fonctionnalités Principales

### Authentification
- Système complet de login/signup
- Gestion des tokens JWT
- Protection des routes authentifiées

### Carte Interactive
- Affichage en temps réel de la position de l'utilisateur
- Visualisation des zones radar avec des cercles dynamiques
- Adaptation de la taille des zones selon le niveau de zoom
- Mode test avec zone radar proche de l'utilisateur

### Système de Points
- Détection automatique d'entrée/sortie de zone
- Calcul du temps passé dans chaque zone
- Enregistrement des scores dans une base de données
- Classement des utilisateurs

### Recherche
- Filtrage des radars par département
- Recherche par emplacement
- Interface modale pour les résultats

## 🛠 Stack Technique

### Frontend
- React Native avec Expo
- Expo Router pour la navigation
- React Native Maps pour la cartographie
- Geolib pour les calculs de distance
- AsyncStorage pour le stockage local

### Backend
- API REST avec authentification
- PostgreSQL avec Row Level Security (RLS)
- Système de permissions granulaire

## 📱 Structure du Projet
```
app/
├── (auth)/(tabs)/     # Routes authentifiées
│   ├── explore/       # Carte et recherche
│   └── index.tsx      # Page d'accueil
├── ctx.tsx            # Contexte d'authentification
├── login.tsx          # Page de connexion
└── signup.tsx         # Page d'inscription
```

## 🔒 Sécurité
- Protection des routes avec RLS
- Tokens JWT pour l'authentification
- Validation des données côté serveur
- Gestion sécurisée des permissions

## 🌐 API Endpoints
- `/api/auth/local` : Login
- `/api/auth/register` : Inscription
- `/api/ranks` : CRUD des scores
- `/api/users/me` : Infos utilisateur

## 🚀 Installation

1. Cloner le repo
2. Installer les dépendances : `npm install`
3. Configurer le `.env` avec l'URL du backend
4. Lancer l'app : `npx expo start`

## 📝 Variables d'Environnement
```
EXPO_PUBLIC_BACKEND_URL=http://your-backend-url:1337
```

## 🤝 Contribution
Les contributions sont les bienvenues ! Voir le fichier CONTRIBUTING.md pour plus de détails.

## 📄 Licence
MIT
