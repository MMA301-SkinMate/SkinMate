export const FONT_FAMILIES = Object.freeze({
    poppinsSemiBold: 'Poppins-SemiBold',
    poppinsBold: 'Poppins-Bold',
    interRegular: 'Inter-Regular',
    interMedium: 'Inter-Medium',
    interSemiBold: 'Inter-SemiBold',
    interBold: 'Inter-Bold',
});

// Static font files are bundled with the app, so startup needs no font download.
export const FONT_ASSETS = {
    [FONT_FAMILIES.poppinsSemiBold]: require('../assets/fonts/Poppins-SemiBold.ttf'),
    [FONT_FAMILIES.poppinsBold]: require('../assets/fonts/Poppins-Bold.ttf'),
    [FONT_FAMILIES.interRegular]: require('../assets/fonts/Inter-Regular.ttf'),
    [FONT_FAMILIES.interMedium]: require('../assets/fonts/Inter-Medium.ttf'),
    [FONT_FAMILIES.interSemiBold]: require('../assets/fonts/Inter-SemiBold.ttf'),
    [FONT_FAMILIES.interBold]: require('../assets/fonts/Inter-Bold.ttf'),
};
