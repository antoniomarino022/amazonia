import { UserModel } from "./UserModel.js";
import { ProductModel } from "./ProductModel.js";
import { v4 as uuidv4 } from 'uuid';

export class OrderModel {
  primaryKeyOrder: string;
  referenceKeyUser:UserModel["primaryKeyUser"];
  products: Array<ProductModel>;
  status: string;
  date: Date;
  constructor(referenceKeyUser:UserModel["primaryKeyUser"], products: Array<ProductModel>,)
  {
    this.primaryKeyOrder = uuidv4();
    this.referenceKeyUser = referenceKeyUser;
    this.products = products;
    this.status = "ordered";
    this.date = new Date();
  }
}