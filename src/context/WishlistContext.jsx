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
import { openLoginDrawer } from "../store/authSlice";

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

const normalize = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    let imgUrl = "/placeholder.png";
    if (item.images?.length > 0) {
      const primary = item.images.find((i) => i.isPrimary);
      imgUrl = primary ? primary.url : item.images[0].url;
    } else if (item.image) {
      imgUrl = item.image;
    }

    return {
      id: item._id || item.id,
      name: item.name,
      image: api.getImageUrl(imgUrl), // Use Helper
      price: item.discountPrice || item.basePrice || 0,
      originalPrice: item.basePrice,
      discount: item.discountPercent,
      rating: item.rating,
      reviews: item.reviewCount,
    };
  });
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get("/wishlist");
      setWishlistItems(normalize(data.data || []));
    } catch (err) {
      console.error(err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const sync = async () => {
      if (isAuthenticated) {
        const guestItems = JSON.parse(
          localStorage.getItem("guestWishlistItems") || "[]"
        );
        if (guestItems.length > 0) {
          const ids = guestItems.map((i) => i.id);
          const { data } = await api.post("/wishlist/merge", { items: ids });
          setWishlistItems(normalize(data.data));
          localStorage.removeItem("guestWishlistItems");
          toast.success("Wishlist merged!");
        } else {
          await fetchWishlist();
        }
      } else {
        const saved = localStorage.getItem("guestWishlistItems");
        setWishlistItems(normalize(saved ? JSON.parse(saved) : []));
      }
    };
    sync();
  }, [isAuthenticated, fetchWishlist]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("guestWishlistItems", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isAuthenticated]);

  const toggleWishlist = async (product) => {
    // Force Login for Wishlist
    if (!isAuthenticated) {
      dispatch(openLoginDrawer());
      return;
    }

    const pid = product.id || product._id;
    const exists = wishlistItems.some((i) => i.id === pid);

    // Optimistic UI
    setWishlistItems((prev) => {
      if (exists) {
        toast.success("Removed from Wishlist", { icon: "💔" });
        return prev.filter((i) => i.id !== pid);
      } else {
        toast.success("Added to Wishlist", { icon: "❤️" });
        return [...prev, normalize([product])[0]];
      }
    });

    try {
      const endpoint = exists ? "/wishlist/remove" : "/wishlist/add";
      await api.post(endpoint, { productId: pid });
    } catch (e) {
      toast.error("Failed to sync");
      fetchWishlist(); // Revert
    }
  };

  const removeFromWishlist = (pid) => toggleWishlist({ id: pid });
  const isItemInWishlist = (pid) => wishlistItems.some((i) => i.id === pid);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlistOpen,
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
