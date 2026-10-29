import { Platform } from 'react-native';

const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${defaultHost}:5000/api`;

export async function apiRequest(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new Error(`Không thể kết nối máy chủ (${API_BASE_URL}). Hãy kiểm tra địa chỉ API và kết nối mạng.`);
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const error = new Error(result?.message || `Yêu cầu thất bại (${response.status})`);
    error.status = response.status;
    error.data = result;
    throw error;
  }
  return result.data;
}

export { API_BASE_URL };
