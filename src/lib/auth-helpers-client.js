"use client";

import Cookies from "js-cookie";

// Cookie configuration
const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

/**
 * Get user token in Client-Side Rendering (CSR) context using js-cookie
 * Use this in client components, hooks, or client-side logic
 * Note: This only returns the raw cookie value, not the decoded session
 * @returns {string|null} Raw session cookie value or null
 */
export function getUserTokenCSR() {
  const sessionCookie = Cookies.get(cookieKey);
  return sessionCookie;
}

/**
 * Check if user is authenticated (CSR)
 * @returns {boolean} Whether user has a session cookie
 */
export function isAuthenticatedCSR() {
  return !!getUserTokenCSR();
}

// Export cookie key for external use if needed
export { cookieKey };
