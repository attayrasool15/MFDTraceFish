//(axios instance + interceptors)// =========================
// File: src/services/api.ts
// =========================
import axios from 'axios';

let accessToken: string | null = null;

export const api = axios.create({
  baseURL: 'https://your-laravel-api.example.com/api', // TODO: replace with env/baseURL
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export function setAccessToken(token: string | null) {
  accessToken = token;
}