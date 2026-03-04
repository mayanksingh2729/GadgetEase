  import React from "react";
  import ReactDOM from "react-dom/client";
  import App from "./App";
  import { BrowserRouter } from "react-router-dom";
  import "./index.css"; // Import Tailwind styles
  import { CartProvider } from "./context/cartContext";
  import { UserProvider } from "./context/Usercontext"; 
  // import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider


  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <UserProvider>
        <CartProvider> {/* Wrap App with CartProvider */}
          
            <App />
          
        </CartProvider>
      </UserProvider>
    </React.StrictMode>
  );
