import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";
import logger from "../middleware/logger";
import { responses } from "../utils/responses";

config()

export const routerProduct = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };

   interface requestProductBody{
    nameProduct:string,
    price:number,
    img:string,
    category:string
    
   }


//  add product
routerProduct.post('', authenticateToken, async (req: Request, res: Response) => {

  try {
    const db = await getDb();
    const { nameProduct, price, img, category}:requestProductBody = req.body;
    
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    
    if (!nameProduct || !price || !img || !category ) {
      logger.warn('Parametri mancanti nella richiesta', { body: req.body })
      return res.status(400).json({
        'message': 'Parametri mancanti nella richiesta'
      });
    }

    logger.info('tentativo di aggiungere un prodotto ricevuto')

    const userFound = await db.get('SELECT userID FROM auth WHERE token = ?',[token]);

    if(!userFound){
      return res.status(404).json(responses.notUserExists);
    }

    const userId = userFound.userId;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId])

    const isAdmin = user.is_admin;

    if(isAdmin==1){

      const result = await db.run('INSERT INTO products (userId,nameProduct, price, img, category) VALUES (?, ?, ?, ?, ?)',
      [userId ,nameProduct, price, img, category]
    );

    if (result.changes && result.changes > 0) {
      logger.info("Prodotto aggiunto con successo",result.lastID)
      return res.status(201).json({
        'message': 'Prodotto aggiunto con successo', 'product': result.lastID
      });
    } else {
      logger.error('Prodotto non aggiunto');
      return res.status(500).json({
        'message': 'Prodotto non aggiunto',
      });
    }
    }
    else
    {
      logger.warn(userId,'non è un admin')
      return res.status(401).json({
        'message': 'Non sei un admin, permesso negato',
      });
    }
    

  } catch (err) {
    if (err instanceof Error) {
      logger.error('Errore JavaScript durante la registrazione utente', { error: err.message });
      return res.status(500).json({ message: 'Errore standar di js', error: err.message});
    } else {
      logger.error('Errore sconosciuto durante la registrazione utente', { error: err });
      return res.status(500).json({ message: 'Errore sconosciuto' });
    }
  }
});


//  update product
routerProduct.put('/update/:id', authenticateToken, async (req: Request, res: Response) => {

  try {
    const db = await getDb();
    const { nameProduct, price, img, category } = req.body;
    const { id } = req.params;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!nameProduct || !price || !img || !category) {
      return res.status(400).json({
        'message': 'nameProduct, price, img e category sono richiesti'
      });
    }

    
    if (!id) {
      return res.status(400).json({
        'message': 'ID del prodotto è richiesto'
      });
    }


    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', [id]);

    if (!existingProduct) {
      return res.status(404).json({
        'message': 'Prodotto non trovato'
      });
    }

    const userFound = await db.get('SELECT userID FROM auth WHERE token = ?',[token]);

    if(!userFound){
      return res.status(404).json({
        'message': 'utente non trovato'
      });
    }

    const userId = userFound.userId;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId])

    const isAdmin = user.is_admin;

    if(isAdmin==1)
    {
      const result = await db.run(
        'UPDATE products SET nameProduct = ?, price = ?, img = ?, category = ? WHERE id = ?',
        [nameProduct, price, img, category, id]
      );
  
      if (result.changes && result.changes > 0) {
        return res.status(200).json({
          'message': 'Prodotto aggiornato con successo',
          'productId': id
        });
      } else {
        return res.status(400).json({
          'message': 'Nessuna modifica apportata al prodotto'
        });
      }
    }
   else
   {
    return res.status(401).json({
      'message': 'Non hai i permessi per l\'operazione'
    });
   }
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({
        'message': 'Errore standard di js',
        'error': err.message
      });
    } else {
      return res.status(500).json({
        'message': 'Errore sconosciuto'
      });
    }
  }
});



// delete product
routerProduct.delete('/:id', authenticateToken, async (req: Request, res: Response)=>{
  

  try {

    const db = await getDb();
    const { id } = req.params;

    if(!id){
      logger.warn('id mancante',id);
      return res.status(400).json({
        'message': 'ID del prodotto è richiesto'
      });
    }

   
    logger.info('tentativo di eliminare un prodotto ricevuto')

    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', [id]);

    if (!existingProduct) {
      return res.status(404).json({
        'message': 'Prodotto non trovato'
      });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    const userFound = await db.get('SELECT userID FROM auth WHERE token = ?',[token]);

    if(!userFound){
      return res.status(404).json({
        'message': 'utente non trovato'
      });
    }

    const userId = userFound.userId;

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);

    const isAdmin = user.is_admin;

    if(isAdmin==1)
    {
      const result = await db.run(
        'DELETE from products WHERE id = ?',[id]
      );
  
      if (result.changes && result.changes > 0) {
        return res.status(200).json({
          'message': 'Prodotto eliminato con successo',
          'productId': id
        });
      } else {
        return res.status(400).json({
          'message': 'prodotto non eliminato'
        });
      }
    }
    else
    {
      return res.status(401).json({
        'message': 'Non hai i permessi per l\'operazione'
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({
        'message': 'Errore standard di js',
        'error': err.message
      });
    } else {
      return res.status(500).json({
        'message': 'Errore sconosciuto'
      });
    }
  }
})