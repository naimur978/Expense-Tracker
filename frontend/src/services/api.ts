import { Expense } from '../types/expense';

const API_PORT = process.env.REACT_APP_API_PORT || '8000';
const API_BASE_URL = `http://localhost:${API_PORT}/api`;

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Helper function to handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get headers with auth token
const getAuthHeaders = (token?: string) => {
  const authToken = token || localStorage.getItem('access_token');
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
  };
};

const refreshTokenFn = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch (error) {
    throw error;
  }
};

// Helper function for authenticated requests with token refresh
const authenticatedRequest = async (
  url: string,
  config: RequestInit = {}
): Promise<any> => {
  try {
    // First attempt with current access token
    const response = await fetch(url, {
      ...config,
      headers: getAuthHeaders(),
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      let newToken: string;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          newToken = await refreshTokenFn();
          isRefreshing = false;
          processQueue(null, newToken);
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          throw error;
        }
      } else {
        // Wait for the refresh to complete
        newToken = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      // Retry the request with new token
      const retryResponse = await fetch(url, {
        ...config,
        headers: getAuthHeaders(newToken),
      });

      return handleResponse(retryResponse);
    }

    return handleResponse(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('No refresh token')) {
      // Handle authentication error (redirect to login, etc.)
      window.location.href = '/login';
    }
    throw error;
  }
};

export const api = {
  // Authentication methods
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/token/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  async refreshToken(refresh: string) {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh }),
    });
    return handleResponse(response);
  },

  async verifyToken() {
    return authenticatedRequest(`${API_BASE_URL}/auth/verify-token/`, {
      method: 'POST',
    });
  },

  // Expense methods with auth headers
  async getExpenses() {
    return authenticatedRequest(`${API_BASE_URL}/expenses/`);
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
    const formattedExpense = {
      ...expense,
      amount: expense.amount.toFixed(2),
    };

    return authenticatedRequest(`${API_BASE_URL}/expenses/`, {
      method: 'POST',
      body: JSON.stringify(formattedExpense),
    });
  },

  async updateExpense(id: string, expense: Omit<Expense, 'id' | 'createdAt'>) {
    const formattedExpense = {
      ...expense,
      amount: expense.amount.toFixed(2),
    };

    return authenticatedRequest(`${API_BASE_URL}/expenses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(formattedExpense),
    });
  },

  async deleteExpense(id: string) {
    return authenticatedRequest(`${API_BASE_URL}/expenses/${id}/`, {
      method: 'DELETE',
    });
  },

  async getExpenseSummary(timeframe: 'weekly' | 'monthly' | 'yearly' = 'monthly') {
    return authenticatedRequest(
      `${API_BASE_URL}/expenses/summary/?timeframe=${timeframe}`
    );
  }
};