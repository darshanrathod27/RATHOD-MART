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

export const useCart = () => useContext(CartContext);

// Helper: Normalize cart items
const normalizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (item.cartId) return item; // Already normalized

    const product = item.product || {};
    const variant = item.variant || {};

    // IDs
    const pId = product._id || product.id || item.id;
    const vId = variant._id || variant.id;
    const cartId = vId ? `${pId}_${vId}` : `${pId}`;

    // IMAGE FIX: Use api.getImageUrl to handle relative paths
    let displayImage = "/placeholder.png";
    if (product.images?.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      const imgPath = primary ? primary.url : product.images[0].url;
      displayImage = api.getImageUrl(imgPath);
    } else if (product.image) {
      displayImage = api.getImageUrl(product.image);
    } else if (item.image) {
      displayImage = api.getImageUrl(item.image);
    }

    // STOCK FIX: Use totalStock or stock
    const stock = product.totalStock ?? product.stock ?? item.stock ?? 0;

    return {
      cartId,
      id: pId,
      name: product.name || item.name || "Product",
      image: displayImage, // Corrected Image URL
      price: item.price || product.discountPrice || product.basePrice || 0,
      quantity: item.quantity || 1,
      stock: stock, // Corrected Stock
      selectedVariant: vId
        ? {
            id: vId,
            color: variant.color?.colorName || variant.color?.value,
            size: variant.size?.sizeName || variant.size?.value,
          }
        : null,
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

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCartItems(normalizeCartItems(data.data));
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const sync = async () => {
      if (isAuthenticated) {
        const guest = JSON.parse(
          localStorage.getItem("guestCartItems") || "[]"
        );
        if (guest.length > 0) {
          try {
            const items = guest.map((i) => ({
              productId: i.id,
              variantId: i.selectedVariant?.id,
              quantity: i.quantity,
              price: i.price,
            }));
            const { data } = await api.post("/cart/merge", { items });
            setCartItems(normalizeCartItems(data.data));
            localStorage.removeItem("guestCartItems");
            toast.success("Cart merged successfully!");
          } catch (e) {
            console.error(e);
          }
        } else {
          await fetchCart();
        }
      } else {
        const saved = localStorage.getItem("guestCartItems");
        setCartItems(normalizeCartItems(saved ? JSON.parse(saved) : []));
        setAppliedPromo(null);
      }
    };
    sync();
  }, [isAuthenticated, fetchCart]);

  useEffect(() => {
    if (!isAuthenticated)
      localStorage.setItem("guestCartItems", JSON.stringify(cartItems));
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, variant = null, qty = 1) => {
    // 1. Stock Check
    const stock = product.totalStock ?? product.stock ?? 0;
    if (stock < qty) {
      toast.error("Sorry, Product is Out of Stock!");
      return;
    }

    const pId = product.id || product._id;
    const vId = variant?.id || variant?._id;
    const cartId = vId ? `${pId}_${vId}` : `${pId}`;

    // 2. Add to Cart
    if (isAuthenticated) {
      try {
        const { data } = await api.post("/cart/add", {
          productId: pId,
          variantId: vId,
          quantity: qty,
        });
        setCartItems(normalizeCartItems(data.data));
        toast.success("Added to Cart!");
      } catch (e) {
        toast.error("Failed to add item.");
      }
    } else {
      setCartItems((prev) => {
        const exists = prev.find((i) => i.cartId === cartId);
        if (exists) {
          if (exists.quantity + qty > stock) {
            toast.error("Stock limit reached!");
            return prev;
          }
          toast.success("Cart updated!");
          return prev.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + qty } : i
          );
        }

        // New Item (Guest)
        let imgUrl = "/placeholder.png";
        if (product.images?.length > 0) {
          const primary = product.images.find((i) => i.isPrimary);
          imgUrl = primary
            ? primary.fullUrl || api.getImageUrl(primary.url)
            : api.getImageUrl(product.images[0].url);
        } else if (product.image) {
          imgUrl = api.getImageUrl(product.image);
        }

        toast.success("Added to Cart!");
        return [
          ...prev,
          {
            cartId,
            id: pId,
            name: product.name,
            image: imgUrl,
            price: variant
              ? variant.price
              : product.discountPrice || product.basePrice,
            stock,
            quantity: qty,
            selectedVariant: variant ? { id: vId, ...variant } : null,
          },
        ];
      });
    }
  };

  const removeFromCart = async (cartId) => {
    const item = cartItems.find((i) => i.cartId === cartId);
    if (!item) return;

    // Optimistic Update
    const oldCart = [...cartItems];
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
    toast.success("Removed from Cart");

    if (isAuthenticated) {
      try {
        await api.post("/cart/remove", {
          productId: item.id,
          variantId: item.selectedVariant?.id,
        });
      } catch (e) {
        toast.error("Network error, item restored.");
        setCartItems(oldCart);
      }
    }
  };

  const updateQuantity = async (cartId, qty) => {
    if (qty < 1) return removeFromCart(cartId);
    const item = cartItems.find((i) => i.cartId === cartId);
    if (!item) return;

    if (item.stock < qty) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }

    const oldCart = [...cartItems];
    setCartItems((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity: qty } : i))
    );

    if (isAuthenticated) {
      try {
        await api.post("/cart/update", {
          productId: item.id,
          variantId: item.selectedVariant?.id,
          quantity: qty,
        });
      } catch (e) {
        setCartItems(oldCart);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setAppliedPromo(null);
    if (isAuthenticated) {
      try {
        await api.post("/cart/clear");
      } catch {}
    }
  };

  const applyPromocode = async (code) => {
    if (!isAuthenticated) {
      dispatch(openLoginDrawer());
      return;
    }
    try {
      const { data } = await api.post("/promocodes/validate", { code });
      setAppliedPromo(data.data);
      toast.success("Coupon Applied!");
    } catch (e) {
      setAppliedPromo(null);
      toast.error(e.response?.data?.message || "Invalid Coupon");
    }
  };

  const removePromocode = () => {
    setAppliedPromo(null);
    toast.success("Coupon removed");
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );
    let discountAmount = 0;
    if (appliedPromo) {
      if (subtotal >= appliedPromo.minPurchase) {
        discountAmount =
          appliedPromo.discountType === "Fixed"
            ? appliedPromo.discountValue
            : (subtotal * appliedPromo.discountValue) / 100;
        if (appliedPromo.maxDiscount)
          discountAmount = Math.min(discountAmount, appliedPromo.maxDiscount);
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
          cartItems.reduce((acc, i) => acc + i.quantity, 0),
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
