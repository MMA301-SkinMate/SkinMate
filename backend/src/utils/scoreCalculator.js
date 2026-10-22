/**
 * Score Calculator & Skin Compatibility Engine
 * Logic 4 bước chấm điểm độ phù hợp mỹ phẩm:
 * - Bước 1: Lọc theo Hồ sơ da (Base Profile - Skin_Dictionary: Do's +10, Don'ts -15)
 * - Bước 2: Lọc theo Tình trạng da Check-in (Today's Condition: Trị liệu +20, Cấm kỵ -30)
 * - Bước 3: Lọc Xung đột Routine (Conflict Matrix: -40 nếu xung đột với sản phẩm đang dùng)
 * - Bước 4: Chốt hạ điểm (0 - 100) và đưa ra đánh giá
 */

const {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  getSkinProfile,
  getConditionProfile,
  matchesAny,
  normalizeStr,
} = require('../constants/skinDictionary');

/**
 * Calculates suitability score based on 4-step logic
 * @param {Array<string>} ingredients - Scanned or entered ingredients
 * @param {string} skinType - User base skin type (e.g. 'Da_Dầu' or 'Da_Dau')
 * @param {Array<string>} currentConditions - Today's conditions (e.g. ['Kích_Ứng', 'Nổi_Mụn'])
 * @param {Array<string>} routineIngredients - Ingredients currently in today's daily routine
 * @returns {object} { finalScore, baseScore, matchedDos, matchedDonts, matchedTreatments, matchedBanned, matchedConflicts, verdict }
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

  // Lấy dữ liệu Skin Dictionary (Hồ sơ da)
  const skinProfile = getSkinProfile(skinType);

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
    const condData = getConditionProfile(rawCond);
    if (!condData) continue;

    for (const ing of ingredients) {
      if (matchesAny(ing, condData.treatment)) {
        currentScore += 20;
        matchedTreatments.push({ condition: condData.name || rawCond, ingredient: ing });
      } else if (matchesAny(ing, condData.banned)) {
        currentScore -= 30;
        matchedBanned.push({ condition: condData.name || rawCond, ingredient: ing });
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
  getSkinProfile,
  getConditionProfile,
  calculateSuitabilityScore,
  normalizeStr,
  matchesAny,
};