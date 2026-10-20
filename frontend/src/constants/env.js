// Expo requires direct process.env.EXPO_PUBLIC_* access to inline these values.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const mockApiFlag = process.env.EXPO_PUBLIC_USE_MOCK_API?.trim() || 'false';

if (!apiUrl || !/^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/i.test(apiUrl)) {
    throw new Error(
        'Set EXPO_PUBLIC_API_URL to an HTTP(S) API URL in frontend/.env. Copy .env.example to .env to get started.'
    );
}

if (mockApiFlag !== 'true' && mockApiFlag !== 'false') {
    throw new Error('EXPO_PUBLIC_USE_MOCK_API must be true or false in frontend/.env.');
}

export const ENV = Object.freeze({
    API_URL: apiUrl.replace(/\/+$/, ''),
    USE_MOCK_API: mockApiFlag === 'true',
});
