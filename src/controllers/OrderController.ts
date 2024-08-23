import { OrderModel } from "../models/OrderModel";
import { ProductModel } from "../models/ProductModel";

export class OrderController {
    orders: Array<OrderModel> = [];
    constructor()
    {

    }
    placeOrder(referenceKeyUser:string, products: Array<ProductModel>)
    {
        this.orders = [...this.orders, new OrderModel(referenceKeyUser, products)];
    }
}