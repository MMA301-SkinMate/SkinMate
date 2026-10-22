/**
 * SKINCARE DICTIONARY & COMPATIBILITY MATRIX
 * 1. Từ điển Hồ sơ da (Skin_Dictionary):
 *    - Da_Dầu: Do's [Niacinamide, BHA, Clay], Don'ts [Mineral Oil, Shea Butter, Coconut Oil]
 * 2. Từ điển Trạng thái da (Condition_Dictionary):
 *    - Kích_Ứng: Trị liệu [B5, Ceramide, Centella], Cấm kỵ [AHA, BHA, Retinol, Vitamin C]
 *    - Nổi_Mụn: Trị liệu [Salicylic Acid, Tea Tree, Benzoyl Peroxide], Cấm kỵ [Silicone, Mineral Oil]
 * 3. Ma trận Xung đột (Conflict_Matrix):
 *    - AHA kỵ [Retinol, BHA, Vitamin C]
 *    - BHA kỵ [Retinol, AHA]
 */

const SKIN_DICTIONARY = {
  Da_Dau: {
    key: 'Da_Dau',
    name: 'Da dầu',
    aliases: ['Da_Dầu', 'da dau', 'da_dau', 'oily'],
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
    name: 'Da hỗn hợp',
    aliases: ['Da_Hỗn_Hợp', 'da hon hop', 'da_hon_hop', 'combination'],
    dos: ['Niacinamide', 'Hyaluronic Acid', 'B5', 'Panthenol', 'Zinc PCA', 'Ceramide', 'Centella'],
    donts: ['Heavy Oils', 'Mineral Oil', 'Coconut Oil'],
  },
  Da_Nhay_Cam: {
    key: 'Da_Nhay_Cam',
    name: 'Da nhạy cảm',
    aliases: ['Da_Nhạy_Cảm', 'da nhay cam', 'da_nhay_cam', 'sensitive'],
    dos: ['Centella Asiatica', 'Centella', 'B5', 'Panthenol', 'Ceramide', 'Madecassoside', 'Allantoin'],
    donts: ['Fragrance', 'Parabens', 'High AHA', 'Retinol', 'Essential Oils', 'Alcohol Denat'],
  },
  Da_Thuong: {
    key: 'Da_Thuong',
    name: 'Da thường',
    aliases: ['Da_Thường', 'da thuong', 'da_thuong', 'normal'],
    dos: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin E', 'B5', 'Peptide'],
    donts: ['Parabens'],
  },
};

const CONDITION_DICTIONARY = {
  Kích_Ứng: {
    key: 'Kích_Ứng',
    name: 'Kích ứng',
    aliases: ['Kich_Ung', 'kich ung', 'irritated', 'irritation'],
    treatment: ['B5', 'Ceramide', 'Centella', 'Panthenol', 'Madecassoside', 'Allantoin'],
    banned: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid', 'Salicylic Acid'],
  },
  Nổi_Mụn: {
    key: 'Nổi_Mụn',
    name: 'Nổi mụn',
    aliases: ['Noi_Mun', 'noi mun', 'acne', 'breakout'],
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
  Bóng_Dầu: {
    key: 'Bóng_Dầu',
    name: 'Bóng dầu',
    aliases: ['Bong_Dau', 'bong dau', 'oily_shine'],
    treatment: ['Niacinamide', 'Zinc PCA', 'BHA', 'Clay', 'Salicylic Acid'],
    banned: ['Mineral Oil', 'Heavy Oils', 'Coconut Oil', 'Shea Butter'],
  },
  Bình_Thường: {
    key: 'Bình_Thường',
    name: 'Bình thường',
    aliases: ['Binh_Thuong', 'binh thuong', 'normal'],
    treatment: ['Hyaluronic Acid', 'Peptide', 'Niacinamide', 'Vitamin E', 'Ceramide'],
    banned: [],
  },
};

const CONFLICT_MATRIX = {
  AHA: ['Retinol', 'BHA', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid'],
  BHA: ['Retinol', 'AHA', 'Salicylic Acid'],
  Retinol: ['AHA', 'BHA', 'Vitamin C', 'Benzoyl Peroxide', 'Tretinoin'],
  'Vitamin C': ['AHA', 'Retinol', 'Benzoyl Peroxide'],
  'Benzoyl Peroxide': ['Retinol', 'Tretinoin', 'Vitamin C'],
  'Salicylic Acid': ['Retinol', 'AHA'],
};

// Aliases mapping for fast condition lookup
const CONDITION_ALIASES = {
  'kích ứng': 'Kích_Ứng',
  'kich ung': 'Kích_Ứng',
  'kich_ung': 'Kích_Ứng',
  'kích_ứng': 'Kích_Ứng',
  'nổi mụn': 'Nổi_Mụn',
  'noi mun': 'Nổi_Mụn',
  'noi_mun': 'Nổi_Mụn',
  'nổi_mụn': 'Nổi_Mụn',
  'khô rát': 'Khô_Rát',
  'kho rat': 'Khô_Rát',
  'kho_rat': 'Khô_Rát',
  'khô_rát': 'Khô_Rát',
  'bóng dầu': 'Bóng_Dầu',
  'bong dau': 'Bóng_Dầu',
  'bong_dau': 'Bóng_Dầu',
  'bóng_dầu': 'Bóng_Dầu',
  'bình thường': 'Bình_Thường',
  'binh thuong': 'Bình_Thường',
  'binh_thuong': 'Bình_Thường',
  'bình_thường': 'Bình_Thường',
};

const SKIN_TYPE_ALIASES = {
  'da dầu': 'Da_Dau',
  'da_dau': 'Da_Dau',
  'da_dầu': 'Da_Dau',
  'da khô': 'Da_Kho',
  'da_kho': 'Da_Kho',
  'da_khô': 'Da_Kho',
  'da hỗn hợp': 'Da_Hon_Hop',
  'da_hon_hop': 'Da_Hon_Hop',
  'da_hỗn_hợp': 'Da_Hon_Hop',
  'da nhạy cảm': 'Da_Nhay_Cam',
  'da_nhay_cam': 'Da_Nhay_Cam',
  'da_nhạy_cảm': 'Da_Nhay_Cam',
  'da thường': 'Da_Thuong',
  'da_thuong': 'Da_Thuong',
  'da_thường': 'Da_Thuong',
};

function normalizeStr(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSkinProfile(skinType) {
  if (!skinType) return SKIN_DICTIONARY.Da_Hon_Hop;
  if (SKIN_DICTIONARY[skinType]) return SKIN_DICTIONARY[skinType];
  const norm = normalizeStr(skinType);
  const matchedKey = SKIN_TYPE_ALIASES[norm] || SKIN_TYPE_ALIASES[skinType.toLowerCase()];
  return SKIN_DICTIONARY[matchedKey] || SKIN_DICTIONARY.Da_Hon_Hop;
}

function getConditionProfile(condition) {
  if (!condition) return null;
  if (CONDITION_DICTIONARY[condition]) return CONDITION_DICTIONARY[condition];
  const norm = normalizeStr(condition);
  const matchedKey = CONDITION_ALIASES[norm] || CONDITION_ALIASES[condition.toLowerCase()];
  return CONDITION_DICTIONARY[matchedKey] || null;
}

function matchesAny(ingredient, list) {
  if (!ingredient || !list || !list.length) return false;
  const normIng = normalizeStr(ingredient);
  return list.some((item) => {
    const normItem = normalizeStr(item);
    return (
      normIng === normItem ||
      normIng.includes(normItem) ||
      normItem.includes(normIng)
    );
  });
}

module.exports = {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  CONDITION_ALIASES,
  SKIN_TYPE_ALIASES,
  normalizeStr,
  getSkinProfile,
  getConditionProfile,
  matchesAny,
};