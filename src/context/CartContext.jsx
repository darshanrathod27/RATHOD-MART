// rathod-mart/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../data/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. Get auth state
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState(() => {
    // 2. Load from guest cart if not logged in
    if (!isAuthenticated) {
      const saved = localStorage.getItem("guestCartItems");
      return saved ? JSON.parse(saved) : [];
    }
    return []; // Logged-in users fetch from API
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- 1. ADD PROMOCODE STATE ---
  const [appliedPromo, setAppliedPromo] = useState(null);

  // 3. Sync cart on login/logout
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          // 1. Fetch user's cart from DB
          const { data: dbCart } = await api.get("/cart");

          // 2. Get guest cart from localStorage
          const guestItems = JSON.parse(
            localStorage.getItem("guestCartItems") || "[]"
          );

          if (guestItems.length > 0) {
            // 3. Merge guest items with DB
            const { data: mergedCart } = await api.post("/cart/merge", {
              items: guestItems, // Send full cart items
            });
            setCartItems(mergedCart.data || []);
            localStorage.removeItem("guestCartItems"); // 4. Clear guest cart
          } else {
            // No merge needed, just load DB cart
            setCartItems(dbCart.data || []);
          }
        } catch (err) {
          console.error("Failed to sync cart", err);
          toast.error("Could not load cart");
        } finally {
          setLoading(false);
        }
      } else {
        // --- USER IS A GUEST ---
        const saved = localStorage.getItem("guestCartItems");
        setCartItems(saved ? JSON.parse(saved) : []);
        setAppliedPromo(null); // Clear promo on logout
      }
    };
    syncCart();
  }, [isAuthenticated]);

  // 4. Save to localStorage ONLY if guest
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guestCartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // 5. Update Cart Functions to call API
  const addToCart = (product, variant = null) => {
    const cartId = variant
      ? `${product.id || product._id}_${variant.id || variant._id}`
      : `${product.id || product._id}`;

    setCartItems((prev) => {
      const exists = prev.find((item) => item.cartId === cartId);
      if (exists) {
        return prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // create new cart item
      const newItem = {
        id: product.id || product._id,
        cartId,
        name: product.name,
        image: product.image,
        price: variant ? variant.price : product.price ?? 0,
        originalPrice: product.originalPrice ?? null,
        discount: product.discountPercent ?? 0,
        quantity: 1,
        selectedVariant: variant
          ? {
              id: variant.id || variant._id,
              sku: variant.sku || null,
              color: variant.color?.name || variant.color?.value || null,
              size: variant.size?.name || variant.size?.value || null,
            }
          : null,
        productRef: product,
      };
      return [...prev, newItem];
    });

    if (isAuthenticated) {
      api
        .post("/cart/add", {
          productId: product.id || product._id,
          variantId: variant ? variant.id || variant._id : null,
          quantity: 1,
        })
        .catch((err) => toast.error("Failed to update cart"));
    }
  };

  const removeFromCart = (cartId) => {
    const itemToRemove = cartItems.find((item) => item.cartId === cartId);
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));

    if (isAuthenticated && itemToRemove) {
      api
        .post("/cart/remove", {
          productId: itemToRemove.id,
          variantId: itemToRemove.selectedVariant
            ? itemToRemove.selectedVariant.id
            : null,
        })
        .catch((err) => toast.error("Failed to update cart"));
    }
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    let itemToUpdate = null;
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          itemToUpdate = { ...item, quantity };
          return itemToUpdate;
        }
        return item;
      })
    );

    if (isAuthenticated && itemToUpdate) {
      api
        .post("/cart/update", {
          productId: itemToUpdate.id,
          variantId: itemToUpdate.selectedVariant
            ? itemToUpdate.selectedVariant.id
            : null,
          quantity: quantity,
        })
        .catch((err) => toast.error("Failed to update cart"));
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null); // Clear promo
    if (isAuthenticated) {
      api
        .post("/cart/clear")
        .catch((err) => toast.error("Failed to clear cart"));
    }
  };

  // --- 2. ADD PROMOCODE FUNCTIONS ---
  const applyPromocode = async (code) => {
    if (!isAuthenticated) {
      toast.error("Please login to apply promocodes");
      return;
    }
    try {
      const res = await api.post("/cart/validate-promo", { code });
      setAppliedPromo(res.data.data);
      toast.success(`Promocode "${res.data.data.code}" applied!`);
    } catch (err) {
      setAppliedPromo(null);
      toast.error(err.response?.data?.message || err.message || "Invalid code");
      throw err; // Re-throw for form to handle loading state
    }
  };

  const removePromocode = () => {
    setAppliedPromo(null);
    toast.success("Promocode removed");
  };

  // --- 3. MODIFY getCartTotal TO APPLY DISCOUNT ---
  const getCartSubtotal = () =>
    cartItems.reduce(
      (total, item) => total + Number(item.price || 0) * item.quantity,
      0
    );

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    let total = subtotal;
    let discountAmount = 0;

    if (appliedPromo) {
      if (subtotal < appliedPromo.minPurchase) {
        // Auto-remove promo if cart total falls below minimum
        removePromocode();
        toast.error(
          `Cart total is below minimum of ₹${appliedPromo.minPurchase}`
        );
        return subtotal;
      }

      if (appliedPromo.discountType === "Fixed") {
        discountAmount = appliedPromo.discountValue;
        total = subtotal - discountAmount;
      } else if (appliedPromo.discountType === "Percentage") {
        discountAmount = subtotal * (appliedPromo.discountValue / 100);
        if (
          appliedPromo.maxDiscount &&
          discountAmount > appliedPromo.maxDiscount
        ) {
          discountAmount = appliedPromo.maxDiscount;
        }
        total = subtotal - discountAmount;
      }
    }

    return {
      subtotal: subtotal,
      total: Math.max(total, 0), // Ensure total doesn't go below 0
      discountAmount: discountAmount,
    };
  };
  // --- END MODIFICATION ---

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
        getCartSubtotal, // 4. Expose Subtotal
        getCartTotal, // This is now an object
        getCartItemsCount,
        isCartOpen,
        openCart,
        closeCart,
        loading,
        // --- 5. EXPOSE PROMO FUNCTIONS ---
        appliedPromo,
        applyPromocode,
        removePromocode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
