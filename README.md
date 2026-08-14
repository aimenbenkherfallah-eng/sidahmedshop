# Sidahmed Shop 🛍️

Full-stack MERN e-commerce optimized for Cash on Delivery (COD) in Algeria — « الدفع عند الاستلام ».
Bilingual (Arabic / French), mobile-first, 58 wilayas, admin dashboard, Meta & TikTok pixels (client + server-side).

## Installation

```bash
npm install
npm run seed --workspace server
npm run dev
```

## Cloudinary image storage

Product images, landing-page images, and review photos are uploaded to Cloudinary so they remain available after Render restarts or deployments.

1. Create an account at https://cloudinary.com and open the Cloudinary Dashboard.
2. Copy the `Cloud name`, `API Key`, and `API Secret` from **API Keys**.
3. Add these variables to `server/.env` locally:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Add the same three variables in **Render → Web Service → Environment**.
5. Save the variables and run **Manual Deploy → Deploy latest commit**.

`CLOUDINARY_API_SECRET` is server-only. Never put it in React, GitHub, or any variable prefixed with `VITE_`.

Cloudinary folders used by the app:

- `sidahmed-shop/products`
- `sidahmed-shop/landing-pages`
- `sidahmed-shop/reviews`

Existing `/uploads/...` URLs remain readable during migration. All new uploads use persistent HTTPS Cloudinary URLs.

## Rotate previously exposed secrets

`server/.env` is ignored and removed from Git tracking. If it was previously pushed, rotate the old values:

1. Change the MongoDB Atlas database-user password and update `MONGODB_URI` locally and on Render.
2. Generate a new JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
3. Put a new admin password (minimum 12 characters) in `ADMIN_PASSWORD`, then run:

```bash
npm run admin:reset --workspace server
```

4. Update the same runtime variables on Render. Never commit `server/.env` again.

