import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axiosInstance";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    API.get("/products/categories")
      .then((res) => {
        if (Array.isArray(res.data)) setCategories(res.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="mt-2 overflow-hidden flex justify-center">
      <div className="flex space-x-4 sm:space-x-6 p-3 sm:p-6 max-w-[1600px] overflow-x-auto">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center">
            <Link to={`/category/${category.name}`} className="flex flex-col items-center">
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800">
                <img
                  src={category.image || "https://via.placeholder.com/80"}
                  alt={category.name}
                  className="w-[80%] h-[80%] object-contain transition-transform duration-300 hover:scale-110"
                />
              </div>
              <p className="mt-2 text-center text-gray-700 dark:text-gray-300 font-medium">{category.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
