// rathod-mart/src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  // --- REFACTORED: Function to fetch cart from server ---
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return; // Only run if logged in

    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCartItems(data.data || []);
    } catch (err) {
      console.error("Failed to fetch cart", err);
      // Don't toast on silent fetch
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync cart on login/logout
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const guestItems = JSON.parse(
            localStorage.getItem("guestCartItems") || "[]"
          );

          if (guestItems.length > 0) {
            // Merge guest cart, API returns the new synced cart
            const { data: mergedCart } = await api.post("/cart/merge", {
              items: guestItems,
            });
            setCartItems(mergedCart.data || []);
            localStorage.removeItem("guestCartItems");
          } else {
            // No merge, just fetch the user's cart
            await fetchCart();
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
        setAppliedPromo(null);
        setLoading(false);
      }
    };
    syncCart();
  }, [isAuthenticated, fetchCart]);

  // Save to localStorage ONLY if guest
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guestCartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // --- REFACTORED: All cart functions now update from server response ---

  const addToCart = async (product, variant = null) => {
    const cartId = variant
      ? `${product.id || product._id}_${variant.id || variant._id}`
      : `${product.id || product._id}`;

    if (isAuthenticated) {
      // --- LOGGED IN: Call API first ---
      try {
        const { data } = await api.post("/cart/add", {
          productId: product.id || product._id,
          variantId: variant ? variant.id || variant._id : null,
          quantity: 1,
        });
        setCartItems(data.data || []); // Set state from server response
      } catch (err) {
        toast.error("Failed to add item to cart");
      }
    } else {
      // --- GUEST: Update local state ---
      setCartItems((prev) => {
        const exists = prev.find((item) => item.cartId === cartId);
        if (exists) {
          return prev.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
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
    }
  };

  const removeFromCart = async (cartId) => {
    const itemToRemove = cartItems.find((item) => item.cartId === cartId);
    if (!itemToRemove) return;

    // Optimistic update for UI speed
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));

    if (isAuthenticated) {
      try {
        const { data } = await api.post("/cart/remove", {
          productId: itemToRemove.id,
          variantId: itemToRemove.selectedVariant
            ? itemToRemove.selectedVariant.id
            : null,
        });
        setCartItems(data.data || []); // Re-sync with server
      } catch (err) {
        toast.error("Failed to remove item");
        setCartItems((prev) => [...prev, itemToRemove]); // Rollback
      }
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    const itemToUpdate = cartItems.find((item) => item.cartId === cartId);
    if (!itemToUpdate) return;

    // Optimistic update
    const oldCart = cartItems;
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );

    if (isAuthenticated) {
      try {
        const { data } = await api.post("/cart/update", {
          productId: itemToUpdate.id,
          variantId: itemToUpdate.selectedVariant
            ? itemToUpdate.selectedVariant.id
            : null,
          quantity: quantity,
        });
        setCartItems(data.data || []); // Re-sync
      } catch (err) {
        toast.error("Failed to update quantity");
        setCartItems(oldCart); // Rollback
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedPromo(null);
    if (isAuthenticated) {
      try {
        await api.post("/cart/clear");
      } catch (err) {
        toast.error("Failed to clear cart");
        // No rollback needed, just refetch
        fetchCart();
      }
    }
  };

  // --- NEW: applyPromocode calls new backend route ---
  const applyPromocode = async (code) => {
    if (!isAuthenticated) {
      toast.error("Please login to apply promocodes");
      throw new Error("Not logged in");
    }
    try {
      // Call the NEW promocode validation route
      const { data } = await api.post("/promocodes/validate", { code });
      setAppliedPromo(data.data); // data.data contains the promo object
      toast.success(`Promocode "${data.data.code}" applied!`);
    } catch (err) {
      setAppliedPromo(null);
      const errMsg =
        err.response?.data?.message || err.message || "Invalid code";
      toast.error(errMsg);
      throw new Error(errMsg); // Re-throw for form to handle loading state
    }
  };

  const removePromocode = () => {
    setAppliedPromo(null);
    toast.success("Promocode removed");
  };

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
      // Check min purchase again
      if (subtotal < appliedPromo.minPurchase) {
        removePromocode();
        toast.error(
          `Cart total is below minimum of ₹${appliedPromo.minPurchase}`
        );
        return { subtotal, total: subtotal, discountAmount: 0 };
      }

      // Calculate discount
      if (appliedPromo.discountType === "Fixed") {
        discountAmount = appliedPromo.discountValue;
      } else if (appliedPromo.discountType === "Percentage") {
        discountAmount = subtotal * (appliedPromo.discountValue / 100);
        if (
          appliedPromo.maxDiscount &&
          discountAmount > appliedPromo.maxDiscount
        ) {
          discountAmount = appliedPromo.maxDiscount;
        }
      }
      total = subtotal - discountAmount;
    }

    return {
      subtotal: subtotal,
      total: Math.max(total, 0),
      discountAmount: discountAmount,
    };
  };

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
        getCartSubtotal,
        getCartTotal,
        getCartItemsCount,
        isCartOpen,
        openCart,
        closeCart,
        loading,
        appliedPromo,
        applyPromocode,
        removePromocode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
