import UserModel from "./UserModel.ts";
import ProductModel from "./ProductModel.ts";
import { v4 as uuidv4 } from 'uuid';

export class OrderModel {
  primaryKey: string;
  referenceKeyUser: UserModel["primaryKey"];
  products: Array<ProductModel>;
  status: string;
  date: Date;
  constructor(referenceKeyUser: UserModel["primaryKey"], products: Array<ProductModel>)
  {
    this.primaryKey = uuidv4();
    this.referenceKeyUser = referenceKeyUser;
    this.products = products;
    status = "ordered";
    date = new Date();
}
