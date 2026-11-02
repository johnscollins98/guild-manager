export const config = {
  backEndBaseUrl: import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:3000')
};
