import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const AuctionBanner = ({ showBanner, closeBanner, timeLeft }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (showBanner) {
      // Optional: Add any side effects when the banner is shown
    }

    // Close banner on Escape key press
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        initiateClose();
      }
    };

    if (showBanner) {
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('keydown', handleEsc);
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showBanner]);

  const initiateClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeBanner();
    }, 300); // Duration should match the animation duration
  };

  return (
    <>
      {showBanner && (
        <div className="fixed top-0 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <div
            className={`flex items-start bg-gradient-to-r from-green-300 via-green-200 to-green-50 border border-green-300 text-green-700 rounded-lg shadow-lg p-4 transition transform ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {/* Content */}
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold">Auction is Live!</h2>
              <p className="mt-2 text-sm sm:text-base">
                Time Left: <span className="font-semibold">{timeLeft}</span>
              </p>
            </div>

            {/* Close Button */}
            <button
              className="ml-4 text-gray-500 hover:text-gray-800 focus:outline-none"
              onClick={initiateClose}
              aria-label="Close Auction Notification"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuctionBanner;
