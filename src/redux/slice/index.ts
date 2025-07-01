import { combineReducers, Action } from "@reduxjs/toolkit";
import productSlice from "./Product.ts"


export interface AppState {
  product: ReturnType<typeof productSlice>;
}

const appReducer = combineReducers({
  product: productSlice,

});

const rootReducer = (state: AppState | undefined, action: Action): AppState => {
  return appReducer(state, action);
};

export default rootReducer;
