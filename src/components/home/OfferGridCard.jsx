import React from "react";
import {
  Card,
  Typography,
  Grid,
  Box,
  Link as MuiLink,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Savings } from "@mui/icons-material";

const OfferGridCard = ({ title, products, linkText, linkTo, isSignIn }) => {
  if (isSignIn) {
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
            On your first login
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
            }}
          >
            Sign in Securely
          </Button>
        </Card>
      </motion.div>
    );
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
