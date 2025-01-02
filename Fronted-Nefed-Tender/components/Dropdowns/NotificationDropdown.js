import React, { useEffect } from "react";
import { createPopper } from "@popperjs/core";
import Link from "next/link";
import { FaBell } from "react-icons/fa"; // Importing a notification icon from react-icons
import { useSelector } from "react-redux";

const NotificationDropdown = () => {
  const socket = useSelector((state) => state.socket.socket_instance);
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0); // Example unread notifications count
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();

  useEffect(() => {
    if (socket) {
      socket.on("New-Tender/Public", handleTenderPublic);

      // return () => {
      //   socket.off("New-Tender/Public", handleTenderPublic);
      // };
    }
  }, [socket]);

  const handleTenderPublic = (data) => {
    setUnreadCount((prevCount) => prevCount + 1);
    console.log("New tender data received:", data);
  };

  const openDropdownPopover = () => {
    setDropdownPopoverShow(true);
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  return (
    <>
      <div className="relative">
        {/* Notification Icon with Badge */}
        <button
          ref={btnDropdownRef}
          onClick={(e) => {
            e.preventDefault();
            dropdownPopoverShow
              ? closeDropdownPopover()
              : openDropdownPopover();
          }}
          className="relative text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {/* Increased icon size */}
          <FaBell className="text-3xl text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-green-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown Content */}
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <p className="px-4 py-2 text-sm text-gray-600">
          You have notifications
        </p>
        {/* Example Notifications */}
        <Link
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          New message received
        </Link>
        <Link
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          Your report is ready
        </Link>
        <Link
          href="#"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={(e) => e.preventDefault()}
        >
          Account settings updated
        </Link>
      </div>
    </>
  );
};

export default NotificationDropdown;
