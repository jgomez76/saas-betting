// export const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "";

// const getApiUrl = () => {
//   if (typeof window === "undefined") {
//     return "http://localhost:8000"; // SSR fallback
//   }

//   const host = window.location.hostname;

//   // 👉 localhost
//   if (host === "localhost") {
//     return "http://localhost:8000";
//   }

//   // 👉 red local (192.168.x.x)
//   if (host.startsWith("192.168")) {
//     return `http://${host}:8000`;
//   }

//   // 👉 producción (ejemplo)
//   return "https://tu-api.com";
// };

// export const API_URL = getApiUrl();

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