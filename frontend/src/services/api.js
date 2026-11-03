import axiosClient from '../api/axiosClient';

// Reuse the app's configured API host and authenticated session.
export async function apiRequest(path, { method = 'GET', body } = {}) {
  const result = await axiosClient.request({ url: path, method, data: body });
  if (!result?.success) {
    const error = new Error(result?.message || 'Request failed.');
    error.data = result;
    throw error;
  }
  return result.data;
}
