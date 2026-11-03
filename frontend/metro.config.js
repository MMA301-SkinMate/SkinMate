const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Thêm các định dạng tệp asset/font vào Metro Resolver
config.resolver.assetExts.push('ttf', 'otf', 'png', 'jpg');

module.exports = config;