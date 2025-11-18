// src/context/WishlistContext.jsx
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
import { openLoginDrawer } from "../store/authSlice"; // adjust path if needed

const WishlistContext = createContext();
export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};

// Helper: normalize various wishlist item shapes to a simple UI shape
const normalizeWishlist = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    // item could be a product object or a wrapper with product inside
    const raw = item.product || item;
    let imgUrl = "/placeholder.png";
    try {
      if (Array.isArray(raw.images) && raw.images.length > 0) {
        const primary = raw.images.find((i) => i.isPrimary) || raw.images[0];
        imgUrl = primary?.fullUrl || primary?.url || imgUrl;
      } else if (raw.image) {
        imgUrl = raw.image;
      }
    } catch (e) {
      // fallback to placeholder
    }

    return {
      ...raw,
      id: raw._id || raw.id,
      image: imgUrl,
      price: Number(raw.discountPrice ?? raw.basePrice ?? raw.price ?? 0),
      raw,
    };
  });
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const STORAGE_KEY = "guestWishlistItems";

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/wishlist");
      setWishlistItems(normalizeWishlist(data?.data || []));
    } catch (err) {
      console.error("fetchWishlist:", err);
      setWishlistItems([]);
    }
  }, [isAuthenticated]);

  // Sync on auth change / mount
  useEffect(() => {
    const sync = async () => {
      if (isAuthenticated) {
        try {
          const guestItems = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            // Merge guest wishlist server-side (API expected to return merged wishlist)
            const ids = guestItems.map((i) => i.id || i._id).filter(Boolean);
            const { data } = await api.post("/wishlist/merge", { items: ids });
            setWishlistItems(normalizeWishlist(data?.data || []));
            localStorage.removeItem(STORAGE_KEY);
            toast.success("Wishlist merged");
          } else {
            await fetchWishlist();
          }
        } catch (err) {
          console.error("wishlist sync error:", err);
          await fetchWishlist();
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        setWishlistItems(normalizeWishlist(saved ? JSON.parse(saved) : []));
      }
    };
    sync();
  }, [isAuthenticated, fetchWishlist]);

  // Persist guest wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        // Save raw objects so shape can be reused later
        const toSave = wishlistItems.map((i) => i.raw ?? i);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        console.error("persist wishlist error", e);
      }
    }
  }, [wishlistItems, isAuthenticated]);

  const isItemInWishlist = (pid) =>
    wishlistItems.some((i) => (i.id || i._id) === pid || i.id === pid);

  /**
   * toggleWishlist(product)
   * - If guest -> open login drawer
   * - Optimistic update locally, attempt API call, rollback by refetching on failure
   */
  const toggleWishlist = async (product) => {
    const pid = product?.id || product?._id;
    if (!pid) {
      console.warn("toggleWishlist: invalid product", product);
      return;
    }

    if (!isAuthenticated) {
      dispatch(openLoginDrawer());
      toast("Please login to save items!");
      return;
    }

    const exists = isItemInWishlist(pid);
    const previous = [...wishlistItems];

    // Optimistic UI update
    setWishlistItems((prev) => {
      if (exists) {
        toast.success("Removed from wishlist", { icon: "💔" });
        return prev.filter((i) => (i.id || i._id) !== pid);
      }
      toast.success("Added to wishlist", { icon: "❤️" });
      return [...prev, normalizeWishlist([product])[0]];
    });

    try {
      const endpoint = exists ? "/wishlist/remove" : "/wishlist/add";
      await api.post(endpoint, { productId: pid });
    } catch (err) {
      console.error("toggleWishlist API error:", err);
      toast.error("Failed to sync wishlist");
      // revert to server state to be safe
      try {
        await fetchWishlist();
      } catch (e) {
        setWishlistItems(previous);
      }
    }
  };

  const removeFromWishlist = async (pid) => {
    if (!isAuthenticated) {
      // Remove locally for guest users
      setWishlistItems((prev) => prev.filter((i) => (i.id || i._id) !== pid));
      return;
    }

    const exists = wishlistItems.find((i) => (i.id || i._id) === pid);
    if (!exists) return;

    const prev = [...wishlistItems];
    setWishlistItems((prevItems) =>
      prevItems.filter((i) => (i.id || i._id) !== pid)
    );
    toast.success("Removed from wishlist", { icon: "💔" });

    try {
      await api.post("/wishlist/remove", { productId: pid });
    } catch (err) {
      console.error("removeFromWishlist error:", err);
      toast.error("Failed to remove from wishlist");
      setWishlistItems(prev); // rollback
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        toggleWishlist,
        removeFromWishlist,
        isItemInWishlist,
        getWishlistItemsCount: () => wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
