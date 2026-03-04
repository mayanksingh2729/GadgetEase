import React, { useState } from "react";
import ProductList from "../components/ProductList";

const ProductPage = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      const updatedCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      setCart(newCart);
    }
  };

  return (
    <div>
      <h1>Product Page</h1>
      <ProductList addToCart={addToCart} />
      <div>
        <h2>Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item, index) => (
            <div key={index}>
              {item.name} - Quantity: {item.quantity}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductPage;
