const SKIN_DICTIONARY = {
    Da_Dau: {
        name: 'Da dầu',
        dos: ['Niacinamide', 'Salicylic Acid', 'Clay', 'Zinc PCA', 'Hyaluronic Acid'],
        donts: ['Mineral Oil', 'Shea Butter', 'Coconut Oil', 'Heavy Wax'],
        description: 'Tập trung kiềm dầu, làm thông thoáng lỗ chân lông và cấp nước mỏng nhẹ.',
    },
    Da_Kho: {
        name: 'Da khô',
        dos: ['Ceramide', 'Panthenol', 'Hyaluronic Acid', 'Squalane', 'Glycerin'],
        donts: ['Alcohol Denat', 'BHA', 'Clay mask', 'Sulfates'],
        description: 'Tập trung củng cố màng lipid, phục hồi độ ẩm và khóa ẩm đa tầng.',
    },
    Da_Hon_Hop_Thien_Dau: {
        name: 'Da hỗn hợp thiên dầu',
        dos: ['Niacinamide', 'Panthenol', 'Salicylic Acid', 'Hyaluronic Acid'],
        donts: ['Mineral Oil', 'Alcohol', 'Coconut Oil'],
        description: 'Vùng chữ T tiết nhiều dầu, vùng má bình thường hoặc hơi khô nhẹ.',
    },
    Da_Hon_Hop_Thien_Kho: {
        name: 'Da hỗn hợp thiên khô',
        dos: ['Ceramide', 'Glycerin', 'Hyaluronic Acid', 'Panthenol', 'Squalane'],
        donts: ['BHA nồng độ cao', 'Cồn khô', 'Clay mask đắp toàn mặt lâu'],
        description: 'Vùng chữ T khô thoáng bình thường, vùng má hoặc xung quanh miệng khô rát.',
    },
    Da_Thuong: {
        name: 'Da thường',
        dos: ['Hyaluronic Acid', 'Niacinamide', 'Vitamin C', 'Ceramide'],
        donts: ['Sản phẩm tẩy rửa quá mạnh', 'Hương liệu nhân tạo nồng độ cao'],
        description: 'Làn da cân bằng lý tưởng, độ ẩm ổn định, ít khuyết điểm.',
    },
    Da_Nhay_Cam: {
        name: 'Da nhạy cảm',
        dos: ['Centella Asiatica', 'Panthenol', 'Ceramide', 'Madecassoside'],
        donts: ['AHA', 'BHA mạnh', 'Retinol nồng độ cao', 'Fragrance', 'Essential Oils'],
        description: 'Ưu tiên tối giản hóa, làm dịu và phục hồi hàng rào bảo vệ da.',
    },
};

const CONDITION_DICTIONARY = {
    Binh_Thuong: {
        id: 'Binh_Thuong',
        label: 'Bình thường',
        treatment: ['Hyaluronic Acid', 'Niacinamide', 'Ceramide'],
        taboo: [],
    },
    Kho_Rat: {
        id: 'Kho_Rat',
        label: 'Khô rát',
        treatment: ['Panthenol', 'Ceramide', 'Hyaluronic Acid', 'Centella Asiatica'],
        taboo: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Alcohol Denat'],
    },
    Kich_Ung: {
        id: 'Kich_Ung',
        label: 'Kích ứng',
        treatment: ['Panthenol', 'Ceramide', 'Centella Asiatica', 'Madecassoside'],
        taboo: ['AHA', 'BHA', 'Retinol', 'Vitamin C', 'Fragrance'],
    },
    Noi_Mun: {
        id: 'Noi_Mun',
        label: 'Nổi mụn',
        treatment: ['Salicylic Acid', 'Tea Tree', 'Zinc PCA', 'Azelaic Acid'],
        taboo: ['Mineral Oil', 'Shea Butter', 'Coconut Oil'],
    },
    Bong_Dau: {
        id: 'Bong_Dau',
        label: 'Bóng dầu',
        treatment: ['Niacinamide', 'Zinc PCA', 'Clay', 'Salicylic Acid'],
        taboo: ['Mineral Oil', 'Shea Butter'],
    },
};

const CONFLICT_MATRIX = {
    'AHA': { conflictsWith: ['Retinol', 'BHA', 'Vitamin C'], severity: 'high' },
    'BHA': { conflictsWith: ['Retinol', 'AHA'], severity: 'high' },
    'Retinol': { conflictsWith: ['AHA', 'BHA', 'Vitamin C'], severity: 'high' },
    'Vitamin C': { conflictsWith: ['AHA', 'Retinol', 'Niacinamide'], severity: 'medium' },
};

module.exports = {
    SKIN_DICTIONARY,
    CONDITION_DICTIONARY,
    CONFLICT_MATRIX,
};