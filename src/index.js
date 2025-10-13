import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import App from "./App";
import theme from "./theme/theme";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; // Import WishlistProvider
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";

// Initialize AOS
AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
  mirror: false,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CartProvider>
          <WishlistProvider>
            {" "}
            {/* Wrap App with WishlistProvider */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background:
                    "linear-gradient(135deg, #2E7D32 0%, #00BFA5 100%)",
                  color: "#fff",
                  borderRadius: "50px",
                  padding: "16px 24px",
                },
              }}
            />
            <App />
          </WishlistProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
