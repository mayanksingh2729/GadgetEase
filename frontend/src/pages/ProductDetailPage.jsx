import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import API from "../api/axiosInstance";
import { showSuccess, showError, showInfo } from "../components/ToastMessage";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [duration, setDuration] = useState("day");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    setProduct(null);
    setRecommendedProducts([]);
    setTotalAmount(0);
    setQuantity(1);
    setDuration("day");
    setAddedToCart(false);

    API.get(`/products/${id}`)
      .then((res) => {
        const data = res.data;
        if (data && !data.message) {
          setProduct(data);
          setSelectedImage(data.images?.[0] || "https://via.placeholder.com/400");

          if (data.category) {
            API.get(`/products?category=${encodeURIComponent(data.category)}`)
              .then((relRes) => {
                const relatedProducts = relRes.data;
                if (Array.isArray(relatedProducts)) {
                  setRecommendedProducts(relatedProducts.filter((p) => p.id !== data.id));
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => showError("Failed to load product"));
  }, [id]);

  useEffect(() => {
    if (product) {
      const priceMap = { day: product.price, week: product.week, month: product.month };
      const calculatedPrice = (quantity * (priceMap[duration] || 0)).toFixed(2);
      setTotalAmount((parseFloat(calculatedPrice) + (product.security || 0) * quantity).toFixed(2));
    }
  }, [quantity, duration, product]);

  const addToCart = async () => {
    const token = user?.token || localStorage.getItem("token");

    if (!token) {
      showInfo("Please log in to add items to cart.");
      navigate("/login");
      return;
    }

    const priceMap = { day: product.price, week: product.week, month: product.month };

    const cartItem = {
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      brand: product.brand,
      price: priceMap[duration] || product.price,
      quantity,
      duration,
      security: product.security || 0,
    };

    try {
      await API.post("/cart/add", cartItem);

      setAddedToCart(true);
      showSuccess("Item added to cart!");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      showError("Failed to add item to cart");
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  const priceMap = { day: product.price, week: product.week, month: product.month };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Section - no box */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Images */}
        <div className="md:w-1/2 flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col space-y-2">
            {product.images?.length > 0 ? (
              product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={product.name}
                  className={`w-16 h-16 object-cover cursor-pointer rounded-lg border-2 transition-all ${selectedImage === img ? "border-sky-400 shadow-md" : "border-gray-200 hover:border-gray-400"
                    }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm">No images</p>
            )}
          </div>

          {/* Main Image */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl p-4">
            <img
              src={selectedImage || "https://via.placeholder.com/400"}
              alt={product.name}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </div>

        {/* Details */}
        <div className="md:w-1/2 flex flex-col space-y-5">
          {/* Category & Brand */}
          <div className="flex items-center gap-3">
            <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              {product.brand}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Duration Selector */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Select Rental Duration</p>
            <div className="flex space-x-2">
              {["day", "week", "month"].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${duration === dur
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {dur.charAt(0).toUpperCase() + dur.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Per Duration */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Price per {duration}</span>
              <span className="text-xl font-bold text-gray-900">&#8377;{(priceMap[duration] || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Security Deposit {quantity > 1 ? `(x${quantity})` : ""}</span>
              <span className="text-sm font-medium text-gray-700">&#8377;{(product.security || 0) * quantity}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">&#8377;{totalAmount}</span>
            </div>
          </div>

          {/* Quantity - no arrows */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 font-medium">Quantity:</label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">-</button>
              <span className="w-12 text-center py-2 border-x font-semibold select-none">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">+</button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { if (!addedToCart) addToCart(); }}
              className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${addedToCart
                  ? "bg-sky-600 text-white cursor-default"
                  : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
            >
              {addedToCart ? "Added to Cart!" : "Add To Cart"}
            </button>
            <button
              onClick={() => { addToCart().then(() => navigate("/cart")); }}
              className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-xl font-bold text-lg hover:bg-gray-900 hover:text-white transition-all"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recommended Products</h2>
        {recommendedProducts.length > 0 ? (
          <div className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide">
            {recommendedProducts.map((recProduct) => (
              <Link
                key={recProduct._id}
                to={`/product/${recProduct.id}`}
                className="flex-shrink-0 w-52 bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-50 flex items-center justify-center p-3">
                  <img
                    src={recProduct.images?.[0] || "https://via.placeholder.com/150"}
                    alt={recProduct.name}
                    className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{recProduct.name}</h3>
                  <p className="text-xs text-gray-500">{recProduct.brand}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-green-600 font-bold">&#8377;{recProduct.price}/day</p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{recProduct.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No recommended products found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
