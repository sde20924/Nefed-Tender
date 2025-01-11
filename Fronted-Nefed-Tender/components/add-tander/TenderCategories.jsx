import React, { useEffect, useState } from "react";
import { FaSpinner, FaExclamationTriangle } from "react-icons/fa"; // Icons for loading and error states
import { callApiGet } from "@/utils/FetchApi";

export default function TenderCategories({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  headerdynamicSize,
}) {
  // State to manage loading
  const [isLoading, setIsLoading] = useState(false);

  // State to manage errors
  const [error, setError] = useState(null);

  // State to store subcategories based on the selected category
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    // Fetch tender categories
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await callApiGet("demo-excel-sheets");
        setCategories(response.data);
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
    const selectedCategoryId = e.target.value;
    setSelectedCategory(selectedCategoryId);

    // Fetch subcategories for the selected category
    const selectedCategoryData = categories.find(
      (category) => category.demo_tender_sheet_id === selectedCategoryId
    );
    
    if (selectedCategoryData) {
      setSubcategories(selectedCategoryData.subcategories || []);
    }

    setSelectedSubCategory(""); // Reset subcategory when category is changed
  };

  // Handler for subcategory selection
  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
  };

  return (
    <div className="p-4">
      <h2
        className={` ${headerdynamicSize ? `text-${headerdynamicSize} font-medium text-gray-700` : "text-2xl"} mb-1 font-bold`}
      >
        Tender Categories
      </h2>

      <div>
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
              Select a Category:
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

        {/* Subcategory Dropdown */}
        {selectedCategory && !isLoading && !error && subcategories.length > 0 && (
          <div className="mt-4">
            <label
              htmlFor="sub-tender-categories"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Select a Subcategory:
            </label>
            <select
              id="sub-tender-categories"
              value={selectedSubCategory}
              onChange={handleSubCategoryChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">-- Choose a subcategory --</option>
              {subcategories.map((subcategory) => (
                <option
                  key={subcategory.sub_tender_sheet_id}
                  value={subcategory.sub_tender_sheet_id}
                >
                  {subcategory.sub_tender_table_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
