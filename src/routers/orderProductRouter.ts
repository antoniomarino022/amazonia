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

// In che senso modificare i prodotti? una volta piazzato un ordine non puoi di logica modificarlo. (Amazon permette di farlo, ma c'è una logica piu' complessa, che i prodotti non siano spediti);
// La tabella orders_product è progettata per gestire una relazione molti-a-molti tra ordini e prodotti. Un singolo ordine può includere molti prodotti, e ciascun prodotto può essere presente in più ordini.
  routerOrderProduct.post("/", async () => {

  });

  routerOrderProduct.put("/", async () => {

  });

  routerOrderProduct.delete("/", async () => {

  });