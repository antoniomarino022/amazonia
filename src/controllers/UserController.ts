import { UserModel } from "../models/UserModel";

export class UserController {
    private users: UserModel[];
    
    constructor() {
        this.users = [];
    }

    registerUser(username: string, email: string, password: string) {
        
    }

    updateUser(username: string, token: string, primaryKeyUser: string) {
        
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