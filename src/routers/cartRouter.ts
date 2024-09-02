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
routerCart.delete('',authenticateToken, async (req:Request,res:Response)=>{

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
    
  const result = await db.run('DELETE FROM cart');

  if(result.changes && result.changes > 0){
    logger.info('tabella cart svuotata con successo');
    return res.status(204).json({'message':'tabella cart svuotata con successo'});
  }else{
    logger.error('tabella cart non svuotata ');
    return res.status(500).json({'message':'tabella cart non  svuotata '});
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