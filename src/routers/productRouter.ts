import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerProduct = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };


//  add product
routerProduct.post('', authenticateToken, async (req: Request, res: Response) => {

  try {
    const db = await getDb();
    const { nameProduct, price, img, category } = req.body;

    
    if (!nameProduct || !price || !img || !category) {
      return res.status(400).json({
        'message': 'nameProduct, price, img e category sono richiesti'
      });
    }

    
    const result = await db.run('INSERT INTO products (nameProduct, price, img, category) VALUES (?, ?, ?, ?)',
      [nameProduct, price, img, category]
    );

    if (result.changes && result.changes > 0) {
      return res.status(200).json({
        'message': 'Prodotto aggiunto con successo', 'product': result.lastID
      });
    } else {
      return res.status(400).json({
        'message': 'Prodotto non aggiunto',
      });
    }

  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: 'Errore standar di js', error: err.message});
    } else {
      return res.status(500).json({ message: 'Errore sconosciuto' });
    }
  }
});
