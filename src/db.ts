import sqlite3 from "sqlite3";

const db = new sqlite3.Database("db.sqlite");

db.run("INSERT INTO users(id) VALUES('CIAO')");
