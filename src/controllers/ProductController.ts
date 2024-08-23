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
    removeProduct(referenceKeyUser:string, primaryKeyProduct: string)
    {
        if(!this.userController.getUser(referenceKeyUser)?.admin)
        {
            console.log("Non sei admin per mettere i prodotti");
            return false;
        }
        this.products = this.products.filter(function(product){
                if(product.primaryKeyProduct==primaryKeyProduct)
                {
                    return false;
                }
                return true;
        });
    }
    updateProduct(
        primaryKeyProduct: string,
        name: string,
        description: string,
        price: Number,
        img: string,
        category: string)
    {

        this.products = this.products.map(function(product)
        {
            if(product.primaryKeyProduct==primaryKeyProduct)
            {
                return {...product, name, description, price, img, category}
            }
            return product;
        })
    }
    getProductsByCategory(category: string)
    {
        return this.products.filter(function(product){
            if(product.category == category)
            {
                return true;
            }
            return false;
        });
    }
}