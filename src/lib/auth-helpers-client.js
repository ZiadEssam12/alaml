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
  console.log("Attempting to get CSR token...", Cookies.get());

  try {
    const sessionCookie = Cookies.get(cookieKey);
    console.log("CSR token retrieved:", sessionCookie);
    return sessionCookie || null;
  } catch (error) {
    console.error("Error getting CSR token:", error);
    return null;
  }
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
