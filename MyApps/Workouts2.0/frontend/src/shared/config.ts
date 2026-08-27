import Constants from 'expo-constants';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const API_BASE_URL = normalizeBaseUrl(
  extra.apiBaseUrl ?? 'http://10.4.63.36:3000',
);
