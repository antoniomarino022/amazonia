import { v4 as uuidv4 } from 'uuid';

export class UserModel{
    primaryKeyUser:string;
    username:string;
    email:string;
    password:string;
    admin:boolean;

    constructor(
        username:string,
        email:string,
        password:string,
        admin:boolean
    ){
        this.primaryKeyUser = uuidv4();
        this.username = username;
        this.email = email;
        this.password = password;
        this.admin = admin
    }
}