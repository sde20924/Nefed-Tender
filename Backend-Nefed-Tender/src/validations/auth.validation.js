const Joi = require("joi");

const register = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
      "string.empty": "Name is required.",
      "string.min": "Name must be at least 1 character long.",
      "string.max": "Name must not exceed 100 characters.",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address.",
      "string.empty": "Email is required.",
    }),

    mobile: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        "string.pattern.base": "Please provide a valid Indian mobile number.",
        "string.empty": "Mobile number is required.",
      }),

    password: Joi.string().min(8).max(100).required().messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.max": "Password must not exceed 100 characters.",
      "string.empty": "Password is required.",
    }),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
};
