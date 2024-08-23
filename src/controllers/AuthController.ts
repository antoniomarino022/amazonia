import { AuthModel } from "../models/AuthModel";
import { UserController } from "./UserController";

export class AuthController {
    private auths: AuthModel[];
    private userControllers: UserController;
    
    constructor(userController: UserController) {
        this.auths = [];
        this.userControllers = userController;
    }

    loginUser(email: string, password: string) {
        const user = this.userControllers.getAllUsers().find((user) => email === user.email && password === user.password);

        if (!user) {
            console.log('Credenziali errate');
            return false;
        } else {
            console.log('Login effettuato con successo');
            const newAuth = new AuthModel(user.primaryKeyUser);
            this.auths.push(newAuth); 
            return true;
        }
    }

    getALLAuths() {
        return this.auths;
    }

    getAuth(token: string, referenceKeyUser: string) {
        return this.auths.find((auth) => token === auth.token && referenceKeyUser === auth.referenceKeyUser);
    }

    logoutUser(token: string, referenceKeyUser: string) {
        const auth = this.auths.find((auth) => token === auth.token && referenceKeyUser === auth.referenceKeyUser);

        if (!auth) {
            console.log('Token non valido');
            return false;
        } else {
            this.auths = this.auths.filter((auth) => token !== auth.token); 
            console.log('Logout effettuato con successo');
            return true;
        }
    }

    isValidToken(token: string, referenceKeyUser: string) {
        const authFound = this.auths.find((auth) => token === auth.token && referenceKeyUser === auth.referenceKeyUser);  
        return !!authFound;
    }

    logAllUsers() {
        console.log("Tutte le autenticazioni:", JSON.stringify(this.getALLAuths(), null, 2));
    }
}