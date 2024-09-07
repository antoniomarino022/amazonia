import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import logger from "../middleware/logger";
import { responses } from "../utils/responses";
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerOrder = express.Router()

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };


// clear table order
routerOrder.delete('/', authenticateToken, async (req: Request, res: Response) => {

  try {
    
    logger.info("tentativo di svuotare la tabella orders ricevuto");

    const db = await getDb();
    const result = await db.run('DELETE FROM orders');

    if(result.changes && result.changes > 0){
      logger.info("tabella orders svuotata con successo");
      res.status(200).json({ message: 'tabella orders svuotata con successo' });
    } else {
      logger.info("tabella orders non svuotata");
      res.status(500).json({ message: 'tabella orders non svuotata' });
    };
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



// add order

routerOrder.post("/", authenticateToken, async (req: Request, res: Response) => {

  try {

    const { userId , status , date } = req.body;

    if(!userId || !status || !date){
      logger.warn('parametri mancanti');
      return res.status(400).json({ message: 'parametri mancanti' });
    }

    const db = await getDb();
    const userVerify = await db.get(`SELECT * FROM users WHERE id = ?`, [userId]);

    if(!userVerify){
      logger.warn('utente non trovato');
      return res.status(400).json(responses.notUserExists);
    }

    const result = await db.run(`INSERT INTO orders (userId, status, date) VALUES (?, ?, ?)`, [userId, status, date]);
    if(result && result.changes && result.changes > 0){
      logger.info('ordine aggiunto con successo');
      return res.status(200).json({ message: 'ordine aggiunto con successo' });
    } else {
      logger.warn('ordine non aggiunto');
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
  }
);


// update order
routerOrder.put('/:id', authenticateToken, async (req: Request, res: Response) => {

  try {
    
    const { id } = req.params;
    const { status } = req.body;

    if(!id || !status){
      logger.warn('parametri mancanti');
      return res.status(400).json({ message: 'parametri mancanti' });
    }

    logger.info('tentativo di aggiornare l ordine ricevuto ');
    
    const db = await getDb();

    const verifyOrder = await db.get(`SELECT * FROM orders WHERE id = ?`, [id]);
    if(!verifyOrder){
      logger.warn('ordine non trovato');
      return res.status(400).json({ message: 'ordine non trovato' });
    }

    const result = await db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

    if(result && result.changes && result.changes > 0){
      logger.info('ordine aggiornato con successo');
      return res.status(200).json({ message: 'ordine aggiornato con successo' });
    } else {
      logger.warn('ordine non aggiornato');
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



// delete order

routerOrder.delete('/:id', authenticateToken, async (req: Request, res: Response) => {

  try {
    
    const { id } = req.params;

    if(!id){
      logger.warn('id non valido o mancante');
      return res.status(400).json(responses.idNotValid);
    }

    const db = await getDb();
    const verifyOrder = await db.get(`SELECT * FROM orders WHERE id = ?`, [id]);

    if(!verifyOrder){
      logger.warn('ordine non trovato');
      return res.status(400).json({ message: 'ordine non trovato' });
    };

    const result = await db.run(`DELETE FROM orders WHERE id = ?`, [id]);
    if(result && result.changes && result.changes > 0){
      logger.info('ordine cancellato con successo');
      return res.status(200).json({ message: 'ordine cancellato con successo' });
    } else {
      logger.warn('ordine non cancellato');
      return res.status(500).json({ message: 'ordine non cancellato' });
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


