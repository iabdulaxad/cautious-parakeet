// App configuration, read from Vite env vars with sensible defaults that match
// the Postman collection. Override per-environment via a .env file.
const config = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.admin.u-code.io",
  functionSlug: import.meta.env.VITE_FUNCTION_SLUG || "matrix-hospital",
  projectId:
    import.meta.env.VITE_PROJECT_ID || "602351f4-4fdb-4d6e-a5f6-370cf1bc1626",
  environmentId:
    import.meta.env.VITE_ENVIRONMENT_ID ||
    "b7691c00-fd8c-47d5-b8e7-e3747235dc79",
  currency: import.meta.env.VITE_CURRENCY || "UZS",
  appName: "Hospital Management",
};

export default config;
