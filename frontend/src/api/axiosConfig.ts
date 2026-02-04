import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Backend URL (እንደ አስፈላጊነቱ እዚህ ጋር አስተካክል)
const API_BASE_URL = 'http://192.168.137.1:5000/api';

/**
 * 1. Axios Instance መፍጠር
 * Cookies እንዲሰራ withCredentials የግድ true መሆን አለበት
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ለ HttpOnly Cookies ወሳኝ ነው
});

// ለ Refresh Token Queue የሚያገለግሉ ተለዋዋጮች
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * በ Refresh ወቅት ተሰልፈው የሚጠባበቁ ጥያቄዎችን ለማስተናገድ
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * 2. Request Interceptor
 * Access Token ካለ በ Header ውስጥ ይልካል
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 3. Response Interceptor
 * 401 (Expired Token) ሲያጋጥም በራስ ሰር Refresh ያደርጋል
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // ስህተቱ 401 ከሆነ እና ጥያቄው ገና ያልተደገመ ከሆነ
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // ሌላ የሪፍሬሽ ጥያቄ በሂደት ላይ ካለ ተራ ይዞ እንዲጠብቅ ማድረግ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        /**
         * Refresh Token ጥያቄ
         * ማሳሰቢያ፡ refreshToken በኩኪ ስለሚሄድ Body ውስጥ መላክ አያስፈልግም
         */
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {}, // Empty body because we use cookies
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        
        // አዲሱን token ማስቀመጥ
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // ሪፍሬሽ ማድረግ ካልተቻለ ተጠቃሚውን ማስወጣት
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ሌሎች ስህተቶችን ማስተናገድ
    const status = error.response?.status;
    if (status === 403) {
      toast.error('ይህንን መረጃ ለማየት ስልጣን የለዎትም');
    } else if (status === 404) {
      toast.error('የተፈለገው መረጃ አልተገኘም');
    } else if (status === 423) {
      toast.error('አካውንትዎ ለጊዜው ታግዷል (Locked)');
    } else if (status === 500) {
      toast.error('የሰርቨር ስህተት ገጥሟል፣ እባክዎ ቆይተው ይሞክሩ');
    }

    return Promise.reject(error);
  }
);

export default api;