import { CartModel } from "../models/CartModel";

export class CartController {
    private carts: Array<CartModel> = [];
    constructor()
    {

    }
    /*
        Per come l'abbiamo impostato:
        - Ogni riga della tabella rappresenta un prodotto presente in un carrello
        ES:
        | referenceKeyUser | referenceKeyProduct |
        | 1                | 4                   |
        | 1                | 6                   |
        | 2                | 15                  |
        Da qui si deduce che l'utente 1 ha due prodotti nel carrello: il 4 e 6.
        Invece l'utente 2 ha come unico prodotto il 15.
        A livello di codice sarebbe così:
    */
    addProduct(referenceKeyUser: string, referenceKeyProduct: string)
    {
        
        this.carts = [...this.carts, new CartModel(referenceKeyUser, referenceKeyProduct)]
    }
    emptyCart(referenceKeyUser: string)
    {
        this.carts = this.carts.filter(function(cart)
        {
            if(cart.referenceKeyUser==referenceKeyUser)
            {
                return false;
            }
            return true;
        });
    }
    removeProduct(referenceKeyUser: string, referenceKeyProduct:string)
    {
        this.carts = this.carts.filter(function(cart)
        {
            if(cart.referenceKeyUser==referenceKeyUser && cart.referenceKeyProduct == referenceKeyProduct)
            {
                return false;
            }
            return true;
        });
    }
}