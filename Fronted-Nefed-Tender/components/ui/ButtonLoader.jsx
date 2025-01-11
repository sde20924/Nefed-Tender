import React from "react";

// A simple ButtonLoader component that shows a loader inside the button
const ButtonLoader = ({ loading, children, className = "", ...props }) => {
  return (
    <button
      {...props}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center ${loading ? "cursor-wait" : ""} ${className}`}
      disabled={loading} // Disable the button when loading
    >
      {loading ? (
        <>
          {/* Attractive Loading Spinner */}
          <svg
            className="w-6 h-6 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ position: "absolute" }}
          >
          </svg>
          loading...

          {/* Hides content while loading */}
          <span className="opacity-0 absolute">{children}</span>
        </>
      ) : (
        children // Show button content when not loading
      )}
    </button>
  );
};

export default ButtonLoader;
