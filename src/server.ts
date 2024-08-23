import express from 'express';
import { config } from 'dotenv';
import { routerUser } from './routers/userRouter';
import { routerAuth } from './routers/authRouter';
import { routerProduct } from './routers/productRouter';
import { routerOrder } from './routers/orderRouter';
import { routerCart } from './routers/cartRouter';
import { getDb } from './db';


config();

const port = process.env.PORT || '3000';
const app = express();

// Middleware per parsare i dati JSON
app.use(express.json());

// Funzione per inizializzare il database
async function initializeDatabase() {
  const db = await getDb()

  await db.exec(`
   -- Creazione della tabella degli utenti
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    Token TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    nameProduct TEXT NOT NULL,
    price TEXT NOT NULL,
    img TEXT NOT NULL,
    category TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    Token TEXT NOT NULL,
    status TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS cart(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(productId) REFERENCES products(id) ON DELETE CASCADE
);

  `);
}

// Inizializza il database
initializeDatabase()


// Configura le route
app.use('/users', routerUser);
app.use('/auths', routerAuth);
app.use('/product', routerProduct);
app.use('/order', routerOrder);
app.use('/cart', routerCart);

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
  });
  
