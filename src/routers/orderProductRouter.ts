import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerOrderProduct = express.Router();

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };
// In che senso modificare i prodotti? una volta piazzato un ordine non puoi di logica modificarlo. (Amazon permette di farlo, ma c'è una logica piu' complessa, che i prodotti non siano spediti)
  routerOrderProduct.post("/", async () => {

  });

  routerOrderProduct.put("/", async () => {

  });

  routerOrderProduct.delete("/", async () => {

  });