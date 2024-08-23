import { ProductModel } from "../models/ProductModel";
import { UserController } from "./UserController";

export class ProductController{
    private products: Array<ProductModel> = [];
    private userController: UserController;
    constructor(userController: UserController)
    {
        this.userController = userController;
    }
    addProduct(referenceKeyUser:string, product: ProductModel)
    {
        if(!this.userController.getUser(referenceKeyUser)?.admin)
        {
            console.log("Non sei admin per mettere i prodotti");
            return false;
        }
        this.products = [...this.products, product];
    }
}