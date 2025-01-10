// src/middlewares/auth.js

import httpStatus from "http-status";
import ApiError from "../utils/ApiError.js";
import { roleRights } from "../config/roles.js";
import passport from "passport";

/**
 * Callback function to verify user authentication and authorization.
 *
 * @param {Object} req - The request object.
 * @param {Function} resolve - The function to call when verification succeeds.
 * @param {Function} reject - The function to call when verification fails.
 * @param {Array<string>} requiredRights - List of required rights for the endpoint.
 * @returns {Function} - The callback function for passport authentication.
 */
const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
      );
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

/**
 * Middleware to authenticate and authorize users.
 *
 * @param {...string} requiredRights - Rights required to access the endpoint.
 * @returns {Function} - The middleware function.
 */
const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
