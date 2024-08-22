import { v4 as uuidv4 } from 'uuid';

export class OrderProduct {
  primaryKey: string;
  name: string;
  description: string;
  price: Number;
  img: string;
  constructor(name: string, description: string, price: Number, img: string)
  {
    this.primaryKey = uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.img = img;
}
