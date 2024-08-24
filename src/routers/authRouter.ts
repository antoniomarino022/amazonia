import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import { authenticateToken, generateAccessToken } from "../middleware/authenticateToken";

config()

export const routerAuth = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };



  // login user
routerAuth.post('/login',async (req:Request,res:Response)=>{

  try {
    const db = await getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        'message': "username, email e password sono richiesti"
      });
    }

    const userVerify = await db.get('SELECT * FROM users WHERE email = ?',[email]);
    console.log(userVerify)

    if (!userVerify) {
      return res.status(400).json({
        message: "Email o password non corretti",
      });
    }

    

    const match = await bcrypt.compare(password, userVerify.password);
    console.log(match)

    if(match){
      const userId = userVerify.id
      console.log(userId)
      const token = generateAccessToken(userId);
      console.log(token)

      const success = await db.run('INSERT INTO auth (userId,token) VALUES (?,?)',[userId,token]);

      if (success.changes && success.changes > 0) {
        return res.status(200).json({ message: 'login effettuato',token});
      } else {
        return res.status(500).json({ message: "si è verificato un errore durante il login" });
      }
    }

  } catch (error) {
    return res.status(500).json({ message: 'Errore nel server', error });
  }

})


// logout user

routerAuth.delete('/logout', authenticateToken, async (req:Request,res:Response)=>{

  try {
    const db = await getDb();
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    

    if(!token){
      res.status(400).json({
        'message':'token non valido'
      })
    };

    const verifyUser = await db.get('SELECT * FROM auth WHERE token = ?',[token]);

    if(!verifyUser){
      res.status(400).json({
        'message':'token non corrispodente'
      })
    }else{
      const result = await db.run('DELETE FROM auth WHERE token = ?',[token]);

      if(result.changes && result.changes > 0){
        res.status(200).json({
          'message':'logout effettuato con successo'
        })
      }else{
        res.status(400).json({
          'message':'logout non effettuato'
        })
      }
    }

  } catch (error) {
      return res.status(500).json({ message: 'Errore nel server', error });
  }

});