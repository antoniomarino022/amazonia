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


  interface UserRequestBody {
    username: string;
    email: string;
    password: string;
  }
  
  
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
    const { username, email, password }: UserRequestBody = req.body;

    if (!username || !email || !password ) {
      logger.warn('Parametri mancanti nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Alcuni parametri sono mancanti o non validi' });
    }

    logger.info('Tentativo di registrazione utente ricevuto', { username, email });

   
    if (!validateUsername(username)) {
      logger.warn('Username non valido', { username });
      return res.status(400).json(responses.invalidUsername);
    }

    if (!validateEmail(email)) {
      logger.warn('Email non valida', { email });
      return res.status(400).json(responses.invalidEmail);
    }

    if (!validatePassword(password)) {
      logger.warn('Password non valida');
      return res.status(400).json(responses.invalidPassword);
    }

    const db = await getDb();
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      logger.warn('Tentativo di registrazione con email già esistente', { email });
      return res.status(409).json(responses.userExists);  
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);


    const result = await db.run(
      "INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, 0]
    );

    if (result.changes && result.changes > 0) {
      logger.info('Nuovo utente registrato con successo', { username, email, isAdmin: "false" });
      const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      return res.status(201).json({ message: 'Utente registrato', user }); 
    } else {
      logger.error('Errore durante la registrazione utente', { username, email });
      return res.status(500).json({ message: "Si è verificato un errore durante la registrazione" });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error('Errore JavaScript durante la registrazione utente', { error: err.message });
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error('Errore sconosciuto durante la registrazione utente', { error: err });
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }});




// update user
routerUser.put('/update/:id', authenticateToken, async (req: Request, res: Response) => {
  logger.info("Tentativo di modificare l'utente ricevuto", { username: req.body.username });

  try {
    const db = await getDb();
    const { username, password }: UserRequestBody = req.body;
    const { id } = req.params;

    
    if (!id) {
      logger.warn('ID utente mancante nella richiesta', { id: req.params });
      return res.status(400).json({ message: 'ID utente mancante o non valido' });
    }
    
    if (!username) {
      logger.warn('Username mancante nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Username mancante o non valido' });
    }
    if (!password) {
      logger.warn('Password mancante nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Password mancante o non valida' });
    }

    if (!validateUsername(username)) {
      logger.warn('Username non valido', { username });
      return res.status(400).json(responses.invalidUsername);
    }

    if (!validatePassword(password)) {
      logger.warn('Password non valida');
      return res.status(400).json(responses.invalidPassword);
    }

    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists); 
    }

    
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, passwordHash, id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Utente modificato con successo`, { username, id });
      return res.status(200).json({ message: "Utente modificato con successo" });
    } else {
      logger.error("Nessuna modifica applicata all'utente", { username, id });
      return res.status(304).json({ message: "Nessuna modifica applicata all'utente" }); // Usa 304 per "Not Modified"
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});




// delete user
routerUser.delete('/:id', async (req: Request, res: Response) => {
  logger.info("Tentativo di eliminare l'utente ricevuto", { 'id': req.params.id });

  try {
    const db = await getDb();
    const { id } = req.params;

    if (!id) {
      logger.warn('ID utente mancante nella richiesta');
      return res.status(400).json({ message: 'ID richiesto' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!existingUser) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists);  // Usa 404 per "Not Found"
    }

    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Utente eliminato con successo`, { id });
      return res.status(204).send();  // Usa 204 per "No Content"
    } else {
      logger.error('Utente non eliminato', { id });
      return res.status(400).json({ message: 'Utente non eliminato' });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});

//ADMIN

// register user as admin
routerUser.post('/admin', async (req: Request, res: Response) => {
  try {
    const { username, email, password}: UserRequestBody = req.body;

    if (!username || !email || !password ) {
      logger.warn('Parametri mancanti nella richiesta', { body: req.body });
      return res.status(400).json({ message: 'Alcuni parametri sono mancanti o non validi' });
    }

    logger.info('Tentativo di registrazione utente ricevuto', { username, email });

   
    if (!validateUsername(username)) {
      logger.warn('Username non valido', { username });
      return res.status(400).json(responses.invalidUsername);
    }

    if (!validateEmail(email)) {
      logger.warn('Email non valida', { email });
      return res.status(400).json(responses.invalidEmail);
    }

    if (!validatePassword(password)) {
      logger.warn('Password non valida');
      return res.status(400).json(responses.invalidPassword);
    }
    if(!whitelist.includes(email))
    {
      logger.warn('Tentativo di registrazione admin senza email giusta');
      return res.status(401).json(responses.invalidEmail);
    }
    const db = await getDb();
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      logger.warn('Tentativo di registrazione con email già esistente', { email });
      return res.status(409).json(responses.userExists);  
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);


    const result = await db.run(
      "INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, 1]
    );

    if (result.changes && result.changes > 0) {
      logger.info('Nuovo utente registrato con successo', { username, email, isAdmin: "true" });
      const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      return res.status(201).json({ message: 'Utente registrato', user }); 
    } else {
      logger.error('Errore durante la registrazione utente', { username, email });
      return res.status(500).json({ message: "Si è verificato un errore durante la registrazione" });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error('Errore JavaScript durante la registrazione utente', { error: err.message });
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error('Errore sconosciuto durante la registrazione utente', { error: err });
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }});


  
// revoke admin permissions
routerUser.put('/admin/:id', authenticateToken, async (req: Request, res: Response) => {
  logger.info("Tentativo di modificare l'admin ricevuto", { username: req.body.username });

  try {
    const db = await getDb();
    const { id } = req.params;

    
    if (!id) {
      logger.warn('ID utente mancante nella richiesta', { id: req.params });
      return res.status(400).json({ message: 'ID utente mancante o non valido' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists); 
    }
    if(user.is_admin==0)
      {
        logger.warn('L\'utente non è un admin', { id });
        return res.status(400).json(responses.notAdmin); 
      }
    
    const result = await db.run('UPDATE users SET is_admin = ? WHERE id = ?', [0, id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Utente modificato con successo`, { id });
      return res.status(200).json({ message: "Admin modificato con successo" });
    } else {
      logger.error("Nessuna modifica applicata all'utente", { id });
      return res.status(304).json({ message: "Nessuna modifica applicata all'admin" }); // Usa 304 per "Not Modified"
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});




// grant admin permissions
routerUser.put('/admin/grant/:id', authenticateToken, async (req: Request, res: Response) => {
  logger.info("Tentativo di modificare l'admin ricevuto", { username: req.body.username });

  try {
    const db = await getDb();
    const { id } = req.params;

    
    if (!id) {
      logger.warn('ID utente mancante nella richiesta', { id: req.params });
      return res.status(400).json({ message: 'ID utente mancante o non valido' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists); 
    }
    if(user.is_admin==1)
      {
        logger.warn('L\'utente è un admin già!', { id });
        return res.status(400).json(responses.alreadyAdmin); 
      }
    
    const result = await db.run('UPDATE users SET is_admin = ? WHERE id = ?', [1, id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Utente modificato con successo`, { id });
      return res.status(200).json({ message: "Admin modificato con successo" });
    } else {
      logger.error("Nessuna modifica applicata all'utente", { id });
      return res.status(304).json({ message: "Nessuna modifica applicata all'admin" }); // Usa 304 per "Not Modified"
    }
  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore interno al server', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});




// delete user
routerUser.delete('/:id', async (req: Request, res: Response) => {
  logger.info("Tentativo di eliminare l'utente ricevuto", { 'id': req.params.id });

  try {
    const db = await getDb();
    const { id } = req.params;

    if (!id) {
      logger.warn('ID utente mancante nella richiesta');
      return res.status(400).json({ message: 'ID richiesto' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!existingUser) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists);  // Usa 404 per "Not Found"
    }

    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Utente eliminato con successo`, { id });
      return res.status(204).send();  // Usa 204 per "No Content"
    } else {
      logger.error('Utente non eliminato', { id });
      return res.status(400).json({ message: 'Utente non eliminato' });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});

// delete admin
routerUser.delete('/admin/:id', async (req: Request, res: Response) => {
  logger.info("Tentativo di eliminare l'utente admin ricevuto", { 'id': req.params.id });

  try {
    const db = await getDb();
    const { id } = req.params;

    if (!id) {
      logger.warn('ID utente mancante nella richiesta');
      return res.status(400).json({ message: 'ID richiesto' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE id = ?', [id]);

    if (!existingUser) {
      logger.warn('Utente non trovato', { id });
      return res.status(404).json(responses.notUserExists);  // Usa 404 per "Not Found"
    }
    if(existingUser.is_admin==0)
    {
      logger.warn('L\'utente non è un admin', { id });
      return res.status(400).json(responses.notAdmin); 
    }
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes && result.changes > 0) {
      logger.info(`Admin eliminato con successo`, { id });
      return res.status(204).send();  // Usa 204 per "No Content"
    } else {
      logger.error('Admin non eliminato', { id });
      return res.status(400).json({ message: 'Admin non eliminato' });
    }

  } catch (err) {
    if (err instanceof Error) {
      logger.error(`Errore JavaScript: ${err.message}`);
      return res.status(500).json({ message: 'Errore standard di JavaScript', errore: err.message });
    } else {
      logger.error(`Errore sconosciuto: ${err}`);
      return res.status(500).json({ message: 'Errore sconosciuto', err });
    }
  }
});