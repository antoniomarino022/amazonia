import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // Livello minimo di log che verrà registrato (può essere 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }), // Include lo stack trace degli errori
    format.splat(), // Supporta la sostituzione simile a printf
    format.json() // Formatta i log come JSON
  ),
  defaultMeta: { service: 'user-service' }, // Meta informazioni comuni in tutti i log
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log solo errori su 'error.log'
    new transports.File({ filename: 'logs/combined.log' }) // Log tutti i messaggi su 'combined.log'
  ]
});

// Se l'applicazione non è in produzione, aggiungi anche un logger che stampa sulla console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(), // Colora l'output per renderlo più leggibile in console
      format.simple() // Formatta i log in modo semplice
    )
  }));
}

export default logger;
