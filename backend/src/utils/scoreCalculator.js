/**
 * Score Calculator & Skin Compatibility Engine
 * Tuân thủ 100% thuật toán tại sheet_function.csv (Mục 30 & Mục 46)
 */

const SKIN_DICTIONARY = {
  Da_Dau: {
    name: 'Da dầu',
    dos: ['Niacinamide', 'BHA', 'Clay', 'Zinc PCA', 'Salicylic Acid', 'Tea Tree', 'Centella'],
    donts: ['Mineral Oil', 'Shea Butter', 'Coconut Oil', 'Petrolatum', 'Oleic Acid'],
  },
  Da_Kho: {
    name: 'Da khô',
    dos: ['Hyaluronic Acid', 'Ceramide', 'Glycerin', 'B5', 'Panthenol', 'Shea Butter', 'Squalane'],
    donts: ['Alcohol Denat', 'High BHA', 'Sulfates', 'Salicylic Acid'],
  },
  Da_Hon_Hop: {
    name: 'Da hỗn hợp',
    dos: ['Niacinamide', 'Hyaluronic Acid', 'B5', 'Panthenol', 'Zinc PCA', 'Ceramide', 'Centella'],
    donts: ['Heavy Oils', 'Mineral Oil', 'Coconut Oil'],
  },
  Da_Nhay_Cam: {
    name: 'Da nhạy cảm',
    dos: ['Centella Asiatica', 'Centella', 'B5', 'Panthenol', 'Ceramide', 'Madecassoside', 'Allantoin'],
    donts: ['Fragrance', 'Parabens', 'High AHA', 'Retinol', 'Essential Oils', 'Alcohol Denat'],
  },
  Da_Thuong: {
    name: 'Da thường',
    dos: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin E', 'B5', 'Peptide'],
    donts: ['Parabens'],
  },
};

const CONDITION_DICTIONARY = {
  Kích_Ứng: {
    treatment: ['B5', 'Panthenol', 'Ceramide', 'Centella', 'Centella Asiatica', 'Madecassoside', 'Allantoin'],
    banned: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid', 'Salicylic Acid'],
  },
  Khô_Rát: {
    treatment: ['Hyaluronic Acid', 'B5', 'Panthenol', 'Ceramide', 'Glycerin', 'Squalane'],
    banned: ['AHA', 'BHA', 'Retinol', 'Alcohol Denat', 'Salicylic Acid'],
  },
  Nổi_Mụn: {
    treatment: ['Salicylic Acid', 'BHA', 'Tea Tree', 'Benzoyl Peroxide', 'Zinc PCA', 'Centella'],
    banned: ['Silicone', 'Mineral Oil', 'Coconut Oil', 'Shea Butter'],
  },
  Bóng_Dầu: {
    treatment: ['Niacinamide', 'Zinc PCA', 'BHA', 'Clay', 'Salicylic Acid'],
    banned: ['Mineral Oil', 'Heavy Oils', 'Coconut Oil', 'Shea Butter'],
  },
  Bình_Thường: {
    treatment: ['Hyaluronic Acid', 'Peptide', 'Niacinamide', 'Vitamin E', 'Ceramide'],
    banned: [],
  },
};

// Aliases for common Vietnamese condition names
const CONDITION_ALIASES = {
  'kích ứng': 'Kích_Ứng',
  'khô rát': 'Khô_Rát',
  'nổi mụn': 'Nổi_Mụn',
  'bóng dầu': 'Bóng_Dầu',
  'bình thường': 'Bình_Thường',
};

const CONFLICT_MATRIX = {
  AHA: ['Retinol', 'BHA', 'Vitamin C', 'Glycolic Acid', 'Lactic Acid'],
  BHA: ['Retinol', 'AHA', 'Salicylic Acid'],
  Retinol: ['AHA', 'BHA', 'Vitamin C', 'Benzoyl Peroxide', 'Tretinoin'],
  'Vitamin C': ['AHA', 'Retinol', 'Benzoyl Peroxide'],
  'Benzoyl Peroxide': ['Retinol', 'Tretinoin', 'Vitamin C'],
  'Salicylic Acid': ['Retinol', 'AHA'],
};

// Helper to normalize strings for comparison
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

// Check if an ingredient matches an item in a list
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

/**
 * Calculates suitability score based on 4-step logic
 * @param {Array<string>} ingredients - Scanned or entered ingredients
 * @param {string} skinType - User base skin type (e.g. 'Da_Dau')
 * @param {Array<string>} currentConditions - Today's conditions (e.g. ['Khô rát'])
 * @param {Array<string>} routineIngredients - Ingredients currently in today's daily routine
 * @returns {object} { finalScore, baseScore, step1Details, step2Details, step3Details, matchedDos, matchedDonts, matchedTreatments, matchedBanned, matchedConflicts }
 */
function calculateSuitabilityScore({
  ingredients = [],
  skinType = 'Da_Hon_Hop',
  currentConditions = ['Bình thường'],
  routineIngredients = [],
}) {
  let baseScore = 70; // Xuất phát điểm mặc định
  let currentScore = 70;

  const matchedDos = [];
  const matchedDonts = [];
  const matchedTreatments = [];
  const matchedBanned = [];
  const matchedConflicts = [];

  // Lấy dữ liệu Skin Dictionary
  const skinProfile = SKIN_DICTIONARY[skinType] || SKIN_DICTIONARY['Da_Hon_Hop'];

  // BƯỚC 1: Lọc theo Hồ sơ da (Base Profile)
  for (const ing of ingredients) {
    if (matchesAny(ing, skinProfile.dos)) {
      baseScore += 10;
      currentScore += 10;
      matchedDos.push(ing);
    } else if (matchesAny(ing, skinProfile.donts)) {
      baseScore -= 15;
      currentScore -= 15;
      matchedDonts.push(ing);
    }
  }

  // Khóa điểm nền da 0 - 100
  const finalBaseScore = Math.min(100, Math.max(0, baseScore));

  // BƯỚC 2: Lọc theo Tình trạng da Check-in (Today's Condition)
  for (const rawCond of currentConditions) {
    const normalizedCondKey =
      CONDITION_ALIASES[normalizeStr(rawCond)] || rawCond;
    const condData = CONDITION_DICTIONARY[normalizedCondKey];
    if (!condData) continue;

    for (const ing of ingredients) {
      if (matchesAny(ing, condData.treatment)) {
        currentScore += 20;
        matchedTreatments.push({ condition: rawCond, ingredient: ing });
      } else if (matchesAny(ing, condData.banned)) {
        currentScore -= 30;
        matchedBanned.push({ condition: rawCond, ingredient: ing });
      }
    }
  }

  // BƯỚC 3: Lọc Xung đột Routine (Conflict Check)
  for (const ing of ingredients) {
    for (const [key, conflictingList] of Object.entries(CONFLICT_MATRIX)) {
      if (matchesAny(ing, [key])) {
        // Kiểm tra xem routine hôm nay có chất nào nằm trong conflictingList không
        for (const routineIng of routineIngredients) {
          if (matchesAny(routineIng, conflictingList)) {
            currentScore -= 40;
            matchedConflicts.push({
              ingredient: ing,
              conflictsWith: routineIng,
              key,
            });
          }
        }
      }
    }
  }

  // BƯỚC 4: Chốt hạ và Ràng buộc (Clamp 0 - 100)
  const finalScore = Math.min(100, Math.max(0, currentScore));

  return {
    finalScore,
    baseScore: finalBaseScore,
    matchedDos,
    matchedDonts,
    matchedTreatments,
    matchedBanned,
    matchedConflicts,
    verdict:
      finalScore >= 80
        ? 'Rất phù hợp'
        : finalScore >= 60
        ? 'Tương đối an toàn'
        : finalScore >= 40
        ? 'Cần thận trọng'
        : 'Nguy cơ kích ứng cao',
  };
}

module.exports = {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  calculateSuitabilityScore,
  normalizeStr,
  matchesAny,
};
