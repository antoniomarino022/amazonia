import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import logger from "../middleware/logger";
import { validateUsername,validateEmail,validatePassword } from "../middleware/validators";
import { responses } from "../utils/responses";
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerUser = express.Router();

const whitelist = ["gabrolr70@gmail.com", "sofiacacca96@gmai.com"];

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };


  // clean users
  routerUser.delete('/clean',async (req:Request,res:Response)=>{

    try {
      
      logger.info('Tentativo di cancella la tabella users ricevuto');
      const db = await getDb();
  
      const result = await db.run('DELETE FROM users');
  
      if(result.changes && result.changes > 0){
        logger.info('tabella svuotata')
        return res.status(200).json({
          'message':'tabella svuotata'
        })
      }else{
        logger.warn('tabella non svuotata')
        return res.status(400).json({
          'message':'tabella non svuotata'
        })
      };
      
    } catch (err) {
      if(err instanceof Error){
        logger.error(`Errore JavaScript: ${err.message}`);
        return res.status(500).json({'message':'errore standar di js','errore':err.message})
      }else{
        logger.error(`Errore sconosciuto: ${err}`);
        return res.status(500).json({ message: 'Errore sconosciuto', err });
      }
    }
  
  })
  






// register user
routerUser.post('', async (req: Request, res: Response) => {

  try {

    logger.info('Tentativo di registrazione utente ricevuto', { username: req.body.username, email: req.body.email });

    const db = await getDb();
    const { username, email, password } = req.body;

    // Validazione avanzata di username
    if (!validateUsername(username)) {
      logger.warn('Username non valido', { username }); // Log per username non valido
      return res.status(400).json(responses.invalidUsername);
    }

    // Validazione email
    if (!validateEmail(email)) {
      logger.warn('Email non valida', { email }); // Log per email non valida
      return res.status(400).json(responses.invalidEmail);
    }

    // Validazione password
    if (!validatePassword(password)) {
      logger.warn('Password non valida', { password }); // Log per password non valida
      return res.status(400).json(responses.invalidPassword);
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Verifica se l'utente esiste già
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      logger.warn('Tentativo di registrazione con email già esistente', { email }); // Log per tentativo di registrazione con email esistente
      return res.status(400).json(responses.userExists);
    } else {
      const result = await db.run("INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)", [username, email, passwordHash, 0]);
      
      if (result.changes && result.changes > 0) {
        logger.info('Nuovo utente registrato con successo', { username, email }); // Log per successo registrazione
        const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        return res.status(200).json({ message: 'Utente registrato', user: user });
      } else {
        logger.error('Errore durante la registrazione utente', { username, email }); // Log per errore durante l'inserimento
        return res.status(500).json({ message: "si è verificato un errore durante la registrazione" });
      }
    }

  } catch (err) {
    if(err instanceof Error){
      logger.error('Errore JavaScript durante la registrazione utente', { error: err.message }); // Log per errore JavaScript
      return res.status(500).json({'message':'errore standar di js','errore':err.message});
    }else{
      logger.error('Errore sconosciuto durante la registrazione utente', { error: err }); // Log per errore sconosciuto
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});


// register user as admin
routerUser.post('/admin', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { username, email, password } = req.body;

      // Validazione avanzata di username
    if (!validateUsername(username)) {
      logger.warn('Username non valido', { username }); 
      return res.status(400).json(responses.invalidUsername);
      
    }

    // Validazione email
    if (!validateEmail(email)) {
      logger.warn('Email non valida', { email }); 
      return res.status(400).json(responses.invalidEmail);
    }

    // Validazione password
    if (!validatePassword(password)) {
      logger.warn('Password non valida', { password }); 
      return res.status(400).json(responses.invalidPassword);
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      logger.warn(`Tentativo di registrazione con email già esistente: ${email}`);
      return res.status(400).json(responses.userExists);
    }
    if(whitelist.includes(email))
    {
      const result = await db.run("INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)", [username, email, passwordHash, 1]);

      if (result.changes && result.changes > 0) {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        logger.info(`Nuovo admin registrato: ${username} (${email})`);
        return res.status(200).json({ message: 'Utente registrato', user: user });
      } else {
        logger.error(`Errore durante la registrazione di ${username} (${email})`);
        return res.status(500).json({ message: "Si è verificato un errore durante la registrazione" });
      }
    }
    else
    {
      return res.status(401).json({ message: "Non è un email admin" });
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


// update user
routerUser.put('/update/:id',authenticateToken ,async (req: Request, res: Response) => {
  try {
    const db = await getDb();

    const { username, password } = req.body;
    const { id } = req.params;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username e password sono richiesti"
      });
    }


    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({
        message: "Utente non trovato"
      });
    }


    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username,  passwordHash, id]);

    if (result.changes && result.changes > 0) {
      return res.status(200).json({
        message: "Utente modificato con successo"
      });
    } else {
      return res.status(400).json({
        message: "Utente non modificato"
      });
    }
  } catch (err) {
    if(err instanceof Error){
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});





// delete user
routerUser.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb()
    const { id } = req.params;

    if(!id){
      res.status(400).json({
        'message':'id richiesto'
      })
    }

    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

      if (!existingUser) {
        return res.status(400).json({
          'message': "utente non esistente"
        });
      }else{
        const result = await db.run('DELETE FROM users WHERE id = ?',[id]);

        if(result.changes && result.changes > 0){
          return res.status(200).json({
            'message':'utente eliminato con successo'
          });
        }else{
           return res.status(400).json({
            'message':'utente non eliminato'
          });
        }
      }

  } catch (err) {
    if(err instanceof Error){
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});




