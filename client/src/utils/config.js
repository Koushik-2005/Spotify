// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === "development";

// Get the base URL based on environment
export const getBaseUrl = () => {
  return isDevelopment ? "http://localhost:3001" : "https://spotify-117r.onrender.com"; // Backend URL on Render
};