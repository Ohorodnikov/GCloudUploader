
export const DEFAULT_BUCKET_NAME = 'imges_my_custom';
export const MOCK_UPLOAD_DURATION_MS = 2000;

// Environment Configuration
// These allow injecting credentials via process.env for Service Account integration
export const ENV_CONFIG = {
  BUCKET_NAME: process.env.GCP_BUCKET_NAME,
  ACCESS_TOKEN: process.env.GCP_ACCESS_TOKEN,
  // Full JSON content of the service account key file
  SERVICE_ACCOUNT_KEY: process.env.GCP_SERVICE_ACCOUNT_KEY,
  // Backend URL for production deployment
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL
};

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];