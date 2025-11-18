import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Paper,
  Chip,
  Rating,
} from "@mui/material";
import {
  Close,
  Favorite,
  Delete,
  AddShoppingCart,
  ArrowForward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const WishlistDrawer = () => {
  const { isWishlistOpen, closeWishlist, wishlistItems, removeFromWishlist } =
    useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`, {
      style: { background: "#2E7D32", color: "#fff" },
    });
  };

  return (
    <Drawer
      anchor="right"
      open={isWishlistOpen}
      onClose={closeWishlist}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 440 },
          maxWidth: 500,
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
          background:
            "linear-gradient(165deg, #e8f5e9 0%, #f1f8e9 50%, #e8f5e9 100%)",
          boxShadow: "0 -20px 60px rgba(46, 125, 50, 0.25)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          color: "#fff",
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Favorite sx={{ fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
            >
              My Wishlist
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={closeWishlist} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Wishlist Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#2E7D32",
            borderRadius: "10px",
          },
        }}
      >
        {wishlistItems.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
            }}
          >
            <Favorite sx={{ fontSize: 120, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Your wishlist is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add some favourite products!
            </Typography>
            <Button
              variant="contained"
              onClick={closeWishlist}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1.5,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                fontWeight: 700,
                boxShadow: "0 4px 15px rgba(46,125,50,0.3)",
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <AnimatePresence>
            {wishlistItems.map((item) => (
              // --- FIX: Using item.id || item._id as the key ---
              <motion.div
                key={item.id || item._id}
                // --- END FIX ---
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 4,
                    border: "2px solid #e8f5e9",
                    background: "#fff",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(46,125,50,0.15)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{
                        width: 100,
                        height: 100,
                        border: "3px solid #E8F5E9",
                        borderRadius: 3,
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.name}
                      </Typography>
                      {item.rating && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Rating
                            value={item.rating}
                            size="small"
                            readOnly
                            precision={0.5}
                          />
                          <Typography variant="caption" color="text.secondary">
                            ({item.reviews})
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          mb: 1.5,
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "#2E7D32", fontWeight: 800 }}
                        >
                          ₹{item.price?.toFixed(2)}
                        </Typography>
                        {item.originalPrice && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: "line-through",
                              color: "text.disabled",
                            }}
                          >
                            ₹{item.originalPrice}
                          </Typography>
                        )}
                        {item.discount > 0 && (
                          <Chip
                            label={`${item.discount}% OFF`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 700, height: 22 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAddToCart(item)}
                          startIcon={<AddShoppingCart />}
                          sx={{
                            borderRadius: 50,
                            px: 2,
                            py: 0.8,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            background:
                              "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                            boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
                            "&:hover": {
                              background:
                                "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                            },
                          }}
                        >
                          Add to Cart
                        </Button>
                        <IconButton
                          size="small"
                          // --- FIX: Passing item.id || item._id ---
                          onClick={() =>
                            removeFromWishlist(item.id || item._id)
                          }
                          // --- END FIX ---
                          sx={{
                            color: "error.main",
                            border: "2px solid",
                            borderColor: "error.main",
                            "&:hover": {
                              bgcolor: "error.lighter",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Box>
    </Drawer>
  );
};

export default WishlistDrawer;
