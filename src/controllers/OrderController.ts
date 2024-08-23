import { OrderModel } from "../models/OrderModel";
import { ProductModel } from "../models/ProductModel";

export class OrderController {
    private orders: Array<OrderModel> = [];
    constructor()
    {

    }
    placeOrder(referenceKeyUser:string, products: Array<ProductModel>)
    {
        this.orders = [...this.orders, new OrderModel(referenceKeyUser, products)];
    }
    markAsCancelled(primaryKeyOrder: string)
    {
        this.orders = this.orders.map(function(order)
        {
            if(order.primaryKeyOrder==primaryKeyOrder)
            {
                return {...order, status: "cancelled"};
            }
            return order;
        }); 
    }
    changeOrderStatus(primaryKeyOrder: string, newStatus: string)
    {
        this.orders = this.orders.map(function(order)
        {
            if(order.primaryKeyOrder==primaryKeyOrder)
            {
                return {...order, status: newStatus};
            }
            return order;
        }); 
    }
}