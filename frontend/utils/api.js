// API Base URL configuration
// For local development: http://localhost:5000
// For production: Your Elastic Beanstalk URL
// Always return the relative API path.
// Next.js rewrites will forward it to Elastic Beanstalk automatically.

export const getApiUrl = (endpoint) => {
  if (!endpoint) return "/";

  // Ensure it always starts with "/"
  return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
};

export default {
  getUrl: getApiUrl
};