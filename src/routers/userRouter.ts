import express, { Response, Request } from "express";
import { config } from "dotenv";
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';

config()

export const routerUser = express.Router()

async function getDb() {
    return open({
      filename: 'mydb.sqlite',
      driver: sqlite3.Database
    });
  };