import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/Usercontext";
import { useWishlistContext } from "../context/WishlistContext";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import API from "../api/axiosInstance";
import { showSuccess, showError, showInfo } from "../components/ToastMessage";

const StarRating = ({ rating, onRate, interactive = false }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(star)}
          className={`text-xl ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { wishlistIds, toggleWishlist } = useWishlistContext();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [duration, setDuration] = useState("day");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [canReview, setCanReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async (productObjectId) => {
    try {
      const { data } = await API.get(`/reviews/${productObjectId}`);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setReviewCount(data.total);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const checkCanReview = async (productObjectId) => {
    if (!user) { setCanReview(false); return; }
    try {
      const { data } = await API.get("/orders/my-orders");
      const pid = productObjectId.toString();
      const hasDelivered = data.some(
        (order) => order.status === "delivered" && order.items.some((item) => {
          const itemPid = (item.productId?._id || item.productId || "").toString();
          return itemPid === pid;
        })
      );
      const alreadyReviewed = reviews.some((r) => (r.userId?._id || r.userId) === user._id);
      setCanReview(hasDelivered && !alreadyReviewed);
    } catch {
      setCanReview(false);
    }
  };

  useEffect(() => {
    setProduct(null);
    setRecommendedProducts([]);
    setReviews([]);
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
          fetchReviews(data._id);

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
    if (product?._id) checkCanReview(product._id);
  }, [user, product, reviews]);

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
    const ProductDetailSkeleton = React.lazy(() => import("../components/skeletons/ProductDetailSkeleton"));
    return (
      <React.Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div></div>}>
        <ProductDetailSkeleton />
      </React.Suspense>
    );
  }

  const priceMap = { day: product.price, week: product.week, month: product.month };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Product Section - no box */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
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
                  className={`w-16 h-16 object-cover cursor-pointer rounded-lg border-2 transition-all ${selectedImage === img ? "border-sky-400 shadow-md" : "border-gray-200 dark:border-gray-600 hover:border-gray-400"
                    }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))
            ) : (
              <p className="text-gray-400 text-sm">No images</p>
            )}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            {user && (
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-3 right-3 z-10 text-2xl hover:scale-110 transition-transform"
              >
                {wishlistIds.has(product._id)
                  ? <AiFillHeart className="text-red-500" />
                  : <AiOutlineHeart className="text-gray-400 hover:text-red-400" />}
              </button>
            )}
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
            <span className="bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-semibold px-3 py-1 rounded-full">
              {product.category}
            </span>
            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold px-3 py-1 rounded-full">
              {product.brand}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>

          {/* Duration Selector */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Select Rental Duration</p>
            <div className="flex space-x-2">
              {["day", "week", "month"].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setDuration(dur)}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${duration === dur
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {dur.charAt(0).toUpperCase() + dur.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Per Duration */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Price per {duration}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">&#8377;{(priceMap[duration] || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Security Deposit {quantity > 1 ? `(x${quantity})` : ""}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">&#8377;{(product.security || 0) * quantity}</span>
            </div>
            <hr className="my-2 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="text-gray-800 dark:text-gray-200 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-green-600">&#8377;{totalAmount}</span>
            </div>
          </div>

          {/* Quantity - no arrows */}
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">Quantity:</label>
            <div className="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold">-</button>
              <span className="w-12 text-center py-2 border-x dark:border-gray-600 font-semibold select-none">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-bold">+</button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

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
              className="flex-1 border-2 border-gray-900 dark:border-gray-400 text-gray-900 dark:text-gray-100 py-3 rounded-xl font-bold text-lg hover:bg-gray-900 hover:text-white transition-all"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">{avgRating} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
          </div>
        </div>

        {user && !canReview && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {reviews.some((r) => (r.userId?._id || r.userId) === user._id)
                ? "You have already reviewed this product."
                : "You can write a review after your rental is delivered."}
            </p>
          </div>
        )}

        {canReview && (
          <form
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmittingReview(true);
              try {
                await API.post("/reviews", {
                  productId: product._id,
                  ...reviewForm,
                });
                showSuccess("Review submitted!");
                setReviewForm({ rating: 5, title: "", comment: "" });
                fetchReviews(product._id);
              } catch (err) {
                showError(err.response?.data?.message || "Failed to submit review");
              } finally {
                setSubmittingReview(false);
              }
            }}
          >
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</label>
              <StarRating rating={reviewForm.rating} onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} interactive />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                maxLength={100}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
                rows={3}
                maxLength={1000}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.userId?.avatarUrl || "https://via.placeholder.com/40"}
                      alt={review.userId?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{review.userId?.name || "User"}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    {user && review.userId?._id === user._id && (
                      <button
                        onClick={async () => {
                          try {
                            await API.delete(`/reviews/${review._id}`);
                            showSuccess("Review deleted");
                            fetchReviews(product._id);
                          } catch {
                            showError("Failed to delete review");
                          }
                        }}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{review.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-6">No reviews yet. Be the first to review!</p>
        )}
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
                className="flex-shrink-0 w-44 sm:w-52 bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-3">
                  <img
                    src={recProduct.images?.[0] || "https://via.placeholder.com/150"}
                    alt={recProduct.name}
                    className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{recProduct.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{recProduct.brand}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-green-600 font-bold">&#8377;{recProduct.price}/day</p>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{recProduct.category}</span>
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
