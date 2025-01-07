import React from "react";

const ViDialog = ({ open, onClose, children, className = "" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 max-w-screen">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Dialog Content */}
      <div
        className={`bg-white rounded-lg shadow-lg pl-6 pb-6 pt-6 z-50 ${className}`}
        style={{ minWidth: "400px", maxWidth: "1128px" }}
      >
        {children}
      </div>
    </div>
  );
};

export default ViDialog;
