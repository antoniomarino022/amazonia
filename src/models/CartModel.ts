import { UserModel } from "./UserModel";
import { ProductModel } from "./ProductModel";

export class CartModel{
    referenceKeyUser:UserModel["primaryKeyUser"];
    referenceKeyProduct:ProductModel["primaryKeyProduct"];

    
    constructor(
        referenceKeyUser:UserModel["primaryKeyUser"],
        referenceKeyProduct:ProductModel["primaryKeyProduct"]

    ){
        this.referenceKeyUser = referenceKeyUser;
        this.referenceKeyProduct = referenceKeyProduct
    }
}