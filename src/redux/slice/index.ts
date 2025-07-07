import { combineReducers, Action } from "@reduxjs/toolkit";
import productSlice from "./Product.ts";
import searchSlice from "./searchProduct.ts";
import filterSlice from "./filterProduct.ts";
import cartSlice, { addToCart } from "./userCart.ts";

export interface AppState {
  product: ReturnType<typeof productSlice>;
  search: ReturnType<typeof searchSlice>;
  filterProduct: ReturnType<typeof filterSlice>;
  addToCart: ReturnType<typeof cartSlice>;
}

const appReducer = combineReducers({
  product: productSlice,
  search:searchSlice,
  filterProduct:filterSlice,
  addToCart:cartSlice,
});

const rootReducer = (state: AppState | undefined, action: Action): AppState => {
  return appReducer(state, action);
};

export default rootReducer;
