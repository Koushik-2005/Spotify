import { useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001/api";

export const useAnalytics = () => {
  const logInteraction = useCallback(async (action, page, metadata = {}) => {
    try {
      const userId = localStorage.getItem("userId") || "anonymous";

      await axios.post(`${API_BASE}/log-interaction`, {
        userId,
        action,
        page,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        },
      });
    } catch (error) {
      console.warn("Failed to log interaction:", error);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId") || "anonymous";
      const response = await axios.get(`${API_BASE}/data?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    }
  }, []);

  const fetchAppStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch app stats:", error);
      return null;
    }
  }, []);

  return {
    logInteraction,
    fetchUserData,
    fetchAppStats,
  };
};

export default useAnalytics;
