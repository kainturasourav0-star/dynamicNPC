/**
 * Production Security Headers Configuration
 * Enforces Content Security Policy, HSTS, anti-clickjacking, XSS protection, and referrer policy.
 */
export const SECURITY_HEADERS = {
  // Enforce HTTPS
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  
  // Anti-clickjacking
  "X-Frame-Options": "DENY",
  
  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",
  
  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  
  // Permissions Policy
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), interest-cohort=()",
  
  // XSS Protection for legacy browsers
  "X-XSS-Protection": "1; mode=block",
};

export function applySecurityHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}
