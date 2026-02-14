# Inventory Order Flow System

Backend API for inventory and order management system.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Authentication:** JWT + bcrypt
- **Dev Tools:** nodemon

## Week 1 Features

- User authentication (register/login/logout)
- Role-based access control (Admin/User)
- Product CRUD operations
- Soft delete for products
- Password validation
- Token-based authentication

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Products
- `GET /products` - Get all active products
- `GET /products/:id` - Get product by ID
- `POST /product` - Create product (Admin only)
- `PUT /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Soft delete product (Admin only)

### Health
- `GET /api/health` - Server health check

## Setup

```bash
npm install
npm run dev
```
