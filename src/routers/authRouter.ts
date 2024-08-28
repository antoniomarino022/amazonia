import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import logger from "../middleware/logger";
import { validateUsername,validateEmail,validatePassword } from "../middleware/validators";
import { responses } from "../utils/responses";
import { authenticateToken, generateAccessToken } from "../middleware/authenticateToken";

config()

export const routerAuth = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };



// clear auth

routerAuth.delete('/clean', async (req: Request, res: Response) => {
  try {
    logger.info('tentativo di svuotare la tabella auth ricevuto');

    const db = await getDb();
    const result = await db.run('DELETE FROM auth');

    
    if (result.changes && result.changes > 0) {
      return res.status(200).json({ message: `${result.changes} record(s) eliminati dalla tabella auth.` });
    } else {
      return res.status(404).json({ message: 'Nessun record trovato nella tabella auth.' });
    }
  } catch (err) {
    if(err instanceof Error){
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});





  // login user
routerAuth.post('/login',async (req:Request,res:Response)=>{

  try {

    
    const db = await getDb();
    const { email, password } = req.body;

    if (!email) {
      logger.warn('email mancante nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'email mancante o non valido' });
    }
    if (!password) {
      logger.warn('Password mancante nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Password mancante o non valida' });
    }

    if(!validateEmail(email)){
      logger.warn(`email non valida ${email}`);
      return res.status(400).json(responses.invalidEmail)
    }

    if(!validatePassword(password)){
      logger.warn(`password non valida ${password}`);
      return res.status(400).json(responses.invalidPassword)
    }


    const userVerify = await db.get('SELECT * FROM users WHERE email = ?',[email]);


    if (!userVerify) {
      logger.warn(`Email o password non corretti ${email}`)
      return res.status(401).json({
        message: "Email o password non corretti",
      });
    }

    logger.info('tentativo di login ricevuto',email);

    

    const match = await bcrypt.compare(password, userVerify.password);

    if(match){
      const userId = userVerify.id
      const token = generateAccessToken(userId);

      const success = await db.run('INSERT INTO auth (userId,token) VALUES (?,?)',[userId,token]);

      if (success.changes && success.changes > 0) {
        logger.info(`login effettuato ${email} `)
        return res.status(200).json({ message: 'login effettuato',token});
      } else {
        logger.error(`si è verificato un errore durante il login ${email} `)
        return res.status(500).json({ message: "si è verificato un errore durante il login" });
      }
    }

  } catch (err) {
    if(err instanceof Error){
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }

});


// logout user

routerAuth.delete('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      logger.warn('Token mancante o non valido', { token });
      return res.status(400).json({
        message: 'Token mancante o non valido'
      });
    }

    logger.info('Tentativo di logout ricevuto', { token });

    const verifyUser = await db.get('SELECT * FROM auth WHERE token = ?', [token]);

    if (!verifyUser) {
      return res.status(400).json({
        message: 'Token non corrispondente'
      });
    }

    const result = await db.run('DELETE FROM auth WHERE token = ?', [token]);

    if (result.changes && result.changes  > 0) {
      logger.info('Logout effettuato con successo', { token });
      return res.status(204).json({
        message: 'Logout effettuato con successo'
      });
    } else {
      logger.error('Errore durante il logout', { token });
      return res.status(500).json({
        message: 'Si è verificato un errore durante il logout'
      });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({
        message: 'Errore standard di JS',
        errore: err.message
      });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({
        message: 'Errore sconosciuto',
        err
      });
    }
  }
});