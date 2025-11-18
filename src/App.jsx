// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Loader from "./components/common/Loader";

// Import Layouts and Route Guards
import MainLayout from "./components/common/MainLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import GuestRoute from "./components/common/GuestRoute";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile")); // 1. Import new Profile page

function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* 1. Routes for Guests (Login, Register) */}
        {/* These routes use GuestRoute, which redirects if you are already logged in */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* 2. Main App Routes (with Navbar and Footer) */}
        {/* These routes are wrapped in MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/category" element={<CategoryProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<SearchPage />} />

          {/* 3. Protected Routes (e.g., Checkout) */}
          {/* These routes require the user to be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} /> {/* 2. Add route */}
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
