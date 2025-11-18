import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  TextField,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
} from "@mui/material";
import { MyLocation, ArrowBack } from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../data/api";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Cart Context
  const { cartItems, getCartTotal, clearCart } = useCart();

  // Auth Redux State
  const { userInfo } = useSelector((state) => state.auth);

  // Derived Cart Values
  const { total, subtotal, discountAmount } = getCartTotal();

  // Local State
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [saveAddress, setSaveAddress] = useState(false);

  // Address State (Prefill from user profile if available)
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // Initialize address from Redux state on mount
  useEffect(() => {
    if (userInfo?.address) {
      setAddress({
        street: userInfo.address.street || "",
        city: userInfo.address.city || "",
        state: userInfo.address.state || "",
        zip: userInfo.address.postalCode || "",
        country: userInfo.address.country || "India",
      });
    }
  }, [userInfo]);

  // Handle Input Change
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // "Locate Me" Feature (Free using OpenStreetMap/Nominatim)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            setAddress((prev) => ({
              ...prev,
              street: `${addr.house_number || ""} ${addr.road || ""} ${
                addr.suburb || ""
              }`.trim(),
              city: addr.city || addr.town || addr.village || "",
              state: addr.state || "",
              zip: addr.postcode || "",
              country: addr.country || "India",
            }));
            toast.success("Address detected successfully!");
          } else {
            toast.error("Could not find address details.");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          toast.error("Failed to fetch address location.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve your location.");
        setLocating(false);
      }
    );
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    // 1. Validation
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (!address.street || !address.city || !address.zip || !address.state) {
      toast.error("Please fill in all address fields.");
      return;
    }

    setLoading(true);
    try {
      // 2. Save Address to Profile (if checked)
      if (saveAddress) {
        const fd = new FormData();
        fd.append("address[street]", address.street);
        fd.append("address[city]", address.city);
        fd.append("address[state]", address.state);
        fd.append("address[postalCode]", address.zip);
        fd.append("address[country]", address.country);

        // Note: Assuming your backend supports partial update without re-uploading image
        // If not, you might need a dedicated address update endpoint
        try {
          const userRes = await api.put("/users/profile", fd);
          dispatch(setCredentials(userRes.data)); // Update Redux
        } catch (updateErr) {
          console.warn("Failed to save address to profile:", updateErr);
          // Don't block order placement just because profile save failed
        }
      }

      // 3. Construct Order Data
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.id,
          name: item.name,
          image: item.image, // Ensure this is a valid string path
          price: item.price,
          qty: item.quantity,
          variant: item.selectedVariant ? item.selectedVariant.id : null,
        })),
        shippingAddress: {
          address: address.street,
          city: address.city,
          postalCode: address.zip,
          country: address.country,
        },
        paymentMethod: paymentMethod,
        itemsPrice: subtotal,
        discountPrice: discountAmount,
        totalPrice: total,
        isPaid: paymentMethod === "online" ? true : false, // Logic for online payment would go here
      };

      // 4. Call Backend API
      // Ensure you have created the /api/orders route in your backend
      // If not, this will throw 404, but for now we simulate success if backend isn't ready
      // await api.post("/orders", orderData);

      // Simulate Network Request
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/"); // Or navigate to an Order Success page
    } catch (err) {
      console.error("Order placement failed:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "80vh" }}>
      {/* Header */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Back
      </Button>
      <Typography
        variant="h4"
        fontWeight="800"
        sx={{ mb: 4, color: "#2E7D32" }}
      >
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column: Address & Payment */}
        <Grid item xs={12} md={7}>
          {/* Shipping Address Card */}
          <Paper
            elevation={0}
            sx={{ p: 3, mb: 3, border: "1px solid #e0e0e0", borderRadius: 3 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="700">
                Shipping Address
              </Typography>
              <Button
                variant="outlined"
                startIcon={
                  locating ? <CircularProgress size={20} /> : <MyLocation />
                }
                onClick={handleLocateMe}
                disabled={locating || loading}
                size="small"
                sx={{ borderRadius: 20 }}
              >
                {locating ? "Locating..." : "Locate Me"}
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Street Address / Flat / House No."
                  name="street"
                  fullWidth
                  value={address.street}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="City"
                  name="city"
                  fullWidth
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Pincode"
                  name="zip"
                  fullWidth
                  value={address.zip}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="State"
                  name="state"
                  fullWidth
                  value={address.state}
                  onChange={handleAddressChange}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Country"
                  name="country"
                  fullWidth
                  value={address.country}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Save this address to my profile for future orders"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Payment Method Card */}
          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 3 }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
              Payment Method
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="cod"
                control={<Radio color="primary" />}
                label={
                  <Box>
                    <Typography fontWeight="600">
                      Cash on Delivery (COD)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pay when your order arrives
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                value="online"
                control={<Radio color="primary" />}
                disabled
                label={
                  <Box sx={{ opacity: 0.6 }}>
                    <Typography fontWeight="600">
                      Online Payment (UPI / Cards)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Coming Soon
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Right Column: Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#fafafa",
              borderRadius: 3,
              position: "sticky",
              top: 100,
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ mb: 3 }}>
              Order Summary
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              {cartItems.map((item) => (
                <Box
                  key={item.cartId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        objectFit: "cover",
                        border: "1px solid #eee",
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="600" noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Qty: {item.quantity}{" "}
                        {item.selectedVariant
                          ? `• ${item.selectedVariant.size || ""} ${
                              item.selectedVariant.color || ""
                            }`
                          : ""}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight="600">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight="600">₹{subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Discount</Typography>
                <Typography fontWeight="600" color="success.main">
                  - ₹{discountAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight="600" color="success.main">
                  Free
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
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
              onClick={handlePlaceOrder}
              disabled={loading}
              sx={{
                borderRadius: 50,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                boxShadow: "0 8px 20px rgba(46,125,50,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                },
              }}
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
