import React, { useState, useMemo } from "react";
import Categories from "../components/Categories";
import Slideshow from "../components/Slideshow";
import ProductList from "../components/ProductList";

const Home = ({ searchQuery: externalSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const activeSearch = externalSearch || searchQuery;
  const isSearching = useMemo(() => activeSearch.length > 0, [activeSearch]);

  return (
    <div className="min-h-screen">
      {!isSearching && (
        <div className="animate-fade transition-opacity duration-500 ease-in-out">
          <Categories />
          <Slideshow />
          {/* "How it works" Section */}
          <section className="py-10 px-4 md:px-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How it works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/search--v1.png" alt="search" />
                <h3 className="text-xl font-semibold mb-2">Browse and Select</h3>
                <p className="text-gray-600">
                  Explore a wide range of gadgets and choose the perfect one that suits your needs.
                </p>
              </div>
              <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="50" height="50" src="https://img.icons8.com/ios/50/property-time.png" alt="duration" />
                <h3 className="text-xl font-semibold mb-2">Choose Duration</h3>
                <p className="text-gray-600">
                  Select your preferred rental duration - daily, weekly, or monthly options available.
                </p>
              </div>
              <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center">
                <img width="80" height="80" src="https://img.icons8.com/dotty/80/card-in-use.png" alt="payment" />
                <h3 className="text-xl font-semibold mb-2">Pay and Enjoy</h3>
                <p className="text-gray-600">
                  Complete your payment securely and receive your device. Return it when you're done!
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 text-center mt-6">
        {isSearching ? "Search Results" : "All Products"}
      </h2>

      <ProductList searchQuery={activeSearch} />
    </div>
  );
};

export default Home;
