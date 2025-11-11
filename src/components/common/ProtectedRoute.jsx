import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Protects routes that require authentication.
 * If the user is not authenticated, it redirects them to the /login page,
 * saving the location they were trying to access.
 */
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location
    // they were trying to go to in 'state.from'.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child route (e.g., Checkout)
  return <Outlet />;
};

export default ProtectedRoute;
