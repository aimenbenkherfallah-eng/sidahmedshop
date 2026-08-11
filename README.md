# Sidahmed Shop 🛍️

Full-stack **MERN e-commerce** optimized for **Cash on Delivery (COD) in Algeria** — « الدفع عند الاستلام ».
Bilingual (Arabic / French), mobile-first, 58 wilayas, admin dashboard, Meta & TikTok pixels (client + server-side).

---

## 📁 Structure

```
sidahmedshop/
├── server/   → Express REST API (MongoDB, JWT, helmet, rate-limit, pixels serveur)
│   ├── src/
│   │   ├── config/      (db, provinces 1-58, constants)
│   │   ├── models/      (User, Product, Order, Settings)
│   │   ├── controllers/ (products, orders, auth, admin)
│   │   ├── middleware/  (auth, rate-limit, upload, errorHandler)
│   │   ├── services/    (Meta CAPI, TikTok Events API, Turnstile)
│   │   ├── routes/
│   │   └── utils/       (seed.js)
└── client/   → React + Vite + Tailwind (boutique + /admin)
```

## ✅ Prérequis

- **Node.js ≥ 18** (testé avec Node 24)
- **MongoDB** — MongoDB Atlas (recommandé) ou local

---

## 🚀 Installation (à exécuter à la racine du projet)

```bash
# 1. Installer toutes les dépendances (server + client)
npm install
```

> ⚠️ Si `npm install` reste bloqué longtemps (réseau lent), lancer chaque workspace séparément :
>
> ```bash
> cd server && npm install
> cd ../client && npm install
> ```

## 🔑 Configuration — `server/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | URI de connexion MongoDB. **Atlas** : `mongodb+srv://USER:PASSWORD@cluster.mongodb.net/sidahmedshop?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret JWT (générez-en un long) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Compte admin initial (créé par le seed) |
| `CLIENT_ORIGIN` | Domaine du frontend (CORS) |
| `META_PIXEL_ID` / `META_ACCESS_TOKEN` | Conversions API Meta (événements serveur) |
| `TIKTOK_PIXEL_ID` / `TIKTOK_ACCESS_TOKEN` | Events API TikTok (événements serveur) |
| `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile (anti-spam formulaires COD) |

> Les Pixel IDs publics (Meta/TikTok) se modifient aussi depuis **Admin → Paramètres** (chargés par le frontend).
> Les tokens serveur restent dans `.env` uniquement.

## 🌱 Seed (1ère fois seulement)

```bash
npm run seed --workspace server
# ou : cd server && npm run seed
```

Crée : l'admin (`sidahmed` / `slhgta62004`), les paramètres du magasin, les frais de livraison par wilaya (par défaut 600 DA), et 10 produits de démonstration.

## 🖥️ Développement

```bash
npm run dev
# ou séparément :
npm run dev:server   # API sur http://localhost:5000
npm run dev:client   # Frontend sur http://localhost:5173
```

- **Boutique** : http://localhost:5173
- **Admin** : http://localhost:5173/admin — connexion : `sidahmed` / `slhgta62004`

## 🏭 Production

```bash
npm run build        # build Vite → client/dist
npm start            # Express sert l'API + le frontend sur http://localhost:5000
```

En production, `CLIENT_ORIGIN` doit être le domaine du site. Le cookie JWT devient `Secure` + `SameSite=Strict` automatiquement (`NODE_ENV=production`).

## 🔐 Sécurité incluse

- `helmet` (headers, CSP, HSTS) · `cors` restreint à `CLIENT_ORIGIN`
- `express-rate-limit` : login admin (5 essais / 15 min), commandes (3 / IP / 10 min), reviews (5 / heure)
- `express-mongo-sanitize` (anti NoSQL injection) · `express.json({ limit: '10kb' })`
- JWT en cookie `httpOnly + Secure + SameSite=Strict`, mot de passe `bcryptjs` (10 rounds)
- Middlewares `protect` + `adminOnly` sur toutes les routes `/api/admin/*`
- Validation `zod` côté serveur, Turnstile + throttling par téléphone/IP sur les commandes
- Schémas Mongoose `strict: true` (champs inconnus rejetés)

## 📈 Tracking

- **Client** : Meta Pixel + TikTok Pixel (`PageView`, `ViewContent`, `AddToCart`, `Purchase`/`CompletePayment`) avec `eventId` de déduplication.
- **Serveur** : Conversions API Meta (`Purchase`) + TikTok Events API (`PlaceAnOrder`) à chaque commande, **téléphone haché en SHA-256**, même `eventId` que le client.

## 🗺️ Wilayas

Les 58 wilayas officielles sont seedées (codes 1–58) et servent au formulaire COD, au calcul des frais de livraison (Admin → Paramètres) et au filtre des commandes par wilaya.

---
© Sidahmed Shop — « الدفع عند الاستلام والتوصيل إلى جميع الولايات 🚚 »
