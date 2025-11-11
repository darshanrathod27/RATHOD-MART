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
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Login = lazy(() => import("./pages/Login")); // 1. Add Login
const Register = lazy(() => import("./pages/Register")); // 2. Add Register

function App() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <ScrollRestoration />
      <Navbar />
      <Box sx={{ flexGrow: 1 }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} /> {/* 3. Add Route */}
            <Route path="/register" element={<Register />} />{" "}
            {/* 4. Add Route */}
            <Route path="/category" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/search" element={<SearchPage />} />
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
