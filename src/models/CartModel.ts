import { UserModel } from "./UserModel";

export class CartModel{
    referenceKeyUser:UserModel["primaryKeyUser"];
    
    constructor(
        referenceKeyUser:UserModel["primaryKeyUser"]
    ){
        this.referenceKeyUser = referenceKeyUser;
    }
}