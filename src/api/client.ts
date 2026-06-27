/**
 * Helper to simulate network latency.
 */
export const delay = (ms = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock API Client that simulates Axios/Fetch request structures.
 * This establishes the base API layer that will eventually target actual backend routes.
 */
export const apiClient = {
  get: async <T>(url: string, mockResponse: T, delayMs = 400): Promise<T> => {
    console.log(`[API GET] ${url}`);
    await delay(delayMs);
    return mockResponse;
  },
  
  post: async <T, B>(url: string, body: B, mockResponse: T, delayMs = 500): Promise<T> => {
    console.log(`[API POST] ${url}`, body);
    await delay(delayMs);
    return mockResponse;
  },
  
  put: async <T, B>(url: string, body: B, mockResponse: T, delayMs = 500): Promise<T> => {
    console.log(`[API PUT] ${url}`, body);
    await delay(delayMs);
    return mockResponse;
  },
  
  patch: async <T, B>(url: string, body: B, mockResponse: T, delayMs = 300): Promise<T> => {
    console.log(`[API PATCH] ${url}`, body);
    await delay(delayMs);
    return mockResponse;
  },
  
  delete: async <T>(url: string, mockResponse: T, delayMs = 400): Promise<T> => {
    console.log(`[API DELETE] ${url}`);
    await delay(delayMs);
    return mockResponse;
  }
};
export default apiClient;
