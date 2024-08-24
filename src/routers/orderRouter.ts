import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { authenticateToken } from "../middleware/authenticateToken";

config()

export const routerOrder = express.Router()

async function getDb() {
    return open({
      filename: 'db.sqlite',
      driver: sqlite3.Database
    });
  };