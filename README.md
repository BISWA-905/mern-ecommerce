# ShopEase: MERN Stack E-Commerce Website

A complete end-to-end online shop built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) for the **Jobaaj Learnings Full Stack Development Assignment**.

Customers can register, browse, search, filter and sort products, add them to a cart, place orders and review products. The shop owner (admin) manages products, orders and users from a dashboard.

## Live links

- **Website:** https://shopease-phi-red.vercel.app
- **Backend API:** https://shopease-api-se6x.onrender.com
- **Demo video:** _add your video link here_

> The backend runs on a free hosting plan and goes to sleep when nobody is using it. The first request after a break can take up to a minute. Please open the website once and wait for the products to load.

Demo logins for the **admin** and **customer** accounts are shared with the evaluator separately (not published here for security).

## Features

**Customers**
- Register, log in and log out (JWT authentication)
- Responsive home page with a hero banner, featured products and categories
- Product list with images, price, rating, **search**, **category filter** and **sort by price or rating**
- Product details page with image gallery, description, reviews and ratings
- Shopping cart: add, remove, increase or decrease quantity, live total
- Checkout with a shipping address form, order summary and place order
- My Orders page with order status
- Write a rating and review (only for products you have ordered, one review per product)

**Admin**
- Add, edit and delete products (and add categories)
- View all orders, filter by status and update the status (Pending, Processing, Shipped, Delivered, Cancelled)
- View users, change a user's role and delete users

**Quality**
- Responsive, mobile-friendly design with loading states and error messages
- Form validation on both the website and the server
- Protected routes for logged-in users and admin-only pages

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt password hashing |
| Hosting | Vercel (website), Render (backend), MongoDB Atlas (database) |

## Project structure

```
mern-ecommerce/
├── client/                 # React website
│   └── src/
│       ├── components/     # Navbar, Footer, ProductCard, ReviewForm, admin tabs...
│       ├── context/        # AuthContext (who is logged in)
│       ├── pages/          # Home, Products, ProductDetails, Cart, Checkout, Orders, Login...
│       ├── services/       # Axios setup
│       └── utils/          # Helpers
├── server/                 # Express API
│   ├── config/             # Database connection
│   ├── controllers/        # Business logic
│   ├── middleware/         # protect (login) and admin guards
│   ├── models/             # Mongoose models
│   └── routes/             # API routes
└── README.md
```

## Database collections

`Users`, `Categories`, `Products`, `Reviews`, `Carts`, `Orders`

## API overview

All routes start with `/api`. "Admin" routes need a logged-in admin. "Login" routes need a valid token sent as `Authorization: Bearer <token>`.

| Area | Method and route | Access |
|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login` | Public |
| Auth | `GET /auth/profile` | Login |
| Categories | `GET /categories` | Public |
| Categories | `POST /categories` | Admin |
| Products | `GET /products` (query: `search`, `category`, `sort`, `featured`, `limit`) | Public |
| Products | `GET /products/:id` (includes reviews) | Public |
| Products | `POST /products`, `PUT /products/:id`, `DELETE /products/:id` | Admin |
| Reviews | `POST /products/:id/reviews` | Login (must have ordered the product) |
| Cart | `GET /cart`, `POST /cart`, `DELETE /cart` | Login |
| Cart | `PUT /cart/:productId`, `DELETE /cart/:productId` | Login |
| Orders | `POST /orders`, `GET /orders/my`, `GET /orders/:id` | Login (own orders) |
| Orders | `GET /orders`, `PUT /orders/:id/status` | Admin |
| Users | `GET /users`, `PUT /users/:id/role`, `DELETE /users/:id` | Admin |

## Security notes

- Passwords are hashed with bcrypt and never returned by the API
- Secrets live in environment variables, never in the code
- Order totals and prices are calculated on the server from the real product prices
- Role checks run on the server for every admin route, not only in the browser
- CORS only allows the shop's own website

## Run it on your computer

**You need:** Node.js 20 or newer, Git, and a free MongoDB Atlas database.

1. Clone the project:

```
git clone https://github.com/BISWA-905/mern-ecommerce.git
cd mern-ecommerce
```

2. Set up the backend:

```
cd server
npm install
```

Copy `.env.example` to a new file named `.env` and fill in your own values (database link and a long random secret). Then start it:

```
npm run dev
```

3. Set up the website (in a second terminal):

```
cd client
npm install
```

Copy `.env.example` to `.env`. Then start it:

```
npm run dev
```

4. Open http://localhost:5173

### Environment variables

**server/.env**

| Name | Meaning |
|---|---|
| `PORT` | Port for the API (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret used to sign login tokens |
| `JWT_EXPIRE` | How long a login lasts, for example `30d` |
| `FRONTEND_URL` | Address of the website allowed to call the API |

**client/.env**

| Name | Meaning |
|---|---|
| `VITE_API_URL` | Address of the API, for example `http://localhost:5000/api` |

## Making an admin

Everyone who registers is a normal customer. To create the first admin, register an account and then change its `role` to `admin` in the `users` collection of your database. After that, admins can promote other users from the dashboard.

## Author

Built by **Biswaranjan Sahoo** ([@BISWA-905](https://github.com/BISWA-905)) as part of the Jobaaj Learnings Full Stack Development course.