import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";
import logger from "../middleware/logger";


config()

export const routerOrderProduct = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };



  // clear table orderProduct
  routerOrderProduct.delete("/clear", authenticateToken, async (req: Request, res: Response) => {

    try {
        logger.info('tentativo di svuotare la tabella orderProduct ricevuto');
        const db = await getDb();
        const result = await db.run('DELETE FROM order_product ');

        if(result.changes && result.changes > 0) {
          logger.info('tabella order_product  svuotata');
          return res.status(200).json({ message: 'tabella order_product  svuotata' });
        }else{
          logger.error('tabella order_product  non svuotata');
          return res.status(500).json({ message: 'tabella order_product  non svuotata' });
        }
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Errore standard di JavaScript', err.message);
        return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
      } else {
        logger.error('Errore sconosciuto', err);
        return res.status(500).json({ message: 'Errore sconosciuto', errore: err });
      }
    }
  });
  
  
// add orderProduct
  routerOrderProduct.post("/", authenticateToken, async (req: Request, res: Response) => {

    try {
      const { orderId, productId, quantity } = req.body;

      if(!orderId || !productId || !quantity) {
        logger.warn('parametri mancanti');
        return res.status(400).json({ message: 'parametri mancanti' });
      }

      const db = await getDb();
     
      const foundOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

      if(!foundOrder) {
        logger.warn('ordine non trovato');
        return res.status(404).json({ message: 'ordine non trovato' });
      }

      const foundProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

      if(!foundProduct) {
        logger.warn('prodotto non trovato');
        return res.status(404).json({ message: 'prodotto non trovato' });
      };

      const result = await db.run('INSERT INTO orders_product (orderId, productId, quantity) VALUES (?, ?, ?)', [orderId, productId, quantity]);
      if(result && result.changes && result.changes > 0) {
        logger.info('ordine aggiunto');
        return res.status(200).json({ message: 'ordine aggiunto' });
      }else{
        logger.error('ordine non aggiunto');
        return res.status(500).json({ message: 'ordine non aggiunto' });
      }


    } catch (err) {
      if (err instanceof Error) {
        logger.error('Errore standard di JavaScript', err.message);
        return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
      } else {
        logger.error('Errore sconosciuto', err);
        return res.status(500).json({ message: 'Errore sconosciuto', errore: err });
      }
    }
  });


  // update orderProduct
  routerOrderProduct.put("/", authenticateToken, async (req: Request, res: Response) => {

    try {
      const { orderId, productId, quantity } = req.body;

      if(!orderId || !productId || !quantity) {
        logger.warn('parametri mancanti');
        return res.status(400).json({ message: 'parametri mancanti' });
      }

      logger.info('tentativo di aggiornare un ordine ricevuto');

      const db = await getDb();
      const foundOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

      if(!foundOrder) {
        logger.warn('ordine non trovato');
        return res.status(404).json({ message: 'ordine non trovato' });
      }

      const foundProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

      if(!foundProduct) {
        logger.warn('prodotto non trovato');
        return res.status(404).json({ message: 'prodotto non trovato' });
      };

      const result = await db.run('UPDATE orders_product SET quantity = ? WHERE orderId = ? AND productId = ?', [quantity, orderId, productId]);

      if(result && result.changes && result.changes > 0) {
        logger.info('ordine aggiornato');
        return res.status(200).json({ message: 'ordine aggiornato' });
      }else{
        logger.error('ordine non aggiornato');
        return res.status(500).json({ message: 'ordine non aggiornato' });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Errore standard di JavaScript', err.message);
        return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
      } else {
        logger.error('Errore sconosciuto', err);
        return res.status(500).json({ message: 'Errore sconosciuto', errore: err });
      }
    }
  });



  // delete orderProduct
  routerOrderProduct.delete("/delete",authenticateToken, async (req: Request, res: Response) => {

    try {
      
      const { orderId, productId} = req.body;

      if(!orderId || !productId ) {
        logger.warn('parametri mancanti');
        return res.status(400).json({ message: 'parametri mancanti' });
      }

      logger.info('tentativo di eliminare un ordine ricevuto');

      const db = await getDb();
      const foundOrder = await db.get('SELECT * FROM orders WHERE id = ?', [orderId]);

      if(!foundOrder) {
        logger.warn('ordine non trovato');
        return res.status(404).json({ message: 'ordine non trovato' });
      }

      const foundProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);

      if(!foundProduct) {
        logger.warn('prodotto non trovato');
        return res.status(404).json({ message: 'prodotto non trovato' });
      };

      const result = await db.run('DELETE FROM orders_product WHERE orderId = ? AND productId = ?', [orderId, productId]);
      if(result && result.changes && result.changes > 0) {
        logger.info('ordine eliminato');
        return res.status(200).json({ message: 'ordine eliminato' });
      }else{
        logger.error('ordine non eliminato');
        return res.status(500).json({ message: 'ordine non eliminato' });
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error('Errore standard di JavaScript', err.message);
        return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
      } else {
        logger.error('Errore sconosciuto', err);
        return res.status(500).json({ message: 'Errore sconosciuto', errore: err });
      }
    }
  });