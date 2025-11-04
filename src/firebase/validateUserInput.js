// Utility for validation and sanitization of user input

// Remove dangerous symbols (basic XSS prevention)
export const sanitizeInput = (value = '') => value.replace(/[<>/"'`]/g, '');

// Username: only A-Z, a-z, 0–9, length ≤ 50
export const isValidUsername = (username) => {
  const clean = sanitizeInput(username.trim());
  const usernameRegex = /^[A-Za-z0-9]+$/;
  return clean.length > 0 && clean.length <= 50 && usernameRegex.test(clean);
};

// Email: must match standard email format, length ≤ 70
export const isValidEmail = (email) => {
  const clean = sanitizeInput(email.trim());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return clean.length > 0 && clean.length <= 70 && emailRegex.test(clean);
};
