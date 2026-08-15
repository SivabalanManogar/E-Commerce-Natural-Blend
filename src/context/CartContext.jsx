import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateDeliveryCharge } from '../utils/delivery';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('natural_blend_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('natural_blend_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantityToAdd = 1) => {
    setCartItems(prevItems => {
      const existingIdx = prevItems.findIndex(item => item.id === product.id);
      const stock = product.stockQuantity !== undefined ? product.stockQuantity : 999;
      
      if (existingIdx > -1) {
        const currentQty = prevItems[existingIdx].quantity;
        const newQty = Math.min(stock, currentQty + quantityToAdd);
        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty
        };
        return updated;
      } else {
        const initialQty = Math.min(stock, Math.max(1, quantityToAdd));
        return [...prevItems, {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          displayQuantity: product.displayQuantity,
          displayUnit: product.displayUnit,
          shippingWeightGrams: product.shippingWeightGrams !== null ? Number(product.shippingWeightGrams) : null,
          imageUrl: product.imageUrl,
          stockQuantity: stock,
          quantity: initialQty
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const maxStock = item.stockQuantity !== undefined ? item.stockQuantity : 999;
        return {
          ...item,
          quantity: Math.min(maxStock, newQuantity)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const productTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const totalWeightGrams = cartItems.reduce((acc, item) => {
    const weight = item.shippingWeightGrams ? (item.shippingWeightGrams * item.quantity) : 0;
    return acc + weight;
  }, 0);

  const deliveryCharge = calculateDeliveryCharge(totalWeightGrams);

  const grandTotal = productTotal + deliveryCharge;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      productTotal,
      totalWeightGrams,
      deliveryCharge,
      grandTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
