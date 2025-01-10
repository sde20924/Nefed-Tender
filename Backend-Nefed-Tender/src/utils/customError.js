// src/utils/CustomError.js

/**
 * CustomError class for creating operational errors with a message and status code.
 */
export default class CustomError extends Error {
  /**
   * Constructor for the CustomError class.
   *
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code for the error.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    // Capture stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
