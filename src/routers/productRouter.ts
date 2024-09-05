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



// clear product

routerProduct.delete('/cart',authenticateToken, async (req:Request,res:Response)=>{

  try {
  
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json({ message: 'Autorizzazione mancante' });
    }
    const token = authHeader && authHeader.split(" ")[1];
  
    logger.info('tentativo di svuotare la tabella cart ricevuto')
    
    const db = await getDb();
   
     
    const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);
  
    if (!verifyUser) {
      logger.warn('Utente non autenticato', { token });
      return res.status(401).json({ message: 'Utente non autenticato' });
    }
  
    const userId = verifyUser.userId;
  
   
    const userData = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);
  
    if (!userData) {
      logger.warn('Utente non trovato nella tabella users', { userId });
      return res.status(404).json(responses.notUserExists);
    }
  
    const isAdmin = userData.is_admin;
  
    if(isAdmin === 1){
      
    const result = await db.run('DELETE FROM product');
  
    if(result.changes && result.changes > 0){
      logger.info('tabella product svuotata con successo');
      return res.status(204).json({'message':'tabella product svuotata con successo'});
    }else{
      logger.error('tabella product non svuotata ');
      return res.status(500).json({'message':'tabella product non  svuotata '});
    } 
     }else {
      logger.warn('Utente non autorizzato', { userId });
      return res.status(403).json({ message: 'Non sei un admin, permesso negato' });
    }
  
  } catch (err) {
  
    if(err instanceof Error){
      logger.error('errore standard di js',err.message);
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      logger.error('errore sconosciuto',err);
      return res.status(500).json({'message':'errore sconosciuto','errore':err})
    }
  
  }
  
  })







//  add product
routerProduct.post('', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { nameProduct, price, img, category }: requestProductBody = req.body;
    
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json({ message: 'Autorizzazione mancante' });
    }
    
    const token = authHeader.split(" ")[1];

    
    if (!nameProduct || !price || !img || !category) {
      logger.warn('Parametri mancanti nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Parametri mancanti nella richiesta' });
    }

    logger.info('Tentativo di aggiungere un prodotto ricevuto');

    
    const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      logger.warn('Utente non autenticato', { token });
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const userId = verifyUser.userId;

   
    const userData = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);

    if (!userData) {
      logger.warn('Utente non trovato nella tabella users', { userId });
      return res.status(404).json(responses.notUserExists);
    }

    const isAdmin = userData.is_admin;

    if (isAdmin === 1) {
      const result = await db.run(
        'INSERT INTO products (userId, nameProduct, price, img, category) VALUES (?, ?, ?, ?, ?)',
        [userId, nameProduct, price, img, category]
      );

      if (result.changes && result.changes > 0) {
        logger.info('Prodotto aggiunto con successo', { productId: result.lastID });
        return res.status(201).json({
          message: 'Prodotto aggiunto con successo',
          product: result.lastID
        });
      } else {
        logger.error('Prodotto non aggiunto');
        return res.status(500).json({ message: 'Prodotto non aggiunto' });
      }
    } else {
      logger.warn('Utente non autorizzato', { userId });
      return res.status(403).json({ message: 'Non sei un admin, permesso negato' });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error("Errore JavaScript durante l'aggiunta del prodotto", { error: err.message });
      return res.status(500).json({ message: 'Errore standard di JavaScript', error: err.message });
    } else {
      logger.error("Errore sconosciuto durante l'aggiunta del prodotto", { error: err });
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
    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json(responses.notHeader);
    }
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!nameProduct || !price || !img || !category) {
      logger.warn('Parametri mancanti nella richiesta')
      return res.status(400).json({
        'message': 'Parametri mancanti nella richiesta'
      });
    }

    
    if (!id) {
      logger.warn('id non valido o mancante',id)
      return res.status(400).json(responses.idNotValid);
    }

    logger.info('tentativo di aggiornare un prodotto ricevuto')


    const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      logger.warn('Utente non autenticato', { token });
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const userId = verifyUser.userId;

   
    const userData = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);

    if (!userData) {
      logger.warn('Utente non trovato nella tabella users', { userId });
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    const isAdmin = userData.is_admin;


    if(isAdmin==1)
    {
      const result = await db.run(
        'UPDATE products SET nameProduct = ?, price = ?, img = ?, category = ? WHERE id = ?',
        [nameProduct, price, img, category, id]
      );
  
      if (result.changes && result.changes > 0) {
        logger.info('Prodotto  aggiornato con successo',id)
        return res.status(200).json({
          'message': 'Prodotto aggiornato con successo',
          'productId': id
        });
      } else {
        logger.warn('Nessuna modifica apportata al prodotto')
        return res.status(400).json({
          'message': 'Nessuna modifica apportata al prodotto'
        });
      }
    }
   else{
    logger.warn("Non hai i permessi per l'operazione")
    return res.status(401).json({
      'message': "Non hai i permessi per l'operazione"
    });
   }
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Errore JavaScript durante l'aggiornamento del prodotto", { error: err.message });
      return res.status(500).json({ message: 'Errore standard di JavaScript', error: err.message });
    } else {
      logger.error("Errore sconosciuto durante l'aggiornamento del prodotto", { error: err });
      return res.status(500).json({ message: 'Errore sconosciuto' });
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
      return res.status(400).json(responses.idNotValid);
    }

   
    logger.info('tentativo di eliminare un prodotto ricevuto')

    const existingProduct = await db.get('SELECT id FROM products WHERE id = ?', [id]);

    if (!existingProduct) {
      return res.status(404).json(responses.notFoundProduct);
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json(responses.notHeader);
    }
    const token = authHeader && authHeader.split(" ")[1];

    
    const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      logger.warn('Utente non autenticato', { token });
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const userId = verifyUser.userId;

   
    const userData = await db.get('SELECT is_admin FROM users WHERE id = ?', [userId]);

    if (!userData) {
      logger.warn('Utente non trovato nella tabella users', { userId });
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    const isAdmin = userData.is_admin;



   
    if(isAdmin==1){
      const result = await db.run(
        'DELETE from products WHERE id = ?',[id]
      );
  
      if (result.changes && result.changes > 0) {
        logger.info('Prodotto eliminato con successo',id)
        return res.status(200).json({
          'message': 'Prodotto eliminato con successo',
          'productId': id
        });
      } else {
        logger.warn('prodotto non eliminato')
        return res.status(400).json({
          'message': 'prodotto non eliminato'
        });
      }
    }
    else{
      return res.status(401).json({
        'message': "Non hai i permessi per l'operazione"
      });
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Errore JavaScript durante l'aggiunta del prodotto", { error: err.message });
      return res.status(500).json({ message: 'Errore standard di JavaScript', error: err.message });
    } else {
      logger.error("Errore sconosciuto durante l'aggiunta del prodotto", { error: err });
      return res.status(500).json({ message: 'Errore sconosciuto' });
    }
    
  }
});