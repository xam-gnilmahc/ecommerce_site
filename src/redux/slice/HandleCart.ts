import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state type
interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
}

// Initial state
const initialState: CartState = {
  items: [],
};

const handleCart = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

// Export actions
export const { addItem, removeItem, clearCart } = handleCart.actions;

// Export reducer
export default handleCart.reducer;
