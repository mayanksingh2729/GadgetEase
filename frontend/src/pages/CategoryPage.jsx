import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";

const CategoryPage = () => {
  const { category } = useParams(); // Get category from URL
  const navigate = useNavigate(); // For navigation
  const [sortOrder, setSortOrder] = useState(""); // Sorting state
  const [selectedFilters, setSelectedFilters] = useState([category]); // Default to URL category
  const [products, setProducts] = useState([]); // Store products from database
  const [allCategories, setAllCategories] = useState([]); // Store available categories

  // ✅ Fetch products from backend
  useEffect(() => {
    API.get("/products")
      .then((res) => {
        const data = res.data;
        setProducts(data);

        // Extract unique categories from fetched data
        const uniqueCategories = [...new Set(data.map((p) => p.category))];
        setAllCategories(uniqueCategories);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // ✅ Update selected filters if category from URL changes
  useEffect(() => {
    if (category) {
      setSelectedFilters((prev) => (prev.includes(category) ? prev : [category]));
    }
  }, [category]);

  // ✅ Get products that match selected filters
  const filteredProducts = products.filter((product) => selectedFilters.includes(product.category));

  // ✅ Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    return sortOrder === "lowToHigh" ? a.price - b.price : sortOrder === "highToLow" ? b.price - a.price : 0;
  });

  // ✅ Handle Category Selection
  const handleCategoryChange = (selectedCategory) => {
    setSelectedFilters((prev) =>
      prev.includes(selectedCategory) ? prev.filter((c) => c !== selectedCategory) : [...prev, selectedCategory]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex gap-6">
        {/* Sidebar (Filters) */}
        <aside className="w-1/6 h-full bg-white shadow-lg p-4 rounded-lg">
          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-500 mb-2">SORT BY PRICE</h3>
            <hr className="border-gray-400 my-2" />
            <label className="block text-lg">
              <input
                type="radio"
                name="sort"
                value="lowToHigh"
                checked={sortOrder === "lowToHigh"}
                onChange={() => setSortOrder("lowToHigh")}
                className="mr-2"
              />
              Low to High
            </label>
            <label className="block text-lg">
              <input
                type="radio"
                name="sort"
                value="highToLow"
                checked={sortOrder === "highToLow"}
                onChange={() => setSortOrder("highToLow")}
                className="mr-2"
              />
              High to Low
            </label>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="font-bold text-lg text-gray-500 mb-2">CATEGORY</h3>
            <hr className="border-gray-400 my-2" />
            {allCategories.map((cat, index) => (
              <label key={index} className="block text-lg">
                <input
                  type="checkbox"
                  value={cat}
                  checked={selectedFilters.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  className="mr-2"
                />
                {cat}
              </label>
            ))}
          </div>
        </aside>

        {/* Product Display Section */}
        <section className="w-4/5">
          <h2 className="text-xl font-semibold mb-4">Showing {sortedProducts.length} results</h2>
          <div className="grid grid-cols-4 gap-6">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)} // ✅ Navigate to Product Detail
                >
                  <img
                    src={product.images && product.images[0] ? product.images[0] : "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="w-40 h-40 object-contain mb-3 transform transition-transform duration-300 hover:scale-105"
                  />
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-gray-500">{product.brand}</p>
                  <p className="text-green-600 font-bold">₹{product.price.toFixed(2)}</p>
                  <button className="bg-black text-white font-bold px-4 py-2 rounded-lg mt-2 transform transition-all duration-300 hover:scale-105 hover:text-sky-400">
                    Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-3">No products found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
