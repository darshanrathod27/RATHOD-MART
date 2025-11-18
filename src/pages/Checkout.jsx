// src/pages/Checkout.jsx
import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { LocalOffer, Cancel } from "@mui/icons-material";

const Checkout = () => {
  const {
    cartItems,
    getCartTotal,
    appliedPromo,
    applyPromocode,
    removePromocode,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const { subtotal, total, discountAmount } = getCartTotal();

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    setPromoLoading(true);
    try {
      await applyPromocode(promoInput);
      setPromoInput("");
    } catch (err) {
      // Error is already toasted by context
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 12, minHeight: "80vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 4, color: "primary.dark" }}
          >
            Checkout
          </Typography>

          <Grid container spacing={4}>
            {/* Left Side: Order Summary */}
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                Order Summary
              </Typography>
              {cartItems.map((item) => (
                <Box
                  key={item.cartId || item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {item.name}{" "}
                      <span style={{ color: "#555" }}>× {item.quantity}</span>
                    </Typography>
                    {item.selectedVariant && (
                      <Typography variant="caption" color="text.secondary">
                        {item.selectedVariant.color || ""}{" "}
                        {item.selectedVariant.size
                          ? ` / ${item.selectedVariant.size}`
                          : ""}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 3 }} />

              {/* --- PROMOCODE SECTION --- */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                  Discount Code
                </Typography>
                {appliedPromo ? (
                  <Chip
                    icon={<LocalOffer />}
                    label={`Code "${appliedPromo.code}" applied!`}
                    color="success"
                    onDelete={removePromocode}
                    deleteIcon={<Cancel />}
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      label="Promocode"
                      size="small"
                      variant="outlined"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      disabled={promoLoading}
                      sx={{ flex: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOffer />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyPromo}
                      disabled={promoLoading}
                      sx={{ px: 4 }}
                    >
                      {promoLoading ? "..." : "Apply"}
                    </Button>
                  </Box>
                )}
              </Box>
              {/* --- END PROMOCODE --- */}

              <Divider sx={{ my: 3 }} />

              {/* --- TOTALS SECTION --- */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{subtotal.toFixed(2)}
                  </Typography>
                </Box>

                {discountAmount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1" color="success.main">
                      Discount:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      - ₹{discountAmount.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    ₹{total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Side: Payment/Address (Placeholder) */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
                Shipping Address
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "background.default" }}
              >
                <Typography>Darshan Rathod</Typography>
                <Typography>123, Devchhaya, Katargam</Typography>
                <Typography>Surat, Gujarat - 395004</Typography>
                <Button size="small" sx={{ mt: 1, p: 0 }}>
                  Change Address
                </Button>
              </Paper>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 4,
                  borderRadius: 50,
                  py: 1.8,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  boxShadow: "0 6px 20px rgba(46,125,50,0.35)",
                }}
              >
                Place Order
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Checkout;
