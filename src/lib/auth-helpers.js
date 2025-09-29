import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

// Cookie configuration
const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

/**
 * Get user token in Server-Side Rendering (SSR) context
 * Use this in API routes, middleware, or server components
 * @param {Request} request - The incoming request object
 * @returns {Promise<Object|null>} User session token or null
 */
export async function getUserTokenSSR(request) {
  try {
    const session = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: cookieKey,
      cookieName: cookieKey,
    });
    

    return session;
  } catch (error) {
    console.error("Error getting SSR token:", error);
    return null;
  }
}

/**
 * Get user token using Next.js headers/cookies (Server Components)
 * Use this in server components where you don't have the request object
 * @returns {Promise<string|null>} Raw session cookie value or null
 */
export async function getUserTokenFromHeaders() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(cookieKey)?.value || null;
  } catch (error) {
    console.error("Error getting token from headers:", error);
    return null;
  }
}

/**
 * Get user ID from session token (SSR)
 * @param {Request} request - The incoming request object
 * @returns {Promise<string|null>} User ID or null
 */
export async function getUserIdSSR(request) {
  try {
    const session = await getUserTokenSSR(request);
    return session?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Get user role from session token (SSR)
 * @param {Request} request - The incoming request object
 * @returns {Promise<string|null>} User role or null
 */
export async function getUserRoleSSR(request) {
  try {
    const session = await getUserTokenSSR(request);
    return session?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// Export cookie key for external use if needed
export { cookieKey };
