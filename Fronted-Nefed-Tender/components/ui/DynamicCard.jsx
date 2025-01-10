import React from "react";
import PropTypes from "prop-types";

const DynamicCard = ({ maxWidth, maxHeight, className, width, height, children }) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all ${className}`}
      style={{
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        width: width, // Apply width from props
        height: height, // Apply height from props
      }}
    >
      {children ? (
        children
      ) : (
        <div className="text-center">
          <h2 className="font-bold text-gray-800">Dynamic Card</h2>
          <p className="text-gray-600">No content provided</p>
        </div>
      )}
    </div>
  );
};

DynamicCard.propTypes = {
  maxHeight: PropTypes.string, // Maximum height for the card
  maxWidth: PropTypes.string,  // Maximum width for the card
  children: PropTypes.node,    // Child nodes to render inside the card
  className: PropTypes.string, // Additional CSS classes for styling
  width: PropTypes.string,     // Card width
  height: PropTypes.string,    // Card height
};

DynamicCard.defaultProps = {
  maxHeight: "500px",    // Default max height
  maxWidth: "500px",     // Default max width
  className: "",         // No additional class by default
  width: "auto",         // Default width
  height: "auto",        // Default height
};

export default DynamicCard;
