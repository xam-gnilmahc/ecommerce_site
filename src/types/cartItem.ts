import { Product } from './products';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  amount: number;
  quantity: number;
  products: Product;
}
