// src/components/cart/CartDrawer.jsx
import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  LocalShipping,
  ArrowForward,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
  } = useCart();

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      PaperProps={{
        component: motion.div,
        initial: { x: 500 },
        animate: { x: 0 },
        exit: { x: 500 },
        transition: { type: "spring", damping: 25, stiffness: 200 },
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
          <ShoppingCartOutlined sx={{ fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.5 }}
            >
              Shopping Cart
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={closeCart} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Cart Items */}
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
        {cartItems.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
            }}
          >
            <ShoppingCartOutlined
              sx={{ fontSize: 120, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add products to get started!
            </Typography>
            <Button
              variant="contained"
              onClick={closeCart}
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
            {cartItems.map((item) => (
              // --- FIX: Using item.cartId as the key ---
              <motion.div
                key={item.cartId}
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
                        width: 90,
                        height: 90,
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

                      {/* Variant info (color / size) */}
                      {item.selectedVariant && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "block",
                            mb: 1,
                          }}
                        >
                          {item.selectedVariant.color || ""}{" "}
                          {item.selectedVariant.size
                            ? ` / ${item.selectedVariant.size}`
                            : ""}
                        </Typography>
                      )}

                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ color: "#2E7D32", fontWeight: 800 }}
                        >
                          ₹{Number(item.price || 0).toFixed(2)}
                        </Typography>
                        {item.discount > 0 && (
                          <Chip
                            label={`${item.discount}% OFF`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 700, height: 24 }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            bgcolor: "#E8F5E9",
                            borderRadius: 50,
                            p: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                            sx={{
                              color: "#2E7D32",
                              bgcolor: "#fff",
                              "&:hover": { bgcolor: "#f1f8e9" },
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography
                            sx={{
                              px: 2,
                              fontWeight: 700,
                              minWidth: 40,
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                            sx={{
                              color: "#fff",
                              bgcolor: "#2E7D32",
                              "&:hover": { bgcolor: "#1B5E20" },
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.cartId)}
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.lighter",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <Delete />
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

      {/* Footer */}
      {cartItems.length > 0 && (
        <Box
          sx={{
            p: 3,
            background: "#fff",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              p: 2,
              bgcolor: "#E8F5E9",
              borderRadius: 3,
            }}
          >
            <LocalShipping sx={{ color: "#2E7D32", fontSize: 28 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Free delivery on orders above ₹500
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body1" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              ₹{getCartTotal().toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#2E7D32" }}>
              ₹{getCartTotal().toFixed(2)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleCheckout}
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: 50,
              py: 1.8,
              fontSize: "1.1rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
              boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                boxShadow: "0 8px 28px rgba(46,125,50,0.45)",
              },
            }}
          >
            Proceed to Checkout
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
