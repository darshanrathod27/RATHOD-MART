import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Paper,
  Chip,
  TextField,
  Divider,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  ArrowForward,
  LocalOffer,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import api from "../../data/api"; // <--- FIXED IMPORT PATH (was ../../utils/api)

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemsCount,
    appliedPromo,
    applyPromocode,
    removePromocode,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [coupons, setCoupons] = useState([]); // For recommendations

  // Fetch available coupons when drawer opens
  useEffect(() => {
    if (isCartOpen) {
      api
        .fetchAvailableCoupons()
        .then((data) => setCoupons(data))
        .catch(() => setCoupons([]));
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  const handleApplyPromo = async (codeToApply) => {
    const code = codeToApply || promoInput;
    if (!code) return;

    setPromoLoading(true);
    try {
      await applyPromocode(code);
      setPromoInput("");
    } catch (err) {
      // Handled in context
    } finally {
      setPromoLoading(false);
    }
  };

  const { subtotal, total, discountAmount } = getCartTotal();
  const totalCount = getCartItemsCount();

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 440 },
          maxWidth: 500,
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingCartOutlined />
          <Box>
            <Typography variant="h6" fontWeight="800">
              Shopping Cart
            </Typography>
            <Typography variant="caption">{totalCount} items</Typography>
          </Box>
        </Box>
        <IconButton onClick={closeCart} sx={{ color: "#fff" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Cart Items List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
        {cartItems.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 10,
            }}
          >
            <ShoppingCartOutlined
              sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              Cart is empty
            </Typography>
            <Button
              variant="contained"
              onClick={closeCart}
              sx={{
                mt: 2,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
              }}
            >
              Start Shopping
            </Button>
          </Box>
        ) : (
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #eee",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="700" noWrap>
                        {item.name}
                      </Typography>
                      {item.selectedVariant && (
                        <Typography variant="caption" color="text.secondary">
                          {item.selectedVariant.size || ""}
                          {item.selectedVariant.size &&
                          item.selectedVariant.color
                            ? " / "
                            : ""}
                          {item.selectedVariant.color || ""}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 1,
                        }}
                      >
                        <Typography fontWeight="700" color="primary">
                          ₹{item.price}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#f5f5f5",
                            borderRadius: 5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity - 1)
                            }
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ px: 1, fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              updateQuantity(item.cartId, item.quantity + 1)
                            }
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeFromCart(item.cartId)}
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

      {/* Footer Section with Promocodes */}
      {cartItems.length > 0 && (
        <Box sx={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.1)" }}>
          {/* Promocode Recommendations */}
          {coupons.length > 0 && !appliedPromo && (
            <Box sx={{ px: 3, py: 1, bgcolor: "#f9f9f9" }}>
              <Typography
                variant="caption"
                sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
              >
                Available Coupons:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
                {coupons.map((c) => (
                  <Chip
                    key={c.code}
                    label={`${c.code} (${
                      c.discountType === "Percentage"
                        ? c.discountValue + "%"
                        : "₹" + c.discountValue
                    } OFF)`}
                    onClick={() => handleApplyPromo(c.code)}
                    clickable
                    color="primary"
                    variant="outlined"
                    size="small"
                    icon={<LocalOffer fontSize="small" />}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            {/* Promocode Input */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              {appliedPromo ? (
                <Chip
                  icon={<LocalOffer />}
                  label={`Code: ${appliedPromo.code}`}
                  onDelete={removePromocode}
                  color="success"
                  sx={{ width: "100%", justifyContent: "space-between" }}
                />
              ) : (
                <>
                  <TextField
                    size="small"
                    placeholder="Enter Promocode"
                    fullWidth
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleApplyPromo()}
                    disabled={promoLoading}
                    sx={{ background: "#2E7D32" }}
                  >
                    Apply
                  </Button>
                </>
              )}
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography fontWeight="600">₹{subtotal.toFixed(2)}</Typography>
            </Box>
            {discountAmount > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                  color: "success.main",
                }}
              >
                <Typography>Discount</Typography>
                <Typography fontWeight="600">
                  - ₹{discountAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6" fontWeight="800">
                Total
              </Typography>
              <Typography variant="h6" fontWeight="800" color="primary">
                ₹{total.toFixed(2)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleCheckout}
              sx={{
                borderRadius: 50,
                py: 1.5,
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
              }}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
