import { v4 as uuidv4 } from 'uuid';

export class ProductModel {
  primaryKeyProduct: string;
  name: string;
  description: string;
  price: Number;
  img: string;
  category: string;
  constructor(name: string, description: string, price: Number, img: string, category: string)
  {
    this.primaryKeyProduct = uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.img = img;
    this.category = category;
  }
}