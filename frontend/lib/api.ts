export const API_URL = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const host = window.location.hostname;

  if (host === "localhost") {
    return "http://localhost:8000";
  }

  return `http://${host}:8000`;
};