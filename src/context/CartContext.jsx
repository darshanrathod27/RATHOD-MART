// src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../data/api";
import toast from "react-hot-toast";
import { openLoginDrawer } from "../store/authSlice";

const CartContext = createContext();

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

/**
 * Normalize backend or guest cart items into a consistent UI shape.
 * Accepts: backend items (with product, variant objects) or guest items (already shaped).
 */
const normalizeCartItems = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    // If already normalized (guest item), ensure defaults
    if (item.cartId) {
      return {
        cartId: item.cartId,
        id: item.id,
        name: item.name || "Product",
        image: item.image || "/placeholder.png",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        stock: Number(item.stock || 0),
        selectedVariant: item.selectedVariant || null,
        raw: item.raw ?? item,
      };
    }

    // Backend-shaped item
    const product = item.product || {};
    const variant = item.variant || null;
    const pId = product._id || product.id || item.product;
    const vId = variant?._id || variant?.id || null;
    const cartId = vId ? `${pId}_${vId}` : `${pId}`;

    // Image selection: product primary image > first image > product.image > placeholder
    let displayImage = "/placeholder.png";
    try {
      if (Array.isArray(product.images) && product.images.length > 0) {
        const primary =
          product.images.find((img) => img.isPrimary) || product.images[0];
        displayImage = primary?.fullUrl || primary?.url || displayImage;
      } else if (product.image) {
        displayImage = product.image;
      }
    } catch (e) {
      // fallback to placeholder
    }

    return {
      cartId,
      id: pId,
      name: product.name || item.name || "Product",
      image: displayImage,
      price: Number(
        item.price ?? product.discountPrice ?? product.basePrice ?? 0
      ),
      quantity: Number(item.quantity ?? 1),
      stock: Number(product.totalStock ?? product.stock ?? item.stock ?? 0),
      selectedVariant: variant
        ? {
            id: variant._id || variant.id || variant,
            color:
              variant?.color?.colorName ||
              variant?.color?.value ||
              variant?.color,
            size:
              variant?.size?.sizeName || variant?.size?.value || variant?.size,
          }
        : null,
      raw: item,
    };
  });
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const STORAGE_KEY = "guestCartItems";

  // Fetch server cart for authenticated users
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCartItems(normalizeCartItems(data?.data || []));
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync on mount / auth change: merge guest cart into user cart on login or load guest cart
  useEffect(() => {
    const sync = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const guest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
          if (Array.isArray(guest) && guest.length > 0) {
            const items = guest.map((i) => ({
              productId: i.id,
              variantId: i.selectedVariant?.id || null,
              quantity: i.quantity,
            }));
            const { data } = await api.post("/cart/merge", { items });
            setCartItems(normalizeCartItems(data?.data || []));
            localStorage.removeItem(STORAGE_KEY);
            toast.success("Guest cart merged!");
          } else {
            await fetchCart();
          }
        } catch (e) {
          console.error("Cart sync error", e);
          await fetchCart();
        } finally {
          setLoading(false);
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        setCartItems(normalizeCartItems(saved ? JSON.parse(saved) : []));
        setAppliedPromo(null);
      }
    };
    sync();
  }, [isAuthenticated, fetchCart]);

  // Persist guest cart locally
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.error("Failed to persist guest cart", e);
      }
    }
  }, [cartItems, isAuthenticated]);

  /**
   * Add to cart (handles both guest & authenticated)
   * product: product object (from product list/detail)
   * variant: variant object or null
   * qty: number
   */
  const addToCart = async (product, variant = null, qty = 1) => {
    if (!product) return;
    const stock = product.totalStock ?? product.stock ?? 0;
    if (stock < qty) {
      toast.error("Sorry, this product is out of stock!");
      return;
    }

    const pId = product.id || product._id;
    const vId = variant?.id || variant?._id || null;
    const cartId = vId ? `${pId}_${vId}` : `${pId}`;

    if (isAuthenticated) {
      try {
        const { data } = await api.post("/cart/add", {
          productId: pId,
          variantId: vId,
          quantity: qty,
        });
        setCartItems(normalizeCartItems(data?.data || []));
        toast.success("Added to cart!");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to add to cart");
        console.error("addToCart error", err);
      }
    } else {
      // Guest local cart
      setCartItems((prev) => {
        const existing = prev.find((i) => i.cartId === cartId);
        if (existing) {
          if (existing.quantity + qty > stock) {
            toast.error("Cannot add more, stock limit reached.");
            return prev;
          }
          toast.success("Cart updated!");
          return prev.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + qty } : i
          );
        }

        // pick image
        let img = "/placeholder.png";
        if (product.images?.length) {
          const primary =
            product.images.find((im) => im.isPrimary) || product.images[0];
          img = primary?.fullUrl || primary?.url || img;
        } else if (product.image) {
          img = product.image;
        }

        const newItem = {
          cartId,
          id: pId,
          name: product.name || "Product",
          image: img,
          price:
            variant?.price ?? product.discountPrice ?? product.basePrice ?? 0,
          quantity: qty,
          stock,
          selectedVariant: variant
            ? {
                id: vId,
                color:
                  variant.color?.name || variant.color?.value || variant.color,
                size: variant.size?.name || variant.size?.value || variant.size,
              }
            : null,
          raw: { product, variant, quantity: qty },
        };
        toast.success("Added to cart!");
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (cartId) => {
    const item = cartItems.find((i) => i.cartId === cartId);
    if (!item) return;

    // optimistic update
    const previous = [...cartItems];
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
    toast.success("Removed from cart");

    if (isAuthenticated) {
      try {
        await api.post("/cart/remove", {
          productId: item.id,
          variantId: item.selectedVariant?.id || null,
        });
      } catch (err) {
        toast.error("Failed to sync removal");
        setCartItems(previous); // rollback
        console.error("removeFromCart error", err);
      }
    }
  };

  const updateQuantity = async (cartId, newQty) => {
    if (newQty < 1) {
      return removeFromCart(cartId);
    }

    const item = cartItems.find((i) => i.cartId === cartId);
    if (!item) return;

    if (item.stock < newQty) {
      toast.error(`Only ${item.stock} items in stock`);
      return;
    }

    const previous = [...cartItems];
    setCartItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: newQty } : i))
    );

    if (isAuthenticated) {
      try {
        await api.post("/cart/update", {
          productId: item.id,
          variantId: item.selectedVariant?.id || null,
          quantity: newQty,
        });
      } catch (err) {
        toast.error("Failed to update quantity");
        setCartItems(previous);
        console.error("updateQuantity error", err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedPromo(null);
    if (isAuthenticated) {
      try {
        await api.post("/cart/clear");
      } catch (e) {
        console.error("clearCart error", e);
      }
    }
  };

  // Promocode logic (server-validated)
  const applyPromocode = async (code) => {
    if (!code) return;
    if (!isAuthenticated) {
      dispatch(openLoginDrawer());
      return;
    }
    try {
      const { data } = await api.post("/promocodes/validate", { code });
      setAppliedPromo(data?.data || null);
      toast.success("Promocode applied!");
    } catch (err) {
      setAppliedPromo(null);
      toast.error(err?.response?.data?.message || "Invalid coupon");
      console.error("applyPromocode error", err);
    }
  };

  const removePromocode = () => {
    setAppliedPromo(null);
    toast.success("Promocode removed");
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce(
      (acc, i) => acc + Number(i.price || 0) * Number(i.quantity || 0),
      0
    );
    let discountAmount = 0;

    if (appliedPromo) {
      if (subtotal >= (appliedPromo.minPurchase || 0)) {
        if (appliedPromo.discountType === "Fixed") {
          discountAmount = Number(appliedPromo.discountValue || 0);
        } else {
          discountAmount =
            (subtotal * Number(appliedPromo.discountValue || 0)) / 100;
          if (appliedPromo.maxDiscount)
            discountAmount = Math.min(discountAmount, appliedPromo.maxDiscount);
        }
      } else {
        // promo not applicable due to minPurchase — keep discount 0
      }
    }

    return {
      subtotal,
      discountAmount,
      total: Math.max(0, subtotal - discountAmount),
    };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        loading,
        appliedPromo,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromocode,
        removePromocode,
        getCartTotal,
        getCartItemsCount: () =>
          cartItems.reduce((acc, i) => acc + Number(i.quantity || 0), 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
