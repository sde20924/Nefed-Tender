// src/utils/onEvent.js

import { getIO } from "../connection.js";

/**
 * Registers a callback function for a specific Socket.IO event.
 *
 * @param {string} eventName - The name of the event to listen for.
 * @param {Function} callback - The callback function to execute when the event is triggered.
 */
export const onEvent = (eventName, callback) => {
  const io = getIO();
  if (io) {
    io.on(eventName, callback);
  } else {
    console.error("Socket.IO not initialized");
  }
};
