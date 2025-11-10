// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add to cart now supports product + variant
  const addToCart = (product, variant = null) => {
    setCartItems((prev) => {
      const cartId = variant ? `${product.id}_${variant.id}` : `${product.id}`;
      const exists = prev.find((item) => item.cartId === cartId);
      if (exists) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // create new cart item with variant info
      const newItem = {
        // keep original product fields for display
        id: product.id,
        cartId,
        name: product.name,
        image: product.image,
        price: product.price ?? 0,
        originalPrice: product.originalPrice ?? null,
        discount: product.discountPercent ?? 0,
        quantity: 1,
        selectedVariant: variant
          ? {
              id: variant.id,
              sku: variant.sku || null,
              color: variant.color?.name || variant.color?.value || null,
              size: variant.size?.name || variant.size?.value || null,
            }
          : null,
        // keep raw product for later if needed
        productRef: product,
      };
      return [...prev, newItem];
    });
  };

  // remove using cartId
  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // update quantity using cartId
  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () =>
    cartItems.reduce(
      (total, item) => total + Number(item.price || 0) * item.quantity,
      0
    );

  const getCartItemsCount = () =>
    cartItems.reduce((total, item) => total + item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
