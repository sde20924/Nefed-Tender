// components/AddTender/QuickOptions.js
import React from 'react';

const QuickOptions = ({ isFeatured, handleFeaturedChange, isPublished, handlePublishChange }) => {
  return (
    <div className=" mx-auto mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Quick Options</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <label htmlFor="featured" className="mr-3 text-gray-700">
              Featured
            </label>
            <button
              onClick={handleFeaturedChange}
              className={`${
                isFeatured ? "bg-blue-500" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
            >
              <span
                className={`${
                  isFeatured ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200`}
              />
            </button>
          </div>
          <div className="flex items-center">
            <label htmlFor="publish" className="mr-3 text-gray-700">
              Publish
            </label>
            <button
              onClick={handlePublishChange}
              className={`${
                isPublished ? "bg-blue-500" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
            >
              <span
                className={`${
                  isPublished ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition-transform duration-200`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOptions;
