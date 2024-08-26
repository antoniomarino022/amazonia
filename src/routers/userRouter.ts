import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerUser = express.Router()

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };


  // clean users
  routerUser.delete('/clean',async (req:Request,res:Response)=>{

    try {
      console.log('Chiamato endpoint /clean');
      const db = await getDb();
  
      const result = await db.run('DELETE FROM users');
  
      if(result.changes && result.changes > 0){
        return res.status(200).json({
          'message':'tabella svuotata'
        })
      }else{
        return res.status(400).json({
          'message':'tabella non svuotata'
        })
      };
      
    } catch (err) {
      if(err instanceof Error){
        return res.status(500).json({'message':'errore standar di js','errore':err.message})
      }else{
        return res.status(500).json({ message: 'Errore sconosciuto', err });
      }
    }
  
  })
  






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

  } catch (err) {
    if(err instanceof Error){
      return res.status(500).json({'message':'errore standar di js','errore':err.message})
    }else{
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




