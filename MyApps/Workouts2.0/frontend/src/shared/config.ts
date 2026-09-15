import Constants from 'expo-constants';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

const defaultApiBaseUrl = 'http://10.4.63.36:3000';
const productionWebApiBaseUrl = 'https://workouts2-0-api.onrender.com';

const isWebProduction = process.env.NODE_ENV === 'production' || Constants.appOwnership === 'standalone';

export const API_BASE_URL = normalizeBaseUrl(
  extra.apiBaseUrl ?? (isWebProduction ? productionWebApiBaseUrl : defaultApiBaseUrl),
);
