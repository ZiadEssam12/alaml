"use client";

import Cookies from "js-cookie";

/**
 * Get user token in Client-Side Rendering (CSR) context
 * Fetches the JWT token from the server-side token endpoint
 * @returns {Promise<string|null>} JWT token or null
 */
export async function getUserTokenCSR() {
  try {
    const response = await fetch("/api/auth/token");

    if (!response.ok) {
      console.log("User not authenticated");
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error("Error getting CSR token:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (CSR)
 * @returns {boolean} Whether user has a session
 */
export function isAuthenticatedCSR() {
  return !!getUserTokenCSR();
}
