import { Product } from "./products.ts";

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  amount: number;
  quantity: number;
  products: Product;
}
