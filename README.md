# API Shop

This is a simple API for [a shop application](https://github.com/jamj2000/rn-shop).

[API Shop](https://nxapi-shop.vercel.app)

## Models

- User
- Product
- ProductImage

![ER Diagram](ER-diagram.png)

## Data

- users.json
- products.json
- product_images.json


## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/check-status`

### Products

- `POST   /api/products`
- `GET    /api/products`
- `GET    /api/products/all/:term`
- `GET    /api/products/:idOrSlug`
- `PATCH  /api/products/:id`
- `DELETE /api/products/:id`

### Files

- `POST   /api/files/product`
- `GET    /api/files/product`
- `GET    /api/files/product/:imageName`
- `PUT    /api/files/product/:imageName`
- `DELETE /api/files/product/:imageName`

## Tech Stack

- Next.js
- Prisma
- Postgres

## Setup

1. Clone the repository

```bash
git clone https://github.com/jamj2000/nxapi-shop.git
```

2. Install dependencies

```bash
cd  nxapi-shop 
npm install
```

3. Configure DATABASE_URL in .env

```bash
cp .env.example .env
```
Edit .env file and add your DATABASE_URL

4. Set up the database

```bash
npx prisma db push
```

5. Run the seed

```bash
npm run seed
```

6. Start the development server

```bash
npm run dev
```

## Build

```bash
npm run build
npm run start
```

## Inspiration

This project was inspired by [nest-teslo-shop](https://github.com/Klerith/nest-teslo-shop) developed by [Fernando Herrera](https://github.com/Klerith) using the NestJS framework.

My project uses NextJS instead of NestJS.😉


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
