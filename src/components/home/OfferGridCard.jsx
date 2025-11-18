// rathod-mart/src/components/home/OfferGridCard.jsx
import React from "react";
import {
  Card,
  Typography,
  Grid,
  Box,
  Link as MuiLink,
  Button,
  Avatar,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Import useNavigate
import { motion } from "framer-motion";
import { Savings, Loyalty } from "@mui/icons-material"; // Import Loyalty

const OfferGridCard = ({
  title,
  products,
  linkText,
  linkTo,
  isSignIn,
  // --- NEW PROPS ---
  isAuthenticated,
  userInfo,
  // --- END NEW ---
}) => {
  const navigate = useNavigate(); // --- NEW ---

  if (isSignIn) {
    // --- MODIFIED: Show different card if logged in ---
    if (isAuthenticated) {
      return (
        <motion.div whileHover={{ y: -5 }} style={{ height: "100%" }}>
          <Card
            sx={{
              p: 2.5,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              background: "linear-gradient(145deg, #e8f5e9, #c8e6c9)",
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "primary.main",
                mb: 1.5,
              }}
            >
              {/* Show user initials */}
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome, {userInfo?.name || "User"}!
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
              Refer a friend & earn ₹100
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Loyalty />}
              sx={{
                background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
              }}
              onClick={() => navigate("/profile")} // Or your referral page
            >
              Refer & Earn
            </Button>
          </Card>
        </motion.div>
      );
    }

    // Default Sign In card (if not authenticated)
    return (
      <motion.div whileHover={{ y: -5 }} style={{ height: "100%" }}>
        <Card
          sx={{
            p: 2.5,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            background: "linear-gradient(145deg, #e8f5e9, #c8e6c9)",
          }}
        >
          <Savings sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Get ₹50 Cashback!
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            On your first order after login
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
            }}
            onClick={() => navigate("/login")} // --- NEW: Navigate to login ---
          >
            Sign in Securely
          </Button>
        </Card>
      </motion.div>
    );
    // --- END MODIFICATION ---
  }

  return (
    <motion.div whileHover={{ y: -5 }} style={{ height: "100%" }}>
      <Card
        sx={{
          p: 2.5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          {title}
        </Typography>
        <Grid container spacing={1.5} sx={{ flexGrow: 1 }}>
          {products.slice(0, 4).map((product, index) => (
            <Grid item xs={6} key={product ? product.id : index}>
              <RouterLink
                to={product ? `/product/${product.id}` : "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Box sx={{ "&:hover": { opacity: 0.8 }, cursor: "pointer" }}>
                  <Box
                    component="img"
                    src={
                      product
                        ? product.image
                        : "https://via.placeholder.com/150"
                    }
                    alt={product ? product.name : "placeholder"}
                    sx={{
                      width: "100%",
                      height: { xs: 80, md: 90 }, // Reduced height
                      objectFit: "cover",
                      borderRadius: 1.5,
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      lineHeight: 1.2,
                      height: "2.4em",
                      overflow: "hidden",
                    }}
                  >
                    {product ? product.name : ""}
                  </Typography>
                </Box>
              </RouterLink>
            </Grid>
          ))}
        </Grid>
        <MuiLink
          component={RouterLink}
          to={linkTo || "/products"}
          sx={{ mt: 2, fontWeight: 500, fontSize: "0.875rem" }}
        >
          {linkText}
        </MuiLink>
      </Card>
    </motion.div>
  );
};

export default OfferGridCard;
