/**
 * SKINCARE DICTIONARY & COMPATIBILITY MATRIX (FRONTEND)
 *
 * 1. Từ điển Hồ sơ da (Skin_Dictionary):
 *    - Da_Dầu: Do's [Niacinamide, BHA, Clay], Don'ts [Mineral Oil, Shea Butter, Coconut Oil]
 * 2. Từ điển Trạng thái da (Condition_Dictionary):
 *    - Kích_Ứng: Trị liệu [B5, Ceramide, Centella], Cấm kỵ [AHA, BHA, Retinol, Vitamin C]
 *    - Nổi_Mụn: Trị liệu [Salicylic Acid, Tea Tree, Benzoyl Peroxide], Cấm kỵ [Silicone, Mineral Oil]
 * 3. Ma trận Xung đột (Conflict_Matrix):
 *    - AHA kỵ [Retinol, BHA, Vitamin C]
 *    - BHA kỵ [Retinol, AHA]
 */

export const SKIN_DICTIONARY = {
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

export const CONDITION_DICTIONARY = {
  'Kích_Ứng': {
    key: 'Kích_Ứng',
    name: 'Kích ứng',
    aliases: ['Kich_Ung', 'kich ung', 'irritated'],
    treatment: ['B5', 'Ceramide', 'Centella', 'Panthenol', 'Madecassoside', 'Allantoin'],
    banned: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid', 'Salicylic Acid'],
  },
  'Nổi_Mụn': {
    key: 'Nổi_Mụn',
    name: 'Nổi mụn',
    aliases: ['Noi_Mun', 'noi mun', 'acne'],
    treatment: ['Salicylic Acid', 'Tea Tree', 'Benzoyl Peroxide', 'BHA', 'Zinc PCA', 'Centella'],
    banned: ['Silicone', 'Mineral Oil', 'Coconut Oil', 'Shea Butter'],
  },
  'Khô_Rát': {
    key: 'Khô_Rát',
    name: 'Khô rát',
    aliases: ['Kho_Rat', 'kho rat', 'dry_tight'],
    treatment: ['Hyaluronic Acid', 'B5', 'Panthenol', 'Ceramide', 'Glycerin', 'Squalane'],
    banned: ['AHA', 'BHA', 'Retinol', 'Alcohol Denat', 'Salicylic Acid'],
  },
  'Bóng_Dầu': {
    key: 'Bóng_Dầu',
    name: 'Bóng dầu',
    aliases: ['Bong_Dau', 'bong dau', 'oily_shine'],
    treatment: ['Niacinamide', 'Zinc PCA', 'BHA', 'Clay', 'Salicylic Acid'],
    banned: ['Mineral Oil', 'Heavy Oils', 'Coconut Oil', 'Shea Butter'],
  },
  'Bình_Thường': {
    key: 'Bình_Thường',
    name: 'Bình thường',
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

export const CHECKIN_OPTIONS = [
  { id: 'Bình thường', label: 'Bình thường', icon: 'happy-outline', color: '#10b981' },
  { id: 'Khô rát', label: 'Khô rát', icon: 'water-outline', color: '#f59e0b' },
  { id: 'Kích ứng', label: 'Kích ứng', icon: 'flame-outline', color: '#ef4444' },
  { id: 'Nổi mụn', label: 'Nổi mụn', icon: 'alert-circle-outline', color: '#ec4899' },
  { id: 'Bóng dầu', label: 'Bóng dầu', icon: 'sparkles-outline', color: '#3b82f6' },
];

export default {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  CHECKIN_OPTIONS,
};
