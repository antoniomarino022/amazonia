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
routerCart.post('', authenticateToken, async (req:Request,res:Response)=>{

  try {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      logger.warn('Nessun header di autorizzazione presente');
      return res.status(401).json({ message: 'Autorizzazione mancante' });
    }

    const token = authHeader && authHeader.split(" ")[1];

    const { userId, productId , quantity } = req.body

    if(!userId || !productId || ! quantity){
      logger.warn('parametri mancanti');
      return res.status(400).json({
        'message':'parametri mancanti'
      });
    };

    logger.info('tentativo di aggiungere un prodotto al carrello ricevuto');
    
    const db = await getDb();
  
    
    const verifyUser = await db.get('SELECT userId FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      logger.warn('Utente non autenticato', { token });
      return res.status(401).json(responses.notHeader);
    }else{

      const result = await db.run('INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)',[userId,productId,quantity]);
      console.log(result); 
      if(result.changes && result.changes > 0){
        logger.info('prodotto aggiunto al carrelo',productId,quantity);
        res.status(201).json({
          'message':'prodotto aggiunto al carrelo',
          'prodotto':productId,quantity
        });
      }else{
        logger.info('prodotto non aggiunto al carrelo',productId,quantity);
        res.status(500).json({
          'message':'prodotto non aggiunto al carrelo',
          });
      }
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

})

