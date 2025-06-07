import axios from 'axios';
import { Alert } from 'react-native';

// Base URL for API calls
const API_URL = 'https://smartagriculturebackend.onrender.com/'; // Ensure this matches your backend URL

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10-second timeout to handle slow servers
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for session-based authentication
});

/**
 * Authentication service for handling API calls related to auth and farm data
 */
export const authService = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{ user: object }>} - User data
   * @throws {Error} - If login fails
   */
  login: async (email, password) => {
    try {
      console.log('Login Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('Input Parameters:', { email, password: '****' }); // Mask password
      console.log('API Request URL:', `${API_URL}api/auth/login`);

      const response = await apiClient.post('api/auth/login', { email, password });

      console.log('Login API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      const { password: _, ...userData } = response.data.user || response.data;
      return {
        user: userData,
      };
    } catch (error) {
      console.error('Login Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Register a new user
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @param {string} username - User's username
   * @param {string} email - User email
   * @param {string} phone - User phone number
   * @param {string} password - User password
   * @returns {Promise<{ user: object, message: string }>} - User data and success message
   * @throws {Error} - If registration fails
   */
  register: async (firstName, lastName, username, email, phone, password) => {
    const role = 'CUSTOMER';
    try {
      console.log('Register Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('Input Parameters:', { firstName, lastName, username, email, phone, password: '****', role });
      console.log('API Request URL:', `${API_URL}api/auth/register`);
      console.log('API Request Payload:', { firstName, lastName, username, email, phone, password, role });

      const response = await apiClient.post('api/auth/register', {
        firstName,
        lastName,
        username,
        email,
        phone,
        password,
        role,
      });

      console.log('Register API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      Alert.alert('Success', response.data.message || 'Registration successful');

      const { password: _, ...userData } = response.data.user || response.data;
      return {
        user: userData,
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<{ success: boolean, message: string }>} - Logout status
   * @throws {Error} - If logout fails
   */
  logout: async () => {
    try {
      console.log('Logout Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('API Request URL:', `${API_URL}api/auth/logout`);

      const response = await apiClient.post('api/auth/logout', {});

      console.log('Logout API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Get current user data
   * @returns {Promise<{ user: object }>} - User data
   * @throws {Error} - If fetch fails
   */
  getCurrentUser: async () => {
    try {
      console.log('GetCurrentUser Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('API Request URL:', `${API_URL}api/auth/me`);

      const response = await apiClient.get('api/auth/me');

      console.log('GetCurrentUser API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      const { password: _, ...userData } = response.data.user || response.data;
      return {
        user: userData,
      };
    } catch (error) {
      console.error('Get Current User Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  isAuthenticated: () => {
    // Since no token, assume authenticated after successful login
    // May need adjustment based on backend session handling
    console.log('isAuthenticated Called:', { isAuthenticated: true });
    return true; // Placeholder; adjust based on backend session validation
  },

  /**
   * Fetch weather data for the farmer's location
   * @param {number} latitude - Latitude of the location
   * @param {number} longitude - Longitude of the location
   * @returns {Promise<object>} - Weather data (current and daily forecast)
   * @throws {Error} - If fetch fails
   */
  fetchWeatherData: async (latitude, longitude) => {
    try {
      console.log('FetchWeatherData Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,weather_code&timezone=Africa%2FNairobi`;
      console.log('API Request URL:', url);

      const response = await apiClient.get(url, {
        baseURL: '', // Override baseURL for Open-Meteo
      });

      console.log('Weather API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return {
        current: response.data.current,
        daily: response.data.daily,
      }; // Return both current and daily data
    } catch (error) {
      console.error('Weather Fetch Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Fetch soil data for the farmer's field
   * @returns {Promise<object>} - Soil data
   * @throws {Error} - If fetch fails
   */
  fetchSoilData: async () => {
    try {
      console.log('FetchSoilData Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('API Request URL:', `${API_URL}api/soil`);

      const response = await apiClient.get('api/soil');

      console.log('Soil API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      console.error('Soil Fetch Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Fetch crop data for the farmer's current crop
   * @returns {Promise<object>} - Crop data
   * @throws {Error} - If fetch fails
   */
  fetchCropData: async () => {
    try {
      console.log('FetchCropData Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('API Request URL:', `${API_URL}api/crop`);

      const response = await apiClient.get('api/crop');

      console.log('Crop API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return response.data;
    } catch (error) {
      console.error('Crop Fetch Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

  /**
   * Fetch sensor data from the backend
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Number of items per page (default: 10)
   * @returns {Promise<object>} - Sensor data and pagination metadata
   * @throws {Error} - If fetch fails
   */
  fetchSensorData: async (page = 0, size = 10) => {
    try {
      console.log('FetchSensorData Function Called at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      const url = `api/sensor/all?page=${page}&size=${size}`;
      console.log('API Request URL:', `${API_URL}${url}`);

      const response = await apiClient.get(url);

      console.log('Sensor API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      return response.data; // Returns { content: [{ id, name, location, status, ... }], totalPages, totalElements, ... }
    } catch (error) {
      console.error('Sensor Fetch Error Details:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
        stack: error.stack,
      });
      throw error;
    }
  },

};

export default authService;