const { COLORS } = require("./src/constants/colors");

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    adaptiveIcon: {
      ...config.android?.adaptiveIcon,
      backgroundColor: COLORS.background,
    },
  },
});
