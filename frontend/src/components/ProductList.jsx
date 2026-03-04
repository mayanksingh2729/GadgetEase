import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const ProductList = ({ searchQuery = "" }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors

  // Fetch data from backend on component mount
  useEffect(() => {
    let isMounted = true; // Flag to track if the component is still mounted
    setLoading(true);

    API.get("/products")
      .then((res) => {
        if (isMounted) {
          setProducts(res.data);
          setFilteredProducts(res.data);
          setLoading(false); // Set loading to false after data is fetched
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError(error.response?.data?.message || error.message); // Set error message if fetch fails
          setLoading(false); // Set loading to false on error
        }
      });

    return () => {
      isMounted = false; // Cleanup flag when component unmounts
    };
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  // Group products by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="text-center text-xl font-semibold">Loading products...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 text-xl font-semibold">
        {`Error fetching products: ${error}`}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow mt-10 px-4">
        {Object.keys(groupedProducts).length === 0 ? (
          <p className="text-center text-gray-600 text-2xl font-bold">
            No matching products found.
          </p>
        ) : (
          Object.keys(groupedProducts).map((category, catIndex) => (
            <div key={catIndex} className="mt-8">
              {/* Category Title */}
              <h2 className="text-2xl font-bold text-gray-800">{category}</h2>

              {/* Horizontal Scrollable Product Section */}
              <div className="overflow-x-auto scrollbar-hide mt-4 p-2">
                <div className="flex space-x-6">
                  {groupedProducts[category].map((product, index) => (
                    <div
                      key={index}
                      className="flex bg-white shadow-md rounded-lg overflow-hidden w-[280px] h-[180px] min-w-[280px] transform transition-transform duration-300 hover:scale-105"
                    >
                      {/* Product Image */}
                      <div className="w-1/2 flex items-center justify-center p-2">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/150"}
                          alt={product.name}
                          className="w-full h-full object-contain rounded-md transition-transform duration-300 hover:scale-110"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="w-2/3 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="text-md font-semibold">{product.name}</h3>
                          <p className="text-gray-500 text-sm">{product.brand}</p>
                          <p className="text-green-600 font-bold">₹{product.price}</p>
                        </div>

                        {/* View Product Button */}
                        <button
                          className="bg-black text-white font-bold px-4 py-2 rounded-lg mt-2 transform transition-all duration-300 hover:scale-105 hover:text-sky-400"
                          onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
