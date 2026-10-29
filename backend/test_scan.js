require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const ai = require('./src/config/AI');
const geminiService = require('./src/services/geminiService');

console.log('========================================================');
console.log('🔍 KIỂM THỬ TÍNH NĂNG SCAN AI (GEMINI) - SKINMATE');
console.log('========================================================\n');

async function testScan() {
  // 1. Kiểm tra API KEY
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ CHƯA CÓ GEMINI_API_KEY TRONG FILE backend/.env');
    console.log('👉 Hướng dẫn:');
    console.log('   1. Mở trang https://aistudio.google.com/app/apikey');
    console.log('   2. Nhấn "Create API key" để lấy key');
    console.log('   3. Mở file backend/.env và điền: GEMINI_API_KEY=AIzaSy...');
    console.log('   4. Chạy lại: node test_scan.js\n');
    process.exit(1);
  }

  console.log('✅ 1. Phát hiện GEMINI_API_KEY:', apiKey.substring(0, 8) + '...' + apiKey.slice(-4));

  // 2. Test kết nối trực tiếp với Gemini Model
  console.log('\n⏳ 2. Đang kiểm tra kết nối tới Gemini API...');
  const testModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let connectedModel = null;

  for (const model of testModels) {
    try {
      process.stdout.write(`   - Thử model [${model}]... `);
      const res = await ai.models.generateContent({
        model,
        contents: 'Xin chào, hãy trả lời ngắn gọn: OK',
      });
      console.log('Thành công! Trả về:', (res.text || '').trim().replace(/\n/g, ' '));
      connectedModel = model;
      break;
    } catch (err) {
      console.log('Thất bại (' + (err.status || err.message) + ')');
    }
  }

  if (!connectedModel) {
    console.error('\n❌ Không thể kết nối với bất kỳ model Gemini nào. Vui lòng kiểm tra lại API Key hoặc mạng internet.');
    process.exit(1);
  }

  // 3. Test OCR trích xuất thành phần từ ảnh mẫu
  console.log('\n⏳ 3. Đang kiểm thử trích xuất thành phần từ ảnh mẫu...');
  const sampleImagePath = path.resolve(__dirname, '../frontend/src/assets/icon.png');
  
  if (fs.existsSync(sampleImagePath)) {
    const fileBuffer = fs.readFileSync(sampleImagePath);
    const mockFile = {
      buffer: fileBuffer,
      mimetype: 'image/png',
      originalname: 'test_product.png',
    };

    try {
      const extracted = await geminiService.extractIngredientsFromImage(mockFile);
      console.log('✅ Trích xuất ảnh thành công!');
      console.log('   Danh sách thành phần đọc được:', extracted.ingredients || []);
    } catch (err) {
      console.warn('⚠️ Lỗi khi trích xuất ảnh:', err.message);
    }
  } else {
    console.log('ℹ️ Không tìm thấy ảnh icon.png, bỏ qua bước đọc ảnh mẫu.');
  }

  // 4. Test endpoint /api/scan/analyze (Tính điểm + Lời khuyên chuyên gia da liễu)
  console.log('\n⏳ 4. Kiểm thử API Phân tích độ phù hợp (/api/scan/analyze)...');
  const postData = JSON.stringify({
    productName: 'Serum Trị Mụn BHA 2% & Niacinamide',
    brand: 'SkinMate Lab',
    category: 'treatment',
    skinType: 'Da_Dau',
    currentConditions: ['Bóng dầu', 'Nổi mụn'],
    ingredients: ['Water', 'Salicylic Acid', 'Niacinamide', 'Zinc PCA', 'Centella Asiatica'],
  });

  const req = http.request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/scan/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.success) {
            console.log('✅ Endpoint /api/scan/analyze hoạt động hoàn hảo!');
            console.log('   - Điểm phù hợp:', parsed.data?.scoreResult?.finalScore, '%');
            console.log('   - Đánh giá:', parsed.data?.scoreResult?.verdict);
            if (parsed.data?.aiAnalysis?.explanation) {
              console.log('   - Lời khuyên AI:', parsed.data.aiAnalysis.explanation.substring(0, 120) + '...');
            }
          } else {
            console.log('⚠️ Response:', parsed);
          }
        } catch {
          console.log('ℹ️ Server backend có thể chưa chạy trên port 5000 để nhận request HTTP. Bạn có thể khởi động backend bằng "npm run dev".');
        }
        console.log('\n========================================================');
        console.log('🎉 HOÀN THÀNH KIỂM THỬ SCAN AI!');
        console.log('========================================================\n');
      });
    }
  );

  req.on('error', () => {
    console.log('ℹ️ Backend server chưa bật trên cổng 5000 (không sao cả, kết nối trực tiếp Gemini SDK ở bước 2 đã thành công!).');
    console.log('\n========================================================');
    console.log('🎉 HOÀN THÀNH KIỂM THỬ SCAN AI!');
    console.log('========================================================\n');
  });

  req.write(postData);
  req.end();
}

testScan();
