import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import logger from "./logger";


config();

// Estende l'interfaccia Request di Express per includere l'utente decodificato dal token JWT
export interface JwtRequest extends Request {
  user?: Object; // L'oggetto user sarà aggiunto a questa interfaccia se il token JWT è valido
}

// Middleware per autenticare il token JWT
export const authenticateToken = (
  req: JwtRequest,
  res: Response,
  next: NextFunction
) => {
  // Estrae il token dall'header Authorization della richiesta
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.warn('Nessun header di autorizzazione presente');
    return res.status(401).json({ message: 'Autorizzazione mancante' });
  }
  const token = authHeader && authHeader.split(" ")[1];

  // Se il token non è presente, restituisce uno status 401 (Unauthorized)
  if (token == null)
    return res.sendStatus(401).json({ message: "Token NON VALIDO" });

  // Verifica il token utilizzando la chiave segreta definita nelle variabili di ambiente
  jwt.verify(token, process.env.TOKEN_SECRET!, (err, user) => {
    // Se la verifica fallisce, restituisce uno status 403 (Forbidden)
    if (err) return res.sendStatus(403);

    // Se la verifica ha successo, aggiunge l'utente decodificato alla richiesta e passa al prossimo middleware
    req.user = user;
    next();
  });
};

// Funzione per generare un token di accesso JWT
export const generateAccessToken = (userId: string) => {
  // Il payload contiene l'ID dell'utente
  const payload = { id: userId };

  // Genera un token JWT firmato con la chiave segreta e un tempo di scadenza di 1800 secondi (30 minuti)
  return jwt.sign(payload, process.env.TOKEN_SECRET!, { expiresIn: "1800s" });
};
