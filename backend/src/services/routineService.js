const DailyRoutine = require('../models/DailyRoutine');
const TreatmentPlan = require('../models/TreatmentPlan');
const Collection = require('../models/Collection');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  normalizeIngredient,
  analyzeIngredientConflicts,
  analyzeSkinSuitability,
  analyzeConditionSuitability,
} = require('../utils/skinDictionaries');

const EXTERNAL_RECOMMENDATIONS = [
  {
    productName: 'Serum La Roche-Posay Hyalu B5',
    brand: 'La Roche-Posay',
    productType: 'serum',
    productIcon: 'serum',
    category: 'serum',
    ingredients: ['B5', 'Panthenol', 'Hyaluronic Acid'],
    instructions: 'Nhỏ 3-4 giọt lên da sạch, vỗ nhẹ cho tinh chất thẩm thấu sâu, sử dụng 2 lần/ngày.',
    suitableConditions: ['kho_rat', 'kich_ung', 'binh_thuong'],
    stepKey: 'treat',
  },
  {
    productName: 'Kem Dưỡng Bioderma Cicabio Crème',
    brand: 'Bioderma',
    productType: 'cream',
    productIcon: 'tuyp',
    category: 'cream',
    ingredients: ['Centella', 'Zinc PCA', 'Glycerin'],
    instructions: 'Thoa một lượng mỏng lên vùng da khô rát, kích ứng sau bước serum.',
    suitableConditions: ['kho_rat', 'kich_ung'],
    stepKey: 'moisturize',
  },
  {
    productName: 'Kem Dưỡng Illiyoon Ceramide Ato Concentrate Cream',
    brand: 'Illiyoon',
    productType: 'cream',
    productIcon: 'hu',
    category: 'cream',
    ingredients: ['Ceramide', 'Glycerin', 'B5'],
    instructions: 'Lấy lượng bằng đồng xu, xoa ấm trong lòng bàn tay và áp nhẹ lên da để khóa ẩm.',
    suitableConditions: ['kho_rat', 'kich_ung'],
    stepKey: 'moisturize',
  },
  {
    productName: 'Serum Klairs Midnight Blue Youth Activating Drop',
    brand: 'Dear Klairs',
    productType: 'serum',
    productIcon: 'serum',
    category: 'serum',
    ingredients: ['Centella', 'Peptides', 'B5'],
    instructions: 'Dùng vào buổi tối, thoa 3-4 giọt đều khắp mặt để làm dịu da khẩn cấp.',
    suitableConditions: ['kich_ung', 'kho_rat'],
    stepKey: 'treat',
  },
  {
    productName: 'Gel Chấm Mụn Klenzit-C / Megaduo Gel',
    brand: 'Megaduo',
    productType: 'treatment',
    productIcon: 'tuyp_xanh',
    category: 'treatment',
    ingredients: ['Salicylic Acid', 'Azelaic Acid'],
    instructions: 'Chấm một lượng nhỏ trực tiếp lên các nốt mụn viêm sưng.',
    suitableConditions: ['noi_mun'],
    stepKey: 'treat',
  },
  {
    productName: 'Serum The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    productType: 'serum',
    productIcon: 'serum',
    category: 'serum',
    ingredients: ['Niacinamide', 'Zinc PCA'],
    instructions: 'Thoa 2-3 giọt sáng và tối giúp kiểm soát dầu nhờn và ngừa viêm mụn.',
    suitableConditions: ['bong_dau', 'noi_mun'],
    stepKey: 'treat',
  },
];

const PREBUILT_TEMPLATES = [
  {
    title: 'Chuỗi Trị Mụn Chuyên Sâu 14 Ngày',
    description: 'Liệu trình thanh lọc bã nhờn, giải phóng bít tắc và kiểm soát mụn viêm với BHA xen kẽ phục hồi B5/Ceramide.',
    targetSkinTypes: ['Da_Dau', 'Da_Hon_Hop'],
    targetConcerns: ['Trị mụn', 'Kiềm dầu'],
    totalDays: 14,
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Khởi động dịu nhẹ & Làm sạch sâu',
        focus: 'Thanh lọc nhẹ nhàng',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt Simple Refreshing Facial Wash', productIcon: 'tuyp', ingredients: ['B5', 'Glycerin'], instructions: 'Tạo bọt với nước ấm và massage nhẹ nhàng 60s.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Nước hoa hồng Klairs Supple Preparation Toner', productIcon: 'chai_to', ingredients: ['Centella', 'Hyaluronic Acid'], instructions: 'Vỗ nhẹ 2-3 lớp toner lên da.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum Phục Hồi Rau Má Centella Skin1004', productIcon: 'serum', ingredients: ['Centella'], instructions: 'Nhỏ 3 giọt tinh chất và vỗ đều.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Gel Dưỡng Ẩm I\'m From Vitamin Tree Water Gel', productIcon: 'hu', ingredients: ['Niacinamide', 'Glycerin'], instructions: 'Thoa một lượng gel mỏng khóa ẩm.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng La Roche-Posay Anthelios Oil Correct', productIcon: 'tuyp_xanh', ingredients: ['Salicylic Acid', 'Niacinamide', 'Zinc PCA'], instructions: 'Thoa đủ 2 lóng ngón tay trước khi ra ngoài 20 phút.' },
        ],
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Cấp ẩm & Củng cố màng bảo vệ',
        focus: 'Cấp ẩm phục hồi',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt CeraVe Foaming Facial Cleanser', productIcon: 'pum', ingredients: ['Ceramide', 'Niacinamide', 'Hyaluronic Acid'], instructions: 'Rửa mặt nhẹ nhàng với nước ấm.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Toner Dickinson\'s Witch Hazel Cân Bằng Dầu', productIcon: 'chai_to', ingredients: ['Witch Hazel', 'Glycerin'], instructions: 'Thấm ra bông lau nhẹ theo chiều cơ mặt.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum The Ordinary Hyaluronic Acid 2% + B5', productIcon: 'serum', ingredients: ['Hyaluronic Acid', 'B5'], instructions: 'Thoa khi da còn ẩm nhẹ.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Kem Dưỡng Bioderma Sebium Pore Refiner', productIcon: 'tuyp', ingredients: ['Salicylic Acid', 'Silica'], instructions: 'Tập trung vùng chữ T và hai bên cánh mũi.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng Anessa Perfect UV Milk', productIcon: 'tuyp_xanh', ingredients: ['Zinc Oxide', 'Hyaluronic Acid'], instructions: 'Thoa đều và vỗ nhẹ cho thấm.' },
        ],
      },
      {
        dayNumber: 3,
        title: 'Ngày 3: Tẩy tế bào chết hóa học BHA làm sạch sâu',
        focus: 'Điều trị BHA',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt Cosrx Low pH Good Morning Gel', productIcon: 'tuyp', ingredients: ['Tea Tree', 'BHA'], instructions: 'Rửa sạch bụi bẩn và dầu thừa.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Nước cân bằng Klairs Daily Soothing Toner', productIcon: 'chai_to', ingredients: ['Centella', 'B5'], instructions: 'Vỗ nhẹ cân bằng pH nền da.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Dung Dịch Tẩy Tế Bào Chết Paula\'s Choice 2% BHA Liquid', productIcon: 'serum', ingredients: ['BHA', 'Salicylic Acid', 'Green Tea'], instructions: 'Dùng bông hoặc tay thoa một lớp mỏng, đợi 15-20 phút trước khi dùng kem dưỡng.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Kem Dưỡng La Roche-Posay Cicaplast Baume B5+', productIcon: 'tuyp', ingredients: ['B5', 'Centella', 'Zinc'], instructions: 'Thoa một lượng hạt bắp để khóa ẩm và xoa dịu châm chích.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng Skin1004 Madagascar Centella Air-Fit Suncream', productIcon: 'tuyp_xanh', ingredients: ['Centella', 'Niacinamide'], instructions: 'Bảo vệ kỹ càng sau ngày peel BHA.' },
        ],
      },
      {
        dayNumber: 4,
        title: 'Ngày 4: Phục hồi làm dịu sau BHA',
        focus: 'Phục hồi B5 / Ceramide',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt Simple Kind to Skin Refreshing', productIcon: 'tuyp', ingredients: ['B5', 'Glycerin'], instructions: 'Tạo bọt mịn massage 45 giây.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Toner I\'m From Mugwort Ngải Cứu Làm Dịu', productIcon: 'chai_to', ingredients: ['Mugwort', 'Centella'], instructions: 'Thấm toner làm dịu vùng ửng đỏ.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum Phục Hồi Hàng Rào Da Ceramide B5', productIcon: 'serum', ingredients: ['B5', 'Ceramide'], instructions: 'Cấp ẩm và phục hồi nền da.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Kem Dưỡng Illiyoon Ceramide Ato Concentrate Cream', productIcon: 'hu', ingredients: ['Ceramide', 'Glycerin'], instructions: 'Tán đều và massage nhẹ nhàng.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng La Roche-Posay Anthelios Invisible Fluid', productIcon: 'tuyp_xanh', ingredients: ['Vitamin E', 'Glycerin'], instructions: 'Thoa đều chống tia UV.' },
        ],
      },
    ],
  },
  {
    title: 'Chuỗi Phục Hồi Hàng Rào Da 7 Ngày',
    description: 'Chuỗi đặc biệt dành cho nền da nhạy cảm, khô rát, đỏ yếu hoặc sau treatment cần làm dịu khẩn cấp với B5, Ceramide và Centella.',
    targetSkinTypes: ['Da_Nhay_Cam', 'Da_Kho', 'Da_Hon_Hop'],
    targetConcerns: ['Phục hồi', 'Làm dịu kích ứng'],
    totalDays: 7,
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Cấp cứu màng ẩm da',
        focus: 'Làm dịu & Giảm đỏ',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt Cetaphil Gentle Skin Cleanser', productIcon: 'pum', ingredients: ['B5', 'Niacinamide', 'Glycerin'], instructions: 'Không tạo bọt, xoa nhẹ nhàng rửa lại với nước ấm.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Nước hoa hồng Dokdo 1024 Round Lab Dịu Da', productIcon: 'chai_to', ingredients: ['Hyaluronic Acid', 'Glycerin', 'Panthenol'], instructions: 'Vỗ nhẹ tinh chất lên mặt.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum La Roche-Posay Hyalu B5 Làm Dịu Sâu', productIcon: 'serum', ingredients: ['B5', 'Hyaluronic Acid'], instructions: 'Nhỏ 3-4 giọt và xoa ấm hai bàn tay áp lên mặt.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Kem Dưỡng Bioderma Cicabio Crème Phục Hồi', productIcon: 'tuyp', ingredients: ['Centella', 'Zinc PCA', 'Glycerin'], instructions: 'Bôi lớp mỏng làm màng chắn bảo vệ da.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng Cell Fusion C Laser Sunscreen 100', productIcon: 'tuyp_xanh', ingredients: ['Ceramide', 'Zinc Oxide', 'Peptides'], instructions: 'Thoa đều trước khi ra ngoài.' },
        ],
      },
      {
        dayNumber: 2,
        title: 'Ngày 2: Tái thiết lập biểu bì ẩm',
        focus: 'Tái tạo Ceramide',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt Simple Kind to Skin Refreshing', productIcon: 'tuyp', ingredients: ['B5', 'Glycerin'], instructions: 'Rửa êm dịu không gây khô căng.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Nước hoa hồng Klairs Supple Preparation Unscented', productIcon: 'chai_to', ingredients: ['Centella', 'B5'], instructions: 'Thoa 2 lớp đều toàn mặt.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum Rau Má Skin1004 Madagascar Centella Ampoule', productIcon: 'serum', ingredients: ['Centella'], instructions: 'Làm dịu ngay tình trạng khô rát và ửng đỏ.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Kem Dưỡng Illiyoon Ceramide Ato Concentrate Cream', productIcon: 'hu', ingredients: ['Ceramide', 'Glycerin'], instructions: 'Khóa chặt màng ẩm với vi hạt Ceramide.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng Skin1004 Madagascar Centella Sun Serum', productIcon: 'tuyp_xanh', ingredients: ['Centella', 'Hyaluronic Acid'], instructions: 'Cấp ẩm và bảo vệ phổ rộng.' },
        ],
      },
    ],
  },
  {
    title: 'Chuỗi Kiềm Dầu & Thu Nhỏ Lỗ Chân Lông 10 Ngày',
    description: 'Điều tiết bã nhờn, làm sạch sâu sợi bã nhờn vùng mũi má và thu nhỏ lỗ chân lông với Niacinamide, BHA và Đất Sét.',
    targetSkinTypes: ['Da_Dau', 'Da_Hon_Hop'],
    targetConcerns: ['Kiềm dầu', 'Lỗ chân lông'],
    totalDays: 10,
    days: [
      {
        dayNumber: 1,
        title: 'Ngày 1: Kiểm soát dầu nhờn & Cân bằng',
        focus: 'Cân bằng dầu nước',
        steps: [
          { stepNumber: 1, stepKey: 'cleanse', stepName: 'BƯỚC 1 - LÀM SẠCH', productName: 'Sữa rửa mặt SVR Sebiaclear Gel Moussant', productIcon: 'pum', ingredients: ['Niacinamide', 'Zinc PCA'], instructions: 'Tạo bọt kỹ và massage vùng chữ T.' },
          { stepNumber: 2, stepKey: 'tone', stepName: 'BƯỚC 2 - CÂN BẰNG', productName: 'Toner Dickinson\'s Witch Hazel Kiềm Dầu', productIcon: 'chai_to', ingredients: ['Witch Hazel'], instructions: 'Lau nhẹ nhàng với bông tẩy trang.' },
          { stepNumber: 3, stepKey: 'treat', stepName: 'BƯỚC 3 - ĐẶC TRỊ', productName: 'Serum The Ordinary Niacinamide 10% + Zinc 1%', productIcon: 'serum', ingredients: ['Niacinamide', 'Zinc PCA'], instructions: 'Dùng 3 giọt vỗ đều khắp mặt.' },
          { stepNumber: 4, stepKey: 'moisturize', stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI', productName: 'Gel Dưỡng Ẩm Neutrogena Hydro Boost Water Gel', productIcon: 'hu', ingredients: ['Hyaluronic Acid', 'Glycerin'], instructions: 'Thoa lớp mỏng nhẹ không bết dính.' },
          { stepNumber: 5, stepKey: 'protect', stepName: 'BƯỚC 5 - BẢO VỆ', productName: 'Kem chống nắng La Roche-Posay Anthelios Anti-Shine', productIcon: 'tuyp_xanh', ingredients: ['Airlicium', 'Zinc PCA'], instructions: 'Kiềm dầu khô ráo suốt ngày dài.' },
        ],
      },
    ],
  },
];

const DEFAULT_FIVE_STEPS = [
  {
    stepNumber: 1,
    stepKey: 'cleanse',
    stepName: 'BƯỚC 1 - LÀM SẠCH',
    productName: 'Sữa rửa mặt Simple Refreshing Facial Wash',
    productIcon: 'tuyp',
    ingredients: ['B5', 'Glycerin'],
    instructions: 'Lấy lượng vừa đủ bằng hạt đậu, tạo bọt nhẹ và massage đều 60 giây rồi rửa sạch bằng nước ấm.',
    dynamicReason: 'Làm sạch dịu nhẹ bề mặt da, giữ vững độ ẩm tự nhiên.',
    isExternalRecommendation: false,
    brand: 'Simple',
  },
  {
    stepNumber: 2,
    stepKey: 'tone',
    stepName: 'BƯỚC 2 - CÂN BẰNG',
    productName: 'Nước hoa hồng Klairs Supple Preparation Toner',
    productIcon: 'chai_to',
    ingredients: ['Centella', 'Hyaluronic Acid', 'B5'],
    instructions: 'Vỗ nhẹ 2-3 giọt lên lòng bàn tay và áp đều lên khắp mặt để cân bằng độ pH.',
    dynamicReason: 'Cân bằng độ ẩm và mở đường cho các bước dưỡng tiếp theo.',
    isExternalRecommendation: false,
    brand: 'Dear Klairs',
  },
  {
    stepNumber: 3,
    stepKey: 'treat',
    stepName: 'BƯỚC 3 - ĐẶC TRỊ',
    productName: 'Serum The Ordinary Niacinamide 10% + Zinc 1%',
    productIcon: 'serum',
    ingredients: ['Niacinamide', 'Zinc PCA'],
    instructions: 'Nhỏ 3 giọt lên trán và 2 bên má, vỗ nhẹ cho tinh chất thẩm thấu.',
    dynamicReason: 'Hỗ trợ kiểm soát dầu nhờn và củng cố hàng rào bảo vệ da.',
    isExternalRecommendation: false,
    brand: 'The Ordinary',
  },
  {
    stepNumber: 4,
    stepKey: 'moisturize',
    stepName: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI',
    productName: 'Kem dưỡng ẩm Illiyoon Ceramide Ato Concentrate Cream',
    productIcon: 'hu',
    ingredients: ['Ceramide', 'Glycerin'],
    instructions: 'Lấy một lượng nhỏ thoa đều toàn mặt để khóa ẩm.',
    dynamicReason: 'Khóa ẩm và tái tạo hàng rào biểu bì cho làn da mềm mịn.',
    isExternalRecommendation: false,
    brand: 'Illiyoon',
  },
  {
    stepNumber: 5,
    stepKey: 'protect',
    stepName: 'BƯỚC 5 - BẢO VỆ',
    productName: 'Kem chống nắng La Roche-Posay Anthelios Invisible Fluid',
    productIcon: 'tuyp_xanh',
    ingredients: ['Vitamin E', 'Glycerin'],
    instructions: 'Bắt buộc cho chu trình buổi sáng. Thoa trước khi ra ngoài 20 phút.',
    dynamicReason: 'Bảo vệ da tối đa trước tác hại của tia UVA/UVB.',
    isExternalRecommendation: false,
    brand: 'La Roche-Posay',
  },
];

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Filter closet products, strictly EXCLUDING expired products
 * (status === 'expired' OR expirationDate < now, even if continueAfterExpiry is true)
 */
async function getUsableCollectionProducts(userId) {
  const now = new Date();
  const closet = await Collection.find({ userId }).lean();

  return closet.filter(p => {
    if (p.status === 'expired' || p.status === 'finished') return false;
    const exp = p.expirationDate || p.manufacturerExpirationDate;
    if (exp && new Date(exp) < now) {
      // Per spec: exclude products marked expired even if user continues to use them
      return false;
    }
    return true;
  });
}

/**
 * Find replacement product from closet or external recommendations
 */
function findReplacementProduct(usableCloset, therapyIngredients, category = 'treatment') {
  // Normalize therapy list
  const normalizedTherapy = therapyIngredients.map(normalizeIngredient).filter(Boolean);

  // Search closet first
  for (const item of usableCloset) {
    const itemIngs = (item.ingredients || []).map(normalizeIngredient).filter(Boolean);
    const matches = itemIngs.some(i => normalizedTherapy.includes(i));
    if (matches) {
      return {
        product: item,
        fromCloset: true,
        matchingIngredient: itemIngs.find(i => normalizedTherapy.includes(i)),
      };
    }
  }

  // If not found in closet, search external recommendations
  const external = EXTERNAL_RECOMMENDATIONS.find(item => {
    const norm = item.ingredients.map(normalizeIngredient).filter(Boolean);
    return norm.some(i => normalizedTherapy.includes(i));
  }) || EXTERNAL_RECOMMENDATIONS[0];

  return {
    product: external,
    fromCloset: false,
    matchingIngredient: external.ingredients[0],
  };
}

/**
 * Build dynamic reason for step
 */
function generateDynamicReason(stepKey, productName, ingredients = [], conditions = [], userSkinType = null) {
  const conditionLabels = {
    kho_rat: 'Khô Rát',
    kich_ung: 'Kích Ứng',
    noi_mun: 'Nổi Mụn',
    bong_dau: 'Bóng Dầu',
    binh_thuong: 'Bình Thường',
  };

  const normIngs = ingredients.map(normalizeIngredient).filter(Boolean);
  const activeConditionKeys = conditions.map(c => c.toLowerCase());

  if (activeConditionKeys.includes('kho_rat')) {
    if (normIngs.includes('B5') || normIngs.includes('Panthenol')) {
      return `${productName} có hoạt chất Pro-Vitamin B5 sẽ giúp làm dịu nền da đang Khô Rát của bạn.`;
    }
    if (normIngs.includes('Ceramide')) {
      return `${productName} giàu Ceramide giúp phục hồi và củng cố hàng rào ẩm cho làn da đang Khô Rát.`;
    }
    if (normIngs.includes('Hyaluronic Acid')) {
      return `${productName} chứa Hyaluronic Acid cấp ẩm sâu, xoa dịu cảm giác khô rát khó chịu trên da.`;
    }
  }

  if (activeConditionKeys.includes('kich_ung')) {
    if (normIngs.includes('Centella') || normIngs.includes('B5')) {
      return `${productName} chiết xuất rau má/B5 giúp làm dịu tức thì tình trạng Kích Ứng và giảm ửng đỏ.`;
    }
    if (normIngs.includes('Ceramide')) {
      return `${productName} bổ sung Ceramide phục hồi màng bảo vệ da đang bị tổn thương do Kích Ứng.`;
    }
  }

  if (activeConditionKeys.includes('noi_mun')) {
    if (normIngs.includes('Salicylic Acid') || normIngs.includes('BHA')) {
      return `${productName} chứa Salicylic Acid hỗ trợ làm sạch sâu bã nhờn và giảm viêm cho vùng da đang Nổi Mụn.`;
    }
    if (normIngs.includes('Tea Tree')) {
      return `${productName} tinh chất tràm trà kháng khuẩn tự nhiên, làm dịu các nốt mụn viêm sưng.`;
    }
  }

  if (activeConditionKeys.includes('bong_dau')) {
    if (normIngs.includes('Niacinamide') || normIngs.includes('Zinc PCA')) {
      return `${productName} chứa Niacinamide & Zinc giúp điều tiết bã nhờn, hạn chế tình trạng Bóng Dầu.`;
    }
  }

  // Step-specific default fallbacks
  switch (stepKey) {
    case 'cleanse':
      return `${productName} làm sạch nhẹ nhàng, loại bỏ dầu thừa mà không làm mất đi độ ẩm tự nhiên của da.`;
    case 'tone':
      return `${productName} cân bằng độ pH tối ưu và chuẩn bị làn da sẵn sàng hấp thụ các dưỡng chất kế tiếp.`;
    case 'treat':
      return `${productName} cung cấp tinh chất chuyên sâu phù hợp nhất với trạng thái da hôm nay của bạn.`;
    case 'moisturize':
      return `${productName} khóa ẩm biểu bì, duy trì làn da ẩm mượt căng bóng suốt ngày dài.`;
    case 'protect':
      return `${productName} màng lọc chống nắng tiên tiến bảo vệ da toàn diện trước tia cực tím UVA/UVB.`;
    default:
      return `${productName} chăm sóc dịu nhẹ và phục hồi vẻ rạng rỡ cho làn da.`;
  }
}

/**
 * 1. Get Today's Daily Routine for User
 */
async function getTodayDailyRoutine(userId) {
  const today = getTodayString();
  let routine = await DailyRoutine.findOne({ userId, date: today });

  if (!routine) {
    // Check if user has an active treatment plan
    const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
    const user = await User.findById(userId).lean();
    const skinType = user?.skinProfile?.skinType || 'Da_Dau';

    if (activePlan) {
      // Find current day in plan
      const currentDayNumber = activePlan.currentDay || 1;
      const scheduledDay = activePlan.days.find(d => d.dayNumber === currentDayNumber) || activePlan.days[0];

      const steps = (scheduledDay?.steps || []).map(s => ({
        stepNumber: s.stepNumber,
        stepKey: s.stepKey,
        stepName: s.stepName,
        productId: s.productId,
        productName: s.productName,
        productIcon: s.productIcon || 'serum',
        ingredients: s.ingredients || [],
        instructions: s.instructions || '',
        dynamicReason: generateDynamicReason(s.stepKey, s.productName, s.ingredients, [], skinType),
        isExternalRecommendation: false,
        brand: s.brand || '',
      }));

      routine = await DailyRoutine.create({
        userId,
        date: today,
        planId: activePlan._id,
        planTitle: activePlan.title,
        dayNumber: currentDayNumber,
        isOverridden: false,
        overrideReason: null,
        steps,
        completed: false,
      });
    } else {
      // No active plan yet - Return null or empty structure so View daily routine shows 'Gợi ý chu trình skincare phù hợp'
      return null;
    }
  }

  return routine;
}

/**
 * 2. Check-in Skin Condition & Update Daily Routine
 * Core business algorithm:
 * - Reads today's check-in
 * - If user is on an active plan:
 *   - Compares scheduled day products with today's conditions
 *   - If scheduled day has BHA/AHA/Retinol and user checks in "Khô rát" or "Kích ứng":
 *     - Override step 3 with B5 / Ceramide / Centella
 *     - Defer/shift future routine schedule by 1 day
 *     - Pulls from usable My Collection, or calls external recommendation if missing
 */
async function checkInSkin(userId, { conditions = [] }) {
  const today = getTodayString();
  const user = await User.findById(userId).lean();
  const skinType = user?.skinProfile?.skinType || 'Da_Dau';

  // Normalize conditions
  // "Bình thường" clears all others; selecting others clears "Bình thường"
  let sanitizedConditions = Array.isArray(conditions) ? conditions : [];
  if (sanitizedConditions.includes('binh_thuong') && sanitizedConditions.length > 1) {
    sanitizedConditions = ['binh_thuong'];
  }

  // Get or initialize active plan
  let activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });

  // Get usable closet products (excluding expired items)
  const usableCloset = await getUsableCollectionProducts(userId);

  // Look for existing routine record for today
  let routine = await DailyRoutine.findOne({ userId, date: today });

  let baseSteps = [];
  let dayNumber = 1;
  let planId = null;
  let planTitle = null;

  if (activePlan) {
    planId = activePlan._id;
    planTitle = activePlan.title;
    dayNumber = activePlan.currentDay || 1;
    const planDay = activePlan.days.find(d => d.dayNumber === dayNumber) || activePlan.days[0];
    if (planDay && planDay.steps?.length > 0) {
      baseSteps = planDay.steps.map(s => ({
        stepNumber: s.stepNumber,
        stepKey: s.stepKey,
        stepName: s.stepName,
        productId: s.productId,
        productName: s.productName,
        productIcon: s.productIcon || 'serum',
        ingredients: s.ingredients || [],
        instructions: s.instructions || '',
        dynamicReason: '',
        isExternalRecommendation: false,
        brand: s.brand || '',
      }));
    }
  }

  // If no active plan, use default healthy 5-step draft
  if (baseSteps.length === 0) {
    baseSteps = JSON.parse(JSON.stringify(DEFAULT_FIVE_STEPS));
  }

  // Ensure all 5 steps exist
  const finalSteps = [1, 2, 3, 4, 5].map(stepNum => {
    const existing = baseSteps.find(s => s.stepNumber === stepNum);
    if (existing) return { ...existing };
    return { ...DEFAULT_FIVE_STEPS[stepNum - 1] };
  });

  let isOverridden = false;
  let overrideReason = null;

  const isDryOrIrritated = sanitizedConditions.some(c => ['kho_rat', 'kich_ung'].includes(c.toLowerCase()));
  const isAcne = sanitizedConditions.includes('noi_mun');
  const isOily = sanitizedConditions.includes('bong_dau');

  // Check Step 3 (Treat / Đặc trị)
  const treatStep = finalSteps.find(s => s.stepNumber === 3 || s.stepKey === 'treat');
  if (treatStep) {
    const treatIngs = (treatStep.ingredients || []).map(normalizeIngredient).filter(Boolean);
    const hasExfoliatingAcidOrRetinol = treatIngs.some(i => ['BHA', 'AHA', 'Retinol', 'Salicylic Acid'].includes(i));

    if (isDryOrIrritated && hasExfoliatingAcidOrRetinol) {
      // TRIGGER OVERRIDE:
      // Replace with B5 / Ceramide / Centella
      isOverridden = true;
      const conditionName = sanitizedConditions.includes('kich_ung') ? 'Kích ứng' : 'Khô rát';
      const replacement = findReplacementProduct(usableCloset, ['B5', 'Ceramide', 'Centella'], 'treat');

      overrideReason = `Do da bạn hôm nay đang ${conditionName}, hệ thống đã tự động thay thế ${treatStep.productName} (chứa acid treatment) bằng sản phẩm phục hồi ${replacement.product.productName} và lùi toàn bộ lịch trình chuỗi routine 1 ngày để bảo vệ màng da.`;

      treatStep.productName = replacement.product.productName;
      treatStep.productId = replacement.fromCloset ? replacement.product._id : null;
      treatStep.productIcon = replacement.product.productIcon || 'serum';
      treatStep.ingredients = replacement.product.ingredients || ['B5', 'Ceramide'];
      treatStep.instructions = replacement.product.instructions || 'Thoa nhẹ nhàng và vỗ đều khắp mặt.';
      treatStep.isExternalRecommendation = !replacement.fromCloset;
      treatStep.brand = replacement.product.brand || (replacement.fromCloset ? replacement.product.productName : 'SkinMate Recommendation');
      treatStep.dynamicReason = `${treatStep.productName} có hoạt chất ${replacement.matchingIngredient || 'Pro-Vitamin B5'} sẽ giúp làm dịu và phục hồi nền da đang ${conditionName} của bạn.`;

      // Defer treatment plan by 1 day if active plan exists
      if (activePlan) {
        // Record override in plan history
        activePlan.historyOverrides.push({
          date: today,
          dayNumber,
          reason: overrideReason,
          conditions: sanitizedConditions,
        });
        // We do NOT increment currentDay today, so the original Day routine is postponed to tomorrow!
        await activePlan.save();
      }
    } else if (isAcne && !treatIngs.some(i => ['Salicylic Acid', 'Tea Tree', 'Benzoyl Peroxide'].includes(i))) {
      // Suggest acne therapy
      const replacement = findReplacementProduct(usableCloset, ['Salicylic Acid', 'Tea Tree', 'Benzoyl Peroxide'], 'treat');
      if (replacement) {
        treatStep.dynamicReason = `${treatStep.productName} hỗ trợ giảm viêm sưng cho làn da đang Nổi Mụn hôm nay.`;
      }
    }
  }

  // Re-generate dynamic reasons for all 5 steps based on today's check-in
  finalSteps.forEach(step => {
    if (!step.dynamicReason || !step.dynamicReason.includes('Khô Rát') && !step.dynamicReason.includes('Kích Ứng')) {
      step.dynamicReason = generateDynamicReason(step.stepKey, step.productName, step.ingredients, sanitizedConditions, skinType);
    }
  });

  if (!routine) {
    routine = await DailyRoutine.create({
      userId,
      date: today,
      checkIn: {
        status: sanitizedConditions,
        updatedAt: new Date(),
      },
      planId,
      planTitle,
      dayNumber,
      isOverridden,
      overrideReason,
      steps: finalSteps,
      completed: false,
    });
  } else {
    routine.checkIn = {
      status: sanitizedConditions,
      updatedAt: new Date(),
    };
    routine.isOverridden = isOverridden;
    routine.overrideReason = overrideReason;
    routine.steps = finalSteps;
    await routine.save();
  }

  return routine;
}

/**
 * 3. Undo Check-in (within 10s toast window)
 */
async function undoCheckIn(userId) {
  const today = getTodayString();
  const routine = await DailyRoutine.findOne({ userId, date: today });
  if (!routine) return null;

  // Restore previous state / reset checkIn to empty or normal
  routine.checkIn = {
    status: [],
    updatedAt: new Date(),
  };
  routine.isOverridden = false;
  routine.overrideReason = null;

  // If active plan, restore scheduled day steps
  const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
  if (activePlan) {
    const dayNumber = activePlan.currentDay || 1;
    const planDay = activePlan.days.find(d => d.dayNumber === dayNumber) || activePlan.days[0];
    if (planDay && planDay.steps?.length > 0) {
      routine.steps = planDay.steps.map(s => ({
        stepNumber: s.stepNumber,
        stepKey: s.stepKey,
        stepName: s.stepName,
        productId: s.productId,
        productName: s.productName,
        productIcon: s.productIcon || 'serum',
        ingredients: s.ingredients || [],
        instructions: s.instructions || '',
        dynamicReason: generateDynamicReason(s.stepKey, s.productName, s.ingredients, []),
        isExternalRecommendation: false,
        brand: s.brand || '',
      }));
    }
  }

  await routine.save();
  return routine;
}

/**
 * 4. Get Active Treatment Plan
 */
async function getActiveTreatmentPlan(userId) {
  return TreatmentPlan.findOne({ userId, status: 'active' }).populate('days.steps.productId');
}

/**
 * 5. Get Suggested Treatment Plans (Templates)
 */
async function getSuggestedTreatmentPlans(userId) {
  // Check if templates exist in DB, if not seed them
  let templates = await TreatmentPlan.find({ isTemplate: true });
  if (templates.length === 0) {
    templates = await TreatmentPlan.insertMany(
      PREBUILT_TEMPLATES.map(t => ({
        ...t,
        isTemplate: true,
        status: 'template',
        userId: null,
      }))
    );
  }
  return templates;
}

/**
 * 6. Activate a Treatment Plan for User
 */
async function activateTreatmentPlan(userId, planId) {
  const template = await TreatmentPlan.findById(planId);
  if (!template) throw new AppError('Chuỗi routine không tồn tại.', 404);

  // Deactivate any currently active plan
  await TreatmentPlan.updateMany({ userId, status: 'active' }, { status: 'paused' });

  // Clone or activate
  let userPlan;
  if (template.isTemplate) {
    userPlan = await TreatmentPlan.create({
      userId,
      isTemplate: false,
      title: template.title,
      description: template.description,
      targetSkinTypes: template.targetSkinTypes,
      targetConcerns: template.targetConcerns,
      totalDays: template.totalDays,
      currentDay: 1,
      status: 'active',
      startDate: new Date(),
      days: template.days,
    });
  } else {
    template.status = 'active';
    await template.save();
    userPlan = template;
  }

  // Update today's routine to match Day 1
  const today = getTodayString();
  const day1 = userPlan.days.find(d => d.dayNumber === 1) || userPlan.days[0];
  const steps = (day1?.steps || []).map(s => ({
    stepNumber: s.stepNumber,
    stepKey: s.stepKey,
    stepName: s.stepName,
    productId: s.productId,
    productName: s.productName,
    productIcon: s.productIcon || 'serum',
    ingredients: s.ingredients || [],
    instructions: s.instructions || '',
    dynamicReason: generateDynamicReason(s.stepKey, s.productName, s.ingredients, []),
    isExternalRecommendation: false,
    brand: s.brand || '',
  }));

  await DailyRoutine.findOneAndUpdate(
    { userId, date: today },
    {
      userId,
      date: today,
      planId: userPlan._id,
      planTitle: userPlan.title,
      dayNumber: 1,
      isOverridden: false,
      steps,
    },
    { upsert: true, new: true }
  );

  return userPlan;
}

/**
 * 7. Check Conflicts before adding/editing product into routine
 */
async function checkConflict({ dayNumber, newProduct, existingProductIds = [], planId, userId }) {
  const user = await User.findById(userId).lean();
  const skinType = user?.skinProfile?.skinType || 'Da_Dau';

  let existingIngredients = [];

  if (planId && dayNumber) {
    const plan = await TreatmentPlan.findById(planId);
    if (plan) {
      const day = plan.days.find(d => d.dayNumber === Number(dayNumber));
      if (day) {
        day.steps.forEach(s => {
          if (s.ingredients && Array.isArray(s.ingredients)) {
            existingIngredients.push(...s.ingredients);
          }
        });
      }
    }
  }

  // Also collect ingredients from existingProductIds if passed
  if (existingProductIds.length > 0) {
    const products = await Collection.find({ _id: { $in: existingProductIds } });
    products.forEach(p => {
      if (p.ingredients) existingIngredients.push(...p.ingredients);
    });
  }

  const incomingIngredients = newProduct?.ingredients || [];

  // Analyze active conflicts
  const conflictResult = analyzeIngredientConflicts(existingIngredients, incomingIngredients);
  // Analyze skin suitability
  const skinSuitability = analyzeSkinSuitability(skinType, incomingIngredients);

  return {
    hasConflict: conflictResult.hasConflict || skinSuitability.warnings.length > 0,
    conflicts: conflictResult.conflicts,
    suitabilityWarnings: skinSuitability.warnings,
    skinType: skinSuitability.skinTypeLabel,
  };
}

/**
 * 8. Add or Edit Product in Treatment Plan Day
 */
async function updateTreatmentPlanProduct(userId, planId, { dayNumber, stepNumber, productId, customProduct }) {
  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw new AppError('Không tìm thấy chuỗi routine.', 404);

  let targetDay = plan.days.find(d => d.dayNumber === Number(dayNumber));
  if (!targetDay) {
    throw new AppError(`Không tìm thấy Ngày ${dayNumber} trong chuỗi.`, 404);
  }

  let productInfo = {};
  if (productId) {
    const product = await Collection.findOne({ _id: productId, userId });
    if (!product) throw new AppError('Sản phẩm không có trong tủ đồ của bạn.', 404);
    productInfo = {
      productId: product._id,
      productName: product.productName,
      productIcon: product.productIcon || 'serum',
      category: product.productType,
      ingredients: product.ingredients || [],
      instructions: product.note || 'Sử dụng đều đặn theo hướng dẫn.',
    };
  } else if (customProduct) {
    productInfo = {
      productId: null,
      productName: customProduct.productName,
      productIcon: customProduct.productIcon || 'serum',
      category: customProduct.category || 'treatment',
      ingredients: customProduct.ingredients || [],
      instructions: customProduct.instructions || '',
    };
  }

  const existingStepIndex = targetDay.steps.findIndex(s => s.stepNumber === Number(stepNumber));
  const stepKeyMap = { 1: 'cleanse', 2: 'tone', 3: 'treat', 4: 'moisturize', 5: 'protect' };
  const stepNameMap = {
    1: 'BƯỚC 1 - LÀM SẠCH',
    2: 'BƯỚC 2 - CÂN BẰNG',
    3: 'BƯỚC 3 - ĐẶC TRỊ',
    4: 'BƯỚC 4 - DƯỠNG / PHỤC HỒI',
    5: 'BƯỚC 5 - BẢO VỆ',
  };

  const newStep = {
    stepNumber: Number(stepNumber),
    stepKey: stepKeyMap[stepNumber] || 'treat',
    stepName: stepNameMap[stepNumber] || `BƯỚC ${stepNumber}`,
    category: productInfo.category || 'treatment',
    productId: productInfo.productId,
    productName: productInfo.productName,
    productIcon: productInfo.productIcon,
    ingredients: productInfo.ingredients,
    instructions: productInfo.instructions,
  };

  if (existingStepIndex >= 0) {
    targetDay.steps[existingStepIndex] = newStep;
  } else {
    targetDay.steps.push(newStep);
    targetDay.steps.sort((a, b) => a.stepNumber - b.stepNumber);
  }

  await plan.save();
  return plan;
}

/**
 * 9. Add a Brand New Day to Treatment Plan
 */
async function addDayToTreatmentPlan(userId, planId, dayData) {
  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw new AppError('Không tìm thấy chuỗi routine.', 404);

  const nextDayNumber = plan.days.length > 0
    ? Math.max(...plan.days.map(d => d.dayNumber)) + 1
    : 1;

  const newDay = {
    dayNumber: nextDayNumber,
    title: dayData.title || `Ngày ${nextDayNumber}: Chăm sóc bổ sung`,
    focus: dayData.focus || 'Chăm sóc toàn diện',
    steps: dayData.steps || [],
  };

  plan.days.push(newDay);
  plan.totalDays = Math.max(plan.totalDays, nextDayNumber);
  await plan.save();

  return plan;
}

module.exports = {
  getTodayDailyRoutine,
  checkInSkin,
  undoCheckIn,
  getActiveTreatmentPlan,
  getSuggestedTreatmentPlans,
  activateTreatmentPlan,
  checkConflict,
  updateTreatmentPlanProduct,
  addDayToTreatmentPlan,
  getUsableCollectionProducts,
  findReplacementProduct,
  EXTERNAL_RECOMMENDATIONS,
  PREBUILT_TEMPLATES,
};

