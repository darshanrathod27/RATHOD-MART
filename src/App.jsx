// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Loader from "./components/common/Loader";
import CartDrawer from "./components/cart/CartDrawer";
import WishlistDrawer from "./components/wishlist/WishlistDrawer";
import ScrollRestoration from "./components/common/ScrollRestoration";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
// --- NEW ---
const SearchPage = lazy(() => import("./pages/SearchPage")); // 1. Naya page import karein

function App() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollRestoration />
      <Navbar />
      <Box sx={{ flexGrow: 1 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* --- NEW --- */}
            <Route path="/search" element={<SearchPage />} />{" "}
            {/* 2. Naya route add karein */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </Box>
  );
}

export default App;
