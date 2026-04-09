import React from "react";
import { useNavigate } from "react-router-dom";
import Categories from "../components/Categories";
import Slideshow from "../components/Slideshow";
import ProductList from "../components/ProductList";
import { useSearchContext } from "../context/SearchContext";

const Home = () => {
  const navigate = useNavigate();
  const { searchQuery, searchResults, searchLoading, currentPage, totalPages, performSearch } = useSearchContext();
  const isSearching = searchQuery.length > 0;

  return (
    <div className="min-h-screen dark:bg-gray-900">
      {!isSearching && (
        <div className="animate-fade transition-opacity duration-500 ease-in-out">
          <Categories />
          <Slideshow />
          <section className="py-10 px-4 md:px-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/search--v1.png" alt="search" />
                <h3 className="text-xl font-semibold mb-2">Browse and Select</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Explore a wide range of gadgets and choose the perfect one that suits your needs.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="50" height="50" src="https://img.icons8.com/ios/50/property-time.png" alt="duration" />
                <h3 className="text-xl font-semibold mb-2">Choose Duration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select your preferred rental duration - daily, weekly, or monthly options available.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="80" height="80" src="https://img.icons8.com/dotty/80/card-in-use.png" alt="payment" />
                <h3 className="text-xl font-semibold mb-2">Pay and Enjoy</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your payment securely and receive your device. Return it when you're done!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mt-6">
        {isSearching ? "Search Results" : "All Products"}
      </h2>

      {isSearching ? (
        <div className="px-4 mt-6">
          {searchLoading ? (
            <div className="text-center text-xl font-semibold">Searching...</div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 text-2xl font-bold">No matching products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="h-40 flex items-center justify-center p-2">
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="max-h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-md font-semibold">{product.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{product.brand}</p>
                      <p className="text-green-600 font-bold">₹{product.price}/day</p>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8 mb-8">
                  <button
                    onClick={() => performSearch(searchQuery, currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => performSearch(searchQuery, currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <ProductList />
      )}
    </div>
  );
};

export default Home;
