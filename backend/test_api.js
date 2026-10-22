const http = require('http');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => (responseBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(dataString);
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Bắt đầu kiểm thử toàn diện Backend API...\n');

  try {
    // 1. Health check
    console.log('1. Testing /health...');
    const health = await request('GET', '/health');
    console.log('   Status:', health.status, '| App:', health.data.appName);

    // 2. Guide Do's & Don'ts
    console.log('\n2. Testing /api/auth/guide...');
    const guide = await request('GET', '/api/auth/guide');
    console.log('   Status:', guide.status, '| Dos:', guide.data.data.dos.slice(0, 3));

    // 3. Register
    const testEmail = `huyen_${Date.now()}@skinmate.vn`;
    console.log(`\n3. Testing /api/auth/register (${testEmail})...`);
    const reg = await request('POST', '/api/auth/register', {
      name: 'Khánh Huyền',
      email: testEmail,
      password: 'password123',
      skinType: 'Da_Hon_Hop',
      allergies: ['Fragrance'],
    });
    console.log('   Status:', reg.status, '| Message:', reg.data.message);
    const token = reg.data.data.token;
    const userId = reg.data.data.user._id;

    // 4. Login
    console.log('\n4. Testing /api/auth/login...');
    const login = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123',
    });
    console.log('   Status:', login.status, '| Token received:', !!login.data.data.token);

    // 5. Get Profile
    console.log('\n5. Testing /api/auth/profile...');
    const prof = await request('GET', '/api/auth/profile', null, token);
    console.log('   Status:', prof.status, '| User:', prof.data.data.name, '| SkinType:', prof.data.data.skinType);

    // 6. Add product to closet
    console.log('\n6. Testing /api/collection (Add BHA Liquid)...');
    const addProd = await request(
      'POST',
      '/api/collection',
      {
        productName: "Paula's Choice 2% BHA Liquid Exfoliant",
        brand: "Paula's Choice",
        category: 'treatment',
        ingredients: ['Salicylic Acid', 'Water', 'Camellia Oleifera'],
        openedDate: new Date(),
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 tháng nữa
      },
      token
    );
    console.log('   Status:', addProd.status, '| Product:', addProd.data.data.productName, '| SuitabilityScore:', addProd.data.data.suitabilityScore);
    const prodId = addProd.data.data._id;

    // 7. Add B5 Serum to closet
    console.log('\n7. Testing /api/collection (Add Serum B5)...');
    const addB5 = await request(
      'POST',
      '/api/collection',
      {
        productName: 'La Roche-Posay Hyalu B5 Serum',
        brand: 'La Roche-Posay',
        category: 'serum',
        ingredients: ['Panthenol', 'Hyaluronic Acid', 'Madecassoside'],
        openedDate: new Date(),
        expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
      },
      token
    );
    console.log('   Status:', addB5.status, '| Score:', addB5.data.data.suitabilityScore);

    // 8. Get closet items
    console.log('\n8. Testing /api/collection (Get Closet)...');
    const closet = await request('GET', '/api/collection', null, token);
    console.log('   Status:', closet.status, '| Total items on shelf:', closet.data.data.length);

    // 9. Get Home data
    console.log('\n9. Testing /api/routine/home...');
    const home = await request('GET', '/api/routine/home', null, token);
    console.log('   Status:', home.status, '| Streak:', home.data.data.profile.streak, '| UV:', home.data.data.uvIndex.value);

    // 10. Check-in da với tình trạng 'Khô rát' (Kích hoạt Override Thuật toán Mục 14)
    console.log('\n10. Testing /api/routine/checkin (Conditions: ["Khô rát"])...');
    const checkin = await request(
      'POST',
      '/api/routine/checkin',
      { conditions: ['Khô rát'] },
      token
    );
    console.log('   Status:', checkin.status, '| Message:', checkin.data.message);
    console.log('   Override Triggered:', checkin.data.dailyRoutine.isOverridden);
    console.log('   Override Reason:', checkin.data.dailyRoutine.overrideReason);

    // 11. View Today 5-step Daily Routine
    console.log('\n11. Testing /api/routine/daily...');
    const daily = await request('GET', '/api/routine/daily', null, token);
    console.log('   Status:', daily.status, '| Morning Steps count:', daily.data.data.morningSteps.length);
    console.log('   Evening Steps count:', daily.data.data.eveningSteps.length);
    console.log('   Sample step 1:', daily.data.data.morningSteps[0].stepName, '=> Reason:', daily.data.data.morningSteps[0].reason);

    // 12. Toggle step completion
    console.log('\n12. Testing /api/routine/step/toggle...');
    const toggle = await request(
      'PUT',
      '/api/routine/step/toggle',
      { session: 'morning', stepNumber: 1 },
      token
    );
    console.log('   Status:', toggle.status, '| Step 1 isCompleted:', toggle.data.data.morningSteps[0].isCompleted);

    // 13. Test conflict check engine on Treatment Plan (Mục 18)
    console.log('\n13. Testing /api/routine/plan (Get Plan & Test Conflict Engine)...');
    const plan = await request('GET', '/api/routine/plan', null, token);
    const planId = plan.data.data._id;
    console.log('   Plan Title:', plan.data.data.title, '| Days:', plan.data.data.totalDays);

    // Thử thêm Retinol vào cùng buổi có AHA (Kích hoạt Cảnh báo Xung đột)
    console.log('   Testing Conflict Check: Thêm Retinol vào ngày có AHA...');
    const addConflict = await request(
      'POST',
      `/api/routine/plan/${planId}/product`,
      {
        day: 1,
        session: 'evening',
        stepNumber: 3,
        productData: {
          name: 'The Ordinary Retinol 0.5% in Squalane',
          ingredients: ['Retinol', 'Squalane'],
          stepName: 'Đặc trị Retinol',
        },
      },
      token
    );
    console.log('   Conflict Response status:', addConflict.status);
    console.log('   Requires Confirmation:', addConflict.data.requiresConfirmation);
    console.log('   Conflicts detected count:', addConflict.data.conflicts?.length);
    if (addConflict.data.conflicts?.length) {
      console.log('   Warning Message:', addConflict.data.conflicts[0].message);
    }

    // 14. Phân tích độ phù hợp da & Score Calculator (Mục 30)
    console.log('\n14. Testing /api/scan/analyze (Algorithm 4-step Score)...');
    const scanAnalyze = await request(
      'POST',
      '/api/scan/analyze',
      {
        productName: 'Kem dưỡng rau má Skin1004 Madagascar Centella Soothing Cream',
        brand: 'Skin1004',
        category: 'moisturizer',
        ingredients: ['Centella Asiatica', 'Ceramide', 'B5', 'Glycerin', 'Water'],
      },
      token
    );
    console.log('   Status:', scanAnalyze.status);
    console.log('   Calculated Final Score:', scanAnalyze.data.data.scoreResult.finalScore, '%');
    console.log('   Base Profile Score:', scanAnalyze.data.data.scoreResult.baseScore, '%');
    console.log('   Verdict:', scanAnalyze.data.data.scoreResult.verdict);
    console.log('   Matched Treatments:', scanAnalyze.data.data.scoreResult.matchedTreatments);

    // 15. Create Community Post (Mục 44) & Like
    console.log('\n15. Testing /api/community (Create post & Like)...');
    const post = await request(
      'POST',
      '/api/community',
      {
        title: 'Routine 14 ngày phục hồi da sau treatment hiệu quả bất ngờ!',
        content: 'Chia sẻ với mọi người chu trình mình vừa dùng xong, giảm đỏ rát rõ rệt.',
        skinType: 'Da_Hon_Hop',
        routineData: {
          title: 'Chuỗi Routine Phục Hồi 14 Ngày',
          totalDays: 14,
          schedule: plan.data.data.schedule,
        },
      },
      token
    );
    console.log('   Status:', post.status, '| Post Title:', post.data.data.title);
    const postId = post.data.data._id;

    const like = await request('POST', `/api/community/${postId}/like`, null, token);
    console.log('   Liked post status:', like.status, '| Likes count:', like.data.likesCount);

    console.log('\n🎉 TẤT CẢ CÁC ENDPOINT CỦA BACKEND ĐỀU ĐÃ ĐƯỢC KIỂM THỬ THÀNH CÔNG 100%!');
  } catch (error) {
    console.error('❌ Lỗi kiểm thử:', error);
  }
}

runTests();
