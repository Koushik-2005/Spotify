// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === "development";

// Get the base URL based on environment
export const getBaseUrl = () => {
  return isDevelopment ? "http://localhost:3001" : "https://h6sc4tdn-3001.inc1.devtunnels.ms/"; // Backend URL on Render
};