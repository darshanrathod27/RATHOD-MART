import React, { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../data/api";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [wishlistItems, setWishlistItems] = useState(() => {
    // Guest wishlist is still loaded from localStorage
    if (!isAuthenticated) {
      const saved = localStorage.getItem("guestWishlistItems");
      return saved ? JSON.parse(saved) : [];
    }
    return []; // Logged-in users will fetch from API
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Effect to fetch/sync wishlist on auth change
  useEffect(() => {
    const syncWishlist = async () => {
      if (isAuthenticated) {
        // --- USER IS LOGGED IN ---
        setLoading(true);
        try {
          // 1. Fetch user's wishlist from DB
          const { data: dbWishlist } = await api.get("/wishlist");

          // 2. Get guest wishlist from localStorage
          const guestItems = JSON.parse(
            localStorage.getItem("guestWishlistItems") || "[]"
          );

          if (guestItems.length > 0) {
            // 3. Merge guest items with DB
            const { data: mergedWishlist } = await api.post("/wishlist/merge", {
              items: guestItems.map((item) => item.id || item._id), // Send array of product IDs
            });
            setWishlistItems(mergedWishlist.data || []);
            localStorage.removeItem("guestWishlistItems"); // 4. Clear guest wishlist
          } else {
            // No merge needed, just load DB wishlist
            setWishlistItems(dbWishlist.data || []);
          }
        } catch (err) {
          console.error("Failed to sync wishlist", err);
          // Don't toast here, it's annoying on login
        } finally {
          setLoading(false);
        }
      } else {
        // --- USER IS A GUEST ---
        // Load from localStorage
        const saved = localStorage.getItem("guestWishlistItems");
        setWishlistItems(saved ? JSON.parse(saved) : []);
      }
    };

    syncWishlist();
  }, [isAuthenticated]);

  // Update localStorage saving to be GUEST-ONLY
  useEffect(() => {
    // Only save to localStorage if user is a guest
    if (!isAuthenticated) {
      localStorage.setItem("guestWishlistItems", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  // Modify toggleWishlist to call API
  const toggleWishlist = async (product) => {
    const productId = product.id || product._id;
    if (!productId) {
      toast.error("Cannot add invalid product to wishlist");
      return;
    }

    const exists = wishlistItems.some(
      (item) => (item.id || item._id) === productId
    );

    if (exists) {
      // --- Remove Item ---
      const optimisticState = wishlistItems.filter(
        (item) => (item.id || item._id) !== productId
      );
      setWishlistItems(optimisticState);

      if (isAuthenticated) {
        try {
          await api.post("/wishlist/remove", { productId });
        } catch (err) {
          toast.error("Failed to update wishlist");
          // Rollback
          setWishlistItems((prev) => [...prev, product]);
        }
      }
    } else {
      // --- Add Item ---
      const optimisticState = [...wishlistItems, product];
      setWishlistItems(optimisticState);
      toast.success("Added to wishlist!", { icon: "❤️" });

      if (isAuthenticated) {
        try {
          await api.post("/wishlist/add", { productId });
        } catch (err) {
          toast.error("Failed to update wishlist");
          // Rollback
          setWishlistItems((prev) =>
            prev.filter((item) => (item.id || item._id) !== productId)
          );
        }
      }
    }
  };

  const isItemInWishlist = (productId) =>
    wishlistItems.some((item) => (item.id || item._id) === productId);

  const getWishlistItemsCount = () => wishlistItems.length;
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  // Need to update removeFromWishlist as well
  const removeFromWishlist = (productId) => {
    const product = wishlistItems.find((p) => (p.id || p._id) === productId);
    setWishlistItems((prev) =>
      prev.filter((item) => (item.id || item._id) !== productId)
    );
    if (isAuthenticated) {
      api.post("/wishlist/remove", { productId }).catch((err) => {
        toast.error("Failed to update wishlist");
        // Rollback
        if (product) setWishlistItems((prev) => [...prev, product]);
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        removeFromWishlist,
        toggleWishlist,
        isItemInWishlist,
        getWishlistItemsCount,
        isWishlistOpen,
        setIsWishlistOpen,
        openWishlist,
        closeWishlist,
        loading, // Expose loading state
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
