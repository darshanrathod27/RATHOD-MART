import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

/**
 * Protects routes that should only be accessible to guests (not-logged-in users),
 * such as the login and register pages.
 * If the user is authenticated, it redirects them to the homepage.
 */
const GuestRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    // If user is already logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the child route (Login/Register)
  return <Outlet />;
};

export default GuestRoute;
