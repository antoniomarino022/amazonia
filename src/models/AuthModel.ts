import { UserModel } from "./UserModel";
import  jwt  from "jsonwebtoken";

export class AuthModel {
    referenceKeyUser:UserModel["primaryKeyUser"];
    token:string;
    

    constructor( referenceKeyUser:UserModel["primaryKeyUser"]){
        this.referenceKeyUser = referenceKeyUser 
        this.token = jwt.sign({ foo: "bar" }, "privateKey", {
            expiresIn: "1h",
          });
    }
}