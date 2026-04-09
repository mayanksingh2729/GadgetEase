import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/cartContext";
import { UserProvider } from "./context/Usercontext";
import { SearchProvider } from "./context/SearchContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SocketProvider } from "./context/SocketContext";
import { CompareProvider } from "./context/CompareContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <SearchProvider>
            <WishlistProvider>
              <SocketProvider>
                <CompareProvider>
                  <App />
                </CompareProvider>
              </SocketProvider>
            </WishlistProvider>
          </SearchProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
