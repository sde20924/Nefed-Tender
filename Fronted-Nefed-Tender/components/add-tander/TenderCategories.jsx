import React, { useEffect, useState } from "react";
import axios from "axios"; // Optional: For HTTP requests
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa"; // Icons for loading and error states
import { callApiGet } from "@/utils/FetchApi";

export default function TenderCategories({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  headerdynamicSize,
}) {
  console.log("--------88--",headerdynamicSize);
  
  // State to manage loading
  const [isLoading, setIsLoading] = useState(false);

  // State to manage errors
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch tender categories
    console.log("jnfd");
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Using axios
        const response = await callApiGet("common/demo-excel-sheets");
        // Assuming the API returns an array of categories
        setCategories(response.data);
        console.log("+__+_+_+data", response.data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handler for category selection
  const handleCategoryChange = (e) => {
    console.log("-------", e);

    setSelectedCategory(e.target.value);
    // You can perform additional actions here when a category is selected
    console.log("Selected Category:", e.target.value);
  };

  return (
    <div className="p-4">
      <h2
        className={` ${headerdynamicSize ? `text-${headerdynamicSize} font-medium text-gray-700`  : "text-2xl" } mb-1 font-bold`}
      >
        Tender Categories
      </h2>

      <div className=" ">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <FaSpinner className="animate-spin" />
            <span>Loading categories...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* Categories Dropdown */}
        {!isLoading && !error && (
          <div>
            <label
              htmlFor="tender-categories"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              {/* Select a Category: */}
            </label>
            <select
              id="tender-categories"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">-- Choose a category --</option>
              {categories?.map((category) => (
                <option
                  key={category.demo_tender_sheet_id}
                  value={category.demo_tender_sheet_id}
                >
                  {category.tender_table_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Display Selected Category */}
      </div>
    </div>
  );
}
