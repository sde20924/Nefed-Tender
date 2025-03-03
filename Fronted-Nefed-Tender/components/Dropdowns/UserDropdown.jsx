import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";


const UserDropdown = () => {
  const router = useRouter();
  const [userAcount, setUserAccount] = useState([
    { type: "admin" },
    { type: "buyer" },
    { type: "seller" },
    { type: "manager" },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleLogout = () => {
    const loginAs = localStorage.getItem("login_as");
    let redirectPath = "/auth/buyer-login";
    if (loginAs === "seller") redirectPath = "/auth/seller-login";
    else if (loginAs === "manager") redirectPath = "/auth/manager-login";
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("data");
    localStorage.removeItem("token_a");
    localStorage.removeItem("data_a");
    // Redirect to the appropriate login page
    router.push(redirectPath);
    window.location.reload(); // Refresh the page
  };
  return (
    <div className="relative" ref={dropdownRef} data-testid="user-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <img
          src="/img/team-1-800x800.jpg" // replace with your profile pic
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
        {/* <span className="hidden sm:inline-block">Profile</span> */}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {userAcount.length > 1 && (
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                // Add your logout logic here
                toast.info("Switch Account clicked");
              }}
            >
              Switch
            </button>
          )}
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
      
    </div>
  );
};

export default UserDropdown;
