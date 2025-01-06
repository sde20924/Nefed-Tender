import React from "react";

const ViButton = ({
  onClick,
  label,
  type = "button",
  color = "primary",
  disabled = false,
  className = "",
  children,
}) => {
  // Determine button styles based on color prop
  const colorStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : colorStyles[color]
      } ${className}`}
    >
      {label || children}
    </button>
  );
};

export default ViButton;
