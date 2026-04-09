import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { useWishlistContext } from "../context/WishlistContext";
import { useUserContext } from "../context/Usercontext";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useCompareContext } from "../context/CompareContext";
import { ProductCardSkeletonGroup } from "./skeletons/ProductCardSkeleton";

const ProductList = () => {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useWishlistContext();
  const { user } = useUserContext();
  const { addToCompare, isInCompare, removeFromCompare } = useCompareContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    API.get("/products")
      .then((res) => {
        if (isMounted) {
          setProducts(res.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setError(error.response?.data?.message || error.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  if (loading) {
    return <ProductCardSkeletonGroup />;
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{category}</h2>

              {/* Horizontal Scrollable Product Section */}
              <div className="overflow-x-auto scrollbar-hide mt-4 p-2 scroll-smooth">
                <div className="flex space-x-6">
                  {groupedProducts[category].map((product, index) => (
                    <div
                      key={index}
                      className="flex bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden w-[250px] sm:w-[280px] h-[160px] sm:h-[180px] min-w-[250px] sm:min-w-[280px] transform transition-transform duration-300 hover:scale-105 relative"
                    >
                      {user && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                          className="absolute top-2 right-2 z-10 text-xl hover:scale-110 transition-transform"
                        >
                          {wishlistIds.has(product._id) ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart className="text-gray-400" />}
                        </button>
                      )}
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
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{product.brand}</p>
                          <p className="text-green-600 font-bold">₹{product.price}</p>
                        </div>

                        <div className="flex gap-1 mt-2">
                          <button
                            className="flex-1 bg-black text-white font-bold px-3 py-2 rounded-lg text-sm transform transition-all duration-300 hover:scale-105 hover:text-sky-400"
                            onClick={() => navigate(`/product/${product.id}`, { state: { product } })}
                          >
                            View
                          </button>
                          <button
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${isInCompare(product._id) ? "bg-sky-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              isInCompare(product._id) ? removeFromCompare(product._id) : addToCompare(product);
                            }}
                          >
                            {isInCompare(product._id) ? "✓" : "⇔"}
                          </button>
                        </div>
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
