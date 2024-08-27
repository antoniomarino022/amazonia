import validator from 'validator';
import PasswordValidator from 'password-validator';

// Definizione dello schema della password
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)                              // Lunghezza minima di 8 caratteri
  .has().uppercase()                       // Deve contenere almeno una lettera maiuscola
  .has().lowercase()                       // Deve contenere almeno una lettera minuscola
  .has().digits()                          // Deve contenere almeno un numero
  .not().spaces();                         // Non deve contenere spazi

// Funzione per validare lo username
 function validateUsername(username: string){
  return username && validator.isAlphanumeric(username) && username.length >= 3 && username.length <= 20;
}

// Funzione per validare l'email
function validateEmail(email: string) {
  return email && validator.isEmail(email);
}

// Funzione per validare la password
 function validatePassword(password: string){
  // Verifica che schema.validate restituisca un booleano
  return passwordSchema.validate(password);
}

export {
  validateUsername,
  validateEmail,
  validatePassword
}