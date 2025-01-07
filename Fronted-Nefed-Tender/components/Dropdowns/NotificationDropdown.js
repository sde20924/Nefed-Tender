import React, { useEffect } from "react";
import { createPopper } from "@popperjs/core";
import { FaBell, FaEnvelope } from "react-icons/fa"; // Importing a notification icon from react-icons
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  removeNotificationsByIndex,
  setNotifications,
} from "@/store/slices/notificationSlice";
import { useRouter } from "next/router";

const NotificationDropdown = () => {
  const socket = useSelector((state) => state.socket.socket_instance);
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const route = useRouter();

  const Notifications = useSelector(
    (state) => state.notifications.Notifications
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (socket) {
      socket.on("Tender", handleNotifications);
      // socket.on("New-Tender/Public", handleTenderPublic);
      // socket.on("New-Tender/Private", handleTenderPublic);
      // socket.on("Edit-Tender/Public", handleTenderPublic);
      // socket.on("Edit-Tender/Private", handleTenderPublic);
      // socket.on("New-Application", handleTenderPublic);
      // socket.on("Application-status", handleTenderPublic);
      // socket.on("New-Bid", handleTenderPublic);
      // socket.on("Suggested-Price", handleTenderPublic);
      // return () => {
      //   socket.off("New-Tender/Public", handleTenderPublic);
      // };
    }
  }, [socket]);

  const handleNotifications = (data) => {
    setUnreadCount((prevCount) => prevCount + 1);
    dispatch(setNotifications(data));
  };

  const openDropdownPopover = () => {
    setDropdownPopoverShow(true);
    setUnreadCount(0);
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const notificationClick = (index, routes) => {
    dispatch(removeNotificationsByIndex(index));
    route.push(routes);
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
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48 w-[250px] text-center  max-h-60 overflow-y-auto"
        }
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e0 #f7fafc",
        }}
      >
        <p
          className={`px-2 py-2 text-sm text-gray-600 font-semibold ${
            Notifications.length > 0 ? "border-b border-gray-200" : ""
          }`}
        >
          {Notifications.length > 0
            ? "You have Notifications"
            : "No Recent Notifications"}
        </p>

        {Notifications?.map((notify, index) => {
          return (
            <div
              key={index}
              className="block px-2 py-4 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200 cursor-pointer flex  items-center"
              onClick={() =>
                notificationClick(index, notify?.route || "/dashboard")
              }
            >
              <FaEnvelope className="text-xl text-indigo-300" />{" "}
              <p className="ml-2">{notify.message}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default NotificationDropdown;
