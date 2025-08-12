import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GA4Tracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-XN985YQBJM", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default GA4Tracker;
