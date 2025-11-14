import React from "react";
import { Container, Typography, Paper, Box, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cartItems, getCartTotal } = useCart();

  return (
    // --- FIX: Changed sx prop to add correct top padding ---
    <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
      {/* --- END FIX --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
            Checkout
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box
                key={item.cartId || item.id} // Use cartId
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>
                  {item.name} × {item.quantity}
                </Typography>
                <Typography>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              ₹{getCartTotal().toFixed(2)}
            </Typography>
          </Box>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{
              borderRadius: 50,
              py: 2,
              background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
            }}
          >
            Place Order
          </Button>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Checkout;
