import { UserModel } from "../models/UserModel";
import { AuthController } from "./AuthController";
import { CartController } from "./CartController";

export class UserController {
    private users: UserModel[];
    private controllerAuth: AuthController;
    private controllerCart: CartController;
    
    constructor() {
        this.controllerAuth = new AuthController(this);
        this.controllerCart = new CartController();
        this.users = [];
    }

    registerUser(username: string, email: string, password: string) {
        const foundUser = this.users.find((user) => email === user.email && username === user.username);

        if (!!foundUser) {
            console.log('Utente già esistente');
            return false;
        } else {
            const register = new UserModel(username, email, password, false);
            this.users.push(register);
            return true;
        }
    }

    updateUser(username: string, token: string, primaryKeyUser: string) {
        if (this.controllerAuth.isValidToken(token, primaryKeyUser)) {
            this.users = this.users.map((user) => {
                if (primaryKeyUser === user.primaryKeyUser) {
                    return { ...user, username };
                }
                return user;
            });
            console.log("Modifica username avvenuta");
            return true;
        }
        console.log("Token non valido");
        return false;
    }

    getAllUsers() {
        return this.users;
    }

    getUser(primaryKeyUser: string) {
        return this.users.find((user) => primaryKeyUser === user.primaryKeyUser);
    }

    logAllUsers() {
        console.log("Tutti gli utenti:", JSON.stringify(this.getAllUsers(), null, 2));
    }
}