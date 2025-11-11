// rathod-mart/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { checkAuthStatus } from "./store/authSlice";

import App from "./App";
import theme from "./theme/theme";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";

AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
  mirror: false,
});

const root = ReactDOM.createRoot(document.getElementById("root"));

// 2. Create an async function to run before render
const initializeApp = async () => {
  try {
    // 3. Dispatch the auth check
    await store.dispatch(checkAuthStatus()).unwrap();
  } catch (err) {
    console.log("Not authenticated on load.");
  }

  // 4. Render the app
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <CartProvider>
              <WishlistProvider>
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
      </Provider>
    </React.StrictMode>
  );
};

initializeApp();
