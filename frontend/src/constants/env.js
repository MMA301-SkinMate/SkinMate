import Constants from 'expo-constants';

// Expo requires direct process.env.EXPO_PUBLIC_* access to inline these values.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const mockApiFlag = process.env.EXPO_PUBLIC_USE_MOCK_API?.trim() || 'false';
const previewFlag = process.env.EXPO_PUBLIC_SHOW_COMPONENT_PREVIEW?.trim() || 'false';

if (!apiUrl || !/^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/i.test(apiUrl)) {
    throw new Error(
        'Set EXPO_PUBLIC_API_URL to an HTTP(S) API URL in frontend/.env. Copy .env.example to .env to get started.'
    );
}

if (mockApiFlag !== 'true' && mockApiFlag !== 'false') {
    throw new Error('EXPO_PUBLIC_USE_MOCK_API must be true or false in frontend/.env.');
}

if (previewFlag !== 'true' && previewFlag !== 'false') {
    throw new Error('EXPO_PUBLIC_SHOW_COMPONENT_PREVIEW must be true or false in frontend/.env.');
}

const getResolvedApiUrl = (url) => {
    let cleanUrl = url.replace(/\/+$/, '');
    if (__DEV__) {
        try {
            const hostUri =
                Constants.expoConfig?.hostUri ||
                Constants.manifest2?.extra?.expoGo?.debuggerHost ||
                Constants.manifest?.debuggerHost;

            if (hostUri) {
                const devIp = hostUri.split(':')[0];
                if (devIp) {
                    cleanUrl = cleanUrl.replace(
                        /^(https?:\/\/)(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+|\[.*?\])(:\d+)?(.*)$/i,
                        (match, proto, oldHost, port, rest) => {
                            const portStr = port || ':5000';
                            return `${proto}${devIp}${portStr}${rest}`;
                        }
                    );
                }
            }
        } catch {
            // Keep cleanUrl as configured
        }
        console.log(`[API Config] Resolved API URL: ${cleanUrl}`);
    }
    return cleanUrl;
};

export const ENV = Object.freeze({
    // API_URL: apiUrl.replace(/\/+$/, ''),
    API_URL: getResolvedApiUrl(apiUrl),
    USE_MOCK_API: mockApiFlag === 'true',
    SHOW_COMPONENT_PREVIEW: previewFlag === 'true',
});
