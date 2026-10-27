/**
 * SKINCARE DICTIONARY & COMPATIBILITY MATRIX (FRONTEND)
 *
 * 1. T? di?n H? so da (Skin_Dictionary):
 *    - Da_D?u: Do's [Niacinamide, BHA, Clay], Don'ts [Mineral Oil, Shea Butter, Coconut Oil]
 * 2. T? di?n Tr?ng thái da (Condition_Dictionary):
 *    - Kích_?ng: Tr? li?u [B5, Ceramide, Centella], C?m k? [AHA, BHA, Retinol, Vitamin C]
 *    - N?i_M?n: Tr? li?u [Salicylic Acid, Tea Tree, Benzoyl Peroxide], C?m k? [Silicone, Mineral Oil]
 * 3. Ma tr?n Xung d?t (Conflict_Matrix):
 *    - AHA k? [Retinol, BHA, Vitamin C]
 *    - BHA k? [Retinol, AHA]
 */

export const SKIN_DICTIONARY = {
  Da_Dau: {
    key: 'Da_Dau',
    name: 'Da d?u',
    aliases: ['Da_D?u', 'da dau', 'da_dau', 'oily'],
    dos: ['Niacinamide', 'BHA', 'Clay', 'Zinc PCA', 'Salicylic Acid', 'Tea Tree', 'Centella'],
    donts: ['Mineral Oil', 'Shea Butter', 'Coconut Oil', 'Petrolatum', 'Oleic Acid'],
  },
  Da_Kho: {
    key: 'Da_Kho',
    name: 'Da khô',
    aliases: ['Da_Khô', 'da kho', 'da_kho', 'dry'],
    dos: ['Hyaluronic Acid', 'Ceramide', 'Glycerin', 'B5', 'Panthenol', 'Shea Butter', 'Squalane'],
    donts: ['Alcohol Denat', 'High BHA', 'Sulfates', 'Salicylic Acid'],
  },
  Da_Hon_Hop: {
    key: 'Da_Hon_Hop',
    name: 'Da h?n h?p',
    aliases: ['Da_H?n_H?p', 'da hon hop', 'da_hon_hop', 'combination'],
    dos: ['Niacinamide', 'Hyaluronic Acid', 'B5', 'Panthenol', 'Zinc PCA', 'Ceramide', 'Centella'],
    donts: ['Heavy Oils', 'Mineral Oil', 'Coconut Oil'],
  },
  Da_Nhay_Cam: {
    key: 'Da_Nhay_Cam',
    name: 'Da nh?y c?m',
    aliases: ['Da_Nh?y_C?m', 'da nhay cam', 'da_nhay_cam', 'sensitive'],
    dos: ['Centella Asiatica', 'Centella', 'B5', 'Panthenol', 'Ceramide', 'Madecassoside', 'Allantoin'],
    donts: ['Fragrance', 'Parabens', 'High AHA', 'Retinol', 'Essential Oils', 'Alcohol Denat'],
  },
  Da_Thuong: {
    key: 'Da_Thuong',
    name: 'Da thu?ng',
    aliases: ['Da_Thu?ng', 'da thuong', 'da_thuong', 'normal'],
    dos: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin E', 'B5', 'Peptide'],
    donts: ['Parabens'],
  },
};

export const CONDITION_DICTIONARY = {
  Kích_?ng: {
    key: 'Kích_?ng',
    name: 'Kích ?ng',
    aliases: ['Kich_Ung', 'kich ung', 'irritated'],
    treatment: ['B5', 'Ceramide', 'Centella', 'Panthenol', 'Madecassoside', 'Allantoin'],
    banned: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid', 'Salicylic Acid'],
  },
  N?i_M?n: {
    key: 'N?i_M?n',
    name: 'N?i m?n',
    aliases: ['Noi_Mun', 'noi mun', 'acne'],
    treatment: ['Salicylic Acid', 'Tea Tree', 'Benzoyl Peroxide', 'BHA', 'Zinc PCA', 'Centella'],
    banned: ['Silicone', 'Mineral Oil', 'Coconut Oil', 'Shea Butter'],
  },
  Khô_Rát: {
    key: 'Khô_Rát',
    name: 'Khô rát',
    aliases: ['Kho_Rat', 'kho rat', 'dry_tight'],
    treatment: ['Hyaluronic Acid', 'B5', 'Panthenol', 'Ceramide', 'Glycerin', 'Squalane'],
    banned: ['AHA', 'BHA', 'Retinol', 'Alcohol Denat', 'Salicylic Acid'],
  },
  Bóng_D?u: {
    key: 'Bóng_D?u',
    name: 'Bóng d?u',
    aliases: ['Bong_Dau', 'bong dau', 'oily_shine'],
    treatment: ['Niacinamide', 'Zinc PCA', 'BHA', 'Clay', 'Salicylic Acid'],
    banned: ['Mineral Oil', 'Heavy Oils', 'Coconut Oil', 'Shea Butter'],
  },
  Bình_Thu?ng: {
    key: 'Bình_Thu?ng',
    name: 'Bình thu?ng',
    aliases: ['Binh_Thuong', 'binh thuong', 'normal'],
    treatment: ['Hyaluronic Acid', 'Peptide', 'Niacinamide', 'Vitamin E', 'Ceramide'],
    banned: [],
  },
};

export const CONFLICT_MATRIX = {
  AHA: ['Retinol', 'BHA', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid'],
  BHA: ['Retinol', 'AHA', 'Salicylic Acid'],
  Retinol: ['AHA', 'BHA', 'Vitamin C', 'Benzoyl Peroxide', 'Tretinoin'],
  'Vitamin C': ['AHA', 'Retinol', 'Benzoyl Peroxide'],
  'Benzoyl Peroxide': ['Retinol', 'Tretinoin', 'Vitamin C'],
  'Salicylic Acid': ['Retinol', 'AHA'],
};

export function normalizeStr(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSkinProfile(skinType) {
  if (!skinType) return SKIN_DICTIONARY.Da_Hon_Hop;
  if (SKIN_DICTIONARY[skinType]) return SKIN_DICTIONARY[skinType];
  const norm = normalizeStr(skinType);
  for (const item of Object.values(SKIN_DICTIONARY)) {
    if (normalizeStr(item.name) === norm || item.aliases?.some(a => normalizeStr(a) === norm)) {
      return item;
    }
  }
  return SKIN_DICTIONARY.Da_Hon_Hop;
}

export function getConditionProfile(condition) {
  if (!condition) return null;
  if (CONDITION_DICTIONARY[condition]) return CONDITION_DICTIONARY[condition];
  const norm = normalizeStr(condition);
  for (const item of Object.values(CONDITION_DICTIONARY)) {
    if (normalizeStr(item.name) === norm || item.aliases?.some(a => normalizeStr(a) === norm)) {
      return item;
    }
  }
  return null;
}
