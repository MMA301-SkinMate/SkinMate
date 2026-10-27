import { COLORS } from './colors';
import { FONT_FAMILIES } from './fonts';

export { FONT_FAMILIES } from './fonts';

export const SPACING = {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
    screen: 20,
    section: 24,
};

export const RADIUS = {
    small: 8,
    input: 12,
    card: 20,
    cardLarge: 24,
    pill: 999,
};

// Inter is the safe default for Vietnamese. Use getHeadingStyle for Poppins
// headings with an explicit, whole-heading Inter fallback when glyphs are missing.
export const TYPOGRAPHY = {
    hero: { fontFamily: FONT_FAMILIES.interBold, fontSize: 28, lineHeight: 35 },
    title: { fontFamily: FONT_FAMILIES.interSemiBold, fontSize: 24, lineHeight: 32 },
    section: { fontFamily: FONT_FAMILIES.interSemiBold, fontSize: 20, lineHeight: 28 },
    body: { fontFamily: FONT_FAMILIES.interRegular, fontSize: 16, lineHeight: 24 },
    bodySmall: { fontFamily: FONT_FAMILIES.interRegular, fontSize: 14, lineHeight: 21 },
    caption: { fontFamily: FONT_FAMILIES.interRegular, fontSize: 12, lineHeight: 18 },
    label: { fontFamily: FONT_FAMILIES.interMedium, fontSize: 14, lineHeight: 20 },
    button: { fontFamily: FONT_FAMILIES.interSemiBold, fontSize: 16, lineHeight: 24 },
    tab: { fontFamily: FONT_FAMILIES.interMedium, fontSize: 12, lineHeight: 18 },
    brand: { fontFamily: FONT_FAMILIES.poppinsBold, fontSize: 28, lineHeight: 35 },
};

const VIETNAMESE_EXTENDED = /[\u01A0\u01A1\u01AF\u01B0\u1EA0-\u1EF9]/u;

export const getHeadingStyle = (text, variant = 'title') => {
    const style = ['hero', 'title', 'section'].includes(variant)
        ? TYPOGRAPHY[variant]
        : TYPOGRAPHY.title;
    const needsInter = VIETNAMESE_EXTENDED.test(String(text ?? '').normalize('NFC'));

    return {
        ...style,
        fontFamily: needsInter
            ? style.fontFamily
            : style.fontFamily === FONT_FAMILIES.interBold
                ? FONT_FAMILIES.poppinsBold
                : FONT_FAMILIES.poppinsSemiBold,
    };
};

// Backward-compatible exports: existing imports and sizes keep working.
export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    title: 20,
    radius: RADIUS.input,
    radiusLarge: RADIUS.card,
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
};

export const THEME = {
    COLORS,
    SIZES,
    SHADOWS,
    SPACING,
    TYPOGRAPHY,
    RADIUS,
    FONT_FAMILIES,
};
