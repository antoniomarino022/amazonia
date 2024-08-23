import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';

config()

export const routerUser = express.Router()

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };



// register user
routerUser.post('', async (req: Request, res: Response) => {

  try {
    const db = await getDb();
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        'message': "username, email e password sono richiesti"
      });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(400).json({
        'message': "utente già esistente"
      });
    } else {
      const result = await db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, passwordHash]);
      
      if (result.changes && result.changes > 0) {
        const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        return res.status(200).json({ message: 'Utente registrato', user: user });
      } else {
        return res.status(500).json({ message: "si è verificato un errore durante la registrazione" });
      }
    }

  } catch (error) {
    return res.status(500).json({ message: 'Errore nel server', error });
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
          res.status(200).json({
            'message':'utente eliminato con successo'
          });
        }else{
          res.status(400).json({
            'message':'utente non eliminato'
          });
        }
      }

  } catch (error) {
    return res.status(500).json({ message: 'Errore nel server', error });
  }
})
