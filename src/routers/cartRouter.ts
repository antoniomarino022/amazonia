import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";
import logger from "../middleware/logger";
import { responses } from "../utils/responses";

config()

export const routerCart = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };


// clear cart
routerCart.delete('/clean',authenticateToken, async (req:Request,res:Response)=>{

try {

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.warn('Nessun header di autorizzazione presente');
    return res.status(401).json({ message: 'Autorizzazione mancante' });
  }
  const token = authHeader && authHeader.split(" ")[1];

  logger.info('tentativo di svuotare la tabella cart ricevuto');
  
  const db = await getDb();
 
   
  const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);

  if (!verifyUser) {
    logger.warn('Utente non autenticato', { token });
    return res.status(401).json(responses.notHeader);
  }else{

  const result = await db.run('DELETE FROM cart');

  if(result.changes && result.changes > 0){
    logger.info('tabella cart svuotata con successo');
    return res.status(200).json({'message':'tabella cart svuotata con successo'});
  }else{
    logger.error('tabella cart non svuotata ');
    return res.status(500).json({'message':'tabella cart non  svuotata '});
  } 
   };

} catch (err) {

  if(err instanceof Error){
    logger.error('errore standard di js',err.message);
    return res.status(500).json({'message':'errore standar di js','errore':err.message})
  }else{
    logger.error('errore sconosciuto',err);
    return res.status(500).json({'message':'errore sconosciuto','errore':err})
  };

}

});



// add product on cart
routerCart.post('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const  userId = req.params.id;

    
    if (!productId || !quantity) {
      logger.warn('Parametri mancanti', req.body);
      return res.status(400).json({ message: 'Parametri mancanti', body: req.body });
    }

    logger.info('Tentativo di aggiungere prodotto al carrello');

    const db = await getDb();

   
    const foundUser = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
    if (!foundUser) {
      logger.warn('Utente non trovato', { userId });
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    const foundProduct = await db.get('SELECT id FROM products WHERE id = ?', [productId]);
    if (!foundProduct) {
      logger.warn('Prodotto non trovato', { productId });
      return res.status(404).json({ message: 'Prodotto non trovato' });
    }

   
    const result = await db.run('INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);

    if (result.changes && result.changes> 0) {
      logger.info('Prodotto aggiunto al carrello con successo');
      return res.status(201).json({ message: 'Prodotto aggiunto al carrello con successo' });
    } else {
      logger.error('Impossibile aggiungere prodotto al carrello');
      return res.status(500).json({ message: 'Impossibile aggiungere prodotto al carrello' });
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





// update cart

routerCart.put('/:id',authenticateToken,async(req:Request,res:Response)=>{
  try {
    
    const { productId , quantity} = req.body;
    const { id } = req.params;

    if(!productId || !quantity){
      logger.warn('parametri mancanti',req.body);
      res.status(400).json({
        message:'parametri mancanti',
        body:req.body
      });
    };

    if(!id){
      logger.warn('id mancannte o non valido',req.params);
      res.status(400).json(responses.idNotValid)
    }

    logger.info('tentativo di modificare il carello ricevuto');

    const db = await getDb();
    const foundProduct = await db.get('SELECT id FROM products WHERE id = ?', [productId]);

    if(!foundProduct){
      logger.warn('prodotto non trovato');
      return res.status(404).json(responses.notFoundProduct);
    };

      
    const foundCartItem = await db.get('SELECT * FROM cart WHERE id = ? AND productId = ?', [id, productId]);
    if (!foundCartItem) {
      logger.warn('Prodotto non trovato nel carrello', { id, productId });
      return res.status(404).json({ message: 'Prodotto non trovato nel carrello' });
    }

    const result = await db.run('UPDATE cart SET productId = ?, quantity = ? WHERE id = ?',[productId,quantity,id]);
    if(result.changes && result.changes > 0){
      logger.info('prodotto modificato con successo');
      return res.status(200).json({'message':'prodotto modificato con successo'});
    }else{
      logger.info('prodotto non modificato');
      return res.status(500).json({'message':'prodotto non modificato'});
    }
  } catch (err) {
    if(err instanceof Error){
      logger.error('errore standard di js',err.message);
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      logger.error('errore sconosciuto',err);
      return res.status(500).json({'message':'errore sconosciuto','errore':err})
    };
  };
  });




  // delete product on cart
  routerCart.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { productId } = req.body;
  
     
      if (!id) {
        logger.warn('ID del carrello mancante o non valido', id);
        return res.status(400).json({ message: 'ID carrello mancante o non valido' });
      }
  
      if (!productId) {
        logger.warn('ID del prodotto mancante', productId);
        return res.status(400).json({ message: 'ID prodotto mancante' });
      }
  
      logger.info('Tentativo di eliminare un prodotto dal carrello ricevuto');
  
      const db = await getDb();
  
   
      const foundProduct = await db.get('SELECT id FROM products WHERE id = ?', [productId]);
      if (!foundProduct) {
        logger.warn('Prodotto non trovato nel database', { productId });
        return res.status(404).json({ message: 'Prodotto non trovato nel database' });
      }
  
      
      const foundCartItem = await db.get('SELECT * FROM cart WHERE id = ? AND productId = ?', [id, productId]);
      if (!foundCartItem) {
        logger.warn('Prodotto non trovato nel carrello', { id, productId });
        return res.status(404).json({ message: 'Prodotto non trovato nel carrello' });
      }
  
   
      const result = await db.run('DELETE FROM cart WHERE id = ? AND productId = ?', [id, productId]);
      if (result.changes && result.changes > 0) {
        logger.info('Prodotto rimosso con successo dal carrello');
        return res.status(200).json({ message: 'Prodotto rimosso con successo dal carrello' });
      } else {
        logger.error('Errore durante la rimozione del prodotto dal carrello');
        return res.status(500).json({ message: 'Errore durante la rimozione del prodotto dal carrello' });
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
  