import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number;
  title: string;
  description: string;
  price_dlr: number;
  price_shl: string;
  quantity: number;
  course_img: string;
}

interface CartState {
  items: CartItem[];
  currency: "USD" | "SLSH";
}

let persistedItems: CartItem[] = [];

try {
  const raw = localStorage.getItem("cartItems");
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      persistedItems = parsed;
    } else {
      localStorage.removeItem("cartItems");
    }
  }
} catch (err) {
  console.error(err);
  localStorage.removeItem("cartItems");
}

const initialState: CartState = {
  items: persistedItems,
  currency: (localStorage.getItem("currency") as "USD" | "SLSH") || "SLSH",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (!item) {
        state.items.push({ ...action.payload, quantity: 1 });
        localStorage.setItem("cartItems", JSON.stringify(state.items));
      }
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },
    setCurrency(state, action: PayloadAction<"USD" | "SLSH">) {
      state.currency = action.payload;
      localStorage.setItem("currency", action.payload);
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setCurrency } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
