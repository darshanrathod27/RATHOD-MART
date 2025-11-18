import React from "react";
// --- FIX: Import useLocation ---
import { Outlet, useLocation } from "react-router-dom";
// --- END FIX ---
import { Box } from "@mui/material";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "../cart/CartDrawer";
import WishlistDrawer from "../wishlist/WishlistDrawer";
import ScrollRestoration from "./ScrollRestoration";

/**
 * This component wraps all pages that should share the
 * main navigation bar and footer.
 */
const MainLayout = () => {
  // --- FIX: Get current location ---
  const location = useLocation();
  const { pathname } = location;
  // --- END FIX ---

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollRestoration />
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* This is where the page content will be rendered */}
      </Box>

      {pathname !== "/checkout" && <Footer />}

      <CartDrawer />
      <WishlistDrawer />
    </Box>
  );
};

export default MainLayout;
