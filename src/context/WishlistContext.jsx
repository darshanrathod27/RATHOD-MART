// rathod-mart/src/context/WishlistContext.jsx
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

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- REFACTORED: Function to fetch wishlist from server ---
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get("/wishlist");
      setWishlistItems(data.data || []);
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Effect to fetch/sync wishlist on auth change
  useEffect(() => {
    const syncWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const guestItems = JSON.parse(
            localStorage.getItem("guestWishlistItems") || "[]"
          );

          if (guestItems.length > 0) {
            const guestIds = guestItems.map((item) => item.id || item._id);
            const { data: mergedWishlist } = await api.post("/wishlist/merge", {
              items: guestIds,
            });
            setWishlistItems(mergedWishlist.data || []);
            localStorage.removeItem("guestWishlistItems");
          } else {
            await fetchWishlist();
          }
        } catch (err) {
          console.error("Failed to sync wishlist", err);
        } finally {
          setLoading(false);
        }
      } else {
        const saved = localStorage.getItem("guestWishlistItems");
        setWishlistItems(saved ? JSON.parse(saved) : []);
        setLoading(false);
      }
    };

    syncWishlist();
  }, [isAuthenticated, fetchWishlist]);

  // Update localStorage saving to be GUEST-ONLY
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guestWishlistItems", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  // --- REFACTORED: All wishlist functions now update from server response ---

  const toggleWishlist = async (product) => {
    const productId = product.id || product._id;
    if (!productId) {
      toast.error("Cannot add invalid product to wishlist");
      return;
    }

    const exists = wishlistItems.some(
      (item) => (item.id || item._id) === productId
    );

    if (isAuthenticated) {
      // --- LOGGED IN: Call API and refetch ---
      const endpoint = exists ? "/wishlist/remove" : "/wishlist/add";
      try {
        const { data } = await api.post(endpoint, { productId });
        setWishlistItems(data.data || []); // Set state from server response
        if (!exists) {
          toast.success("Added to wishlist!", { icon: "❤️" });
        }
      } catch (err) {
        toast.error("Failed to update wishlist");
      }
    } else {
      // --- GUEST: Update local state ---
      if (exists) {
        setWishlistItems((prev) =>
          prev.filter((item) => (item.id || item._id) !== productId)
        );
      } else {
        setWishlistItems((prev) => [...prev, product]);
        toast.success("Added to wishlist!", { icon: "❤️" });
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!productId) return;

    // Optimistic update for UI speed
    const oldState = wishlistItems;
    const product = oldState.find((p) => (p.id || p._id) === productId);
    setWishlistItems((prev) =>
      prev.filter((item) => (item.id || item._id) !== productId)
    );

    if (isAuthenticated) {
      try {
        const { data } = await api.post("/wishlist/remove", { productId });
        setWishlistItems(data.data || []); // Re-sync with server
      } catch (err) {
        toast.error("Failed to update wishlist");
        if (product) setWishlistItems(oldState); // Rollback
      }
    }
  };

  const isItemInWishlist = (productId) =>
    wishlistItems.some((item) => (item.id || item._id) === productId);

  const getWishlistItemsCount = () => wishlistItems.length;
  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

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
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
