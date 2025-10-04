import { ref, computed } from 'vue';
import { backendApi } from '@/services/backendApi';

// Shared state
const user = ref(null);
const accessToken = ref(localStorage.getItem('accessToken'));
const refreshToken = ref(localStorage.getItem('refreshToken'));
const isLoading = ref(false);
const error = ref(null);

export function useAuth() {
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  /**
   * Register new user
   */
  async function register(email, password, name) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await backendApi.register(email, password, name);
      
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (err) {
      error.value = err.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Login user
   */
  async function login(email, password) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await backendApi.login(email, password);
      
      user.value = response.user;
      accessToken.value = response.accessToken;
      refreshToken.value = response.refreshToken;

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      return response;
    } catch (err) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout user
   */
  function logout() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Refresh access token
   */
  async function refresh() {
    if (!refreshToken.value) {
      logout();
      return;
    }

    try {
      const response = await backendApi.refreshToken(refreshToken.value);
      
      user.value = response.user;
      accessToken.value = response.accessToken;

      localStorage.setItem('accessToken', response.accessToken);

      return response;
    } catch (err) {
      // Refresh token invalid, logout
      logout();
      throw err;
    }
  }

  /**
   * Load current user
   */
  async function loadUser() {
    if (!accessToken.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const userData = await backendApi.getCurrentUser(accessToken.value);
      user.value = userData;
    } catch (err) {
      // Token might be expired, try to refresh
      try {
        await refresh();
      } catch (refreshErr) {
        error.value = 'Session expired. Please login again.';
        logout();
      }
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(updates) {
    if (!accessToken.value) {
      throw new Error('Not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const updatedUser = await backendApi.updateProfile(accessToken.value, updates);
      user.value = updatedUser;
      return updatedUser;
    } catch (err) {
      error.value = err.message || 'Profile update failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Change password
   */
  async function changePassword(currentPassword, newPassword) {
    if (!accessToken.value) {
      throw new Error('Not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await backendApi.changePassword(accessToken.value, currentPassword, newPassword);
      return result;
    } catch (err) {
      error.value = err.message || 'Password change failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    user: computed(() => user.value),
    isAuthenticated,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    accessToken: computed(() => accessToken.value),

    // Methods
    register,
    login,
    logout,
    refresh,
    loadUser,
    updateProfile,
    changePassword
  };
}
