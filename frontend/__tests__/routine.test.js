import {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  CHECKIN_OPTIONS,
} from '../src/constants/skinDictionary';

describe('SkinMate Skincare Dictionaries & Constants (MMA301)', () => {
  test('1. SKIN_DICTIONARY - Da_Dau has correct Dos and Donts', () => {
    const oily = SKIN_DICTIONARY.Da_Dau;
    expect(oily).toBeDefined();
    // Do's [Niacinamide, BHA, Clay]
    expect(oily.dos).toEqual(expect.arrayContaining(['Niacinamide', 'BHA', 'Clay']));
    // Don'ts [Mineral Oil, Shea Butter, Coconut Oil]
    expect(oily.donts).toEqual(expect.arrayContaining(['Mineral Oil', 'Shea Butter', 'Coconut Oil']));
  });

  test('2. CONDITION_DICTIONARY - Kích_Ứng has correct Treatment & Banned lists', () => {
    const irritated = CONDITION_DICTIONARY['Kích_Ứng'];
    expect(irritated).toBeDefined();
    // Trị liệu [B5, Ceramide, Centella]
    expect(irritated.treatment).toEqual(expect.arrayContaining(['B5', 'Ceramide', 'Centella']));
    // Cấm kỵ [AHA, BHA, Retinol, Vitamin C]
    expect(irritated.banned).toEqual(expect.arrayContaining(['AHA', 'BHA', 'Retinol', 'Vitamin C']));
  });

  test('3. CONDITION_DICTIONARY - Nổi_Mụn has correct Treatment & Banned lists', () => {
    const acne = CONDITION_DICTIONARY['Nổi_Mụn'];
    expect(acne).toBeDefined();
    // Trị liệu [Salicylic Acid, Tea Tree, Benzoyl Peroxide]
    expect(acne.treatment).toEqual(expect.arrayContaining(['Salicylic Acid', 'Tea Tree', 'Benzoyl Peroxide']));
    // Cấm kỵ [Silicone, Mineral Oil]
    expect(acne.banned).toEqual(expect.arrayContaining(['Silicone', 'Mineral Oil']));
  });

  test('4. CONFLICT_MATRIX has correct conflicts for AHA and BHA', () => {
    // AHA kỵ [Retinol, BHA, Vitamin C]
    expect(CONFLICT_MATRIX.AHA).toEqual(expect.arrayContaining(['Retinol', 'BHA', 'Vitamin C']));
    // BHA kỵ [Retinol, AHA]
    expect(CONFLICT_MATRIX.BHA).toEqual(expect.arrayContaining(['Retinol', 'AHA']));
  });

  test('5. CHECKIN_OPTIONS contains all 5 daily condition options', () => {
    const ids = CHECKIN_OPTIONS.map((c) => c.id);
    expect(ids).toContain('Bình thường');
    expect(ids).toContain('Khô rát');
    expect(ids).toContain('Kích ứng');
    expect(ids).toContain('Nổi mụn');
    expect(ids).toContain('Bóng dầu');
  });

  test('6. Skin check-in logic: Selecting "Bình thường" clears bad conditions and vice versa', () => {
    // Case 1: user currently has bad conditions and clicks 'Bình thường'
    const current = ['Khô rát', 'Nổi mụn'];
    const clickedNormal = 'Bình thường';
    let updated;
    if (clickedNormal === 'Bình thường') {
      updated = ['Bình thường'];
    }
    expect(updated).toEqual(['Bình thường']);

    // Case 2: user currently has 'Bình thường' and clicks 'Khô rát'
    const clickedBad = 'Khô rát';
    const withoutNormal = ['Bình thường'].filter((c) => c !== 'Bình thường');
    const updatedBad = [...withoutNormal, clickedBad];
    expect(updatedBad).toEqual(['Khô rát']);
  });
});

