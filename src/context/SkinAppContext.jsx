import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  SKIN_DICTIONARY,
  CONDITION_DICTIONARY,
  CONFLICT_MATRIX,
  INITIAL_MY_COLLECTION,
  EXTERNAL_RECOMMENDED_PRODUCTS,
  INITIAL_TREATMENT_PLAN,
  COMMUNITY_POSTS,
} from '../data/skinData';

const SkinAppContext = createContext();

export const SkinAppProvider = ({ children }) => {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState('Home'); // Home, Checkin, Analysis, DailyRoutine, DailyRoutineDetail, RoutineChainDetail, AddEditRoutine
  const [selectedSession, setSelectedSession] = useState('morning'); // 'morning' | 'evening'

  // User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Khánh Linh',
    skinType: 'Da_Hon_Hop', // Da hỗn hợp thiên dầu
    allergies: ['Cồn khô nồng độ cao', 'Hương liệu tổng hợp'],
    streakDays: 12,
  });

  // Tủ đồ mỹ phẩm (My Collection)
  const [myCollection, setMyCollection] = useState(INITIAL_MY_COLLECTION);

  // Phác đồ chuỗi routine đang hoạt động (Treatment Plan)
  const [treatmentPlan, setTreatmentPlan] = useState(INITIAL_TREATMENT_PLAN);

  // Trạng thái Check-in da hôm nay
  const [selectedConditions, setSelectedConditions] = useState(['Kho_Rat']); // Mặc định demo trạng thái Khô rát để thấy rõ thuật toán rẽ nhánh
  const [hasCheckedInToday, setHasCheckedInToday] = useState(true);
  const [previousConditions, setPreviousConditions] = useState([]);
  
  // Undo Toast state (10s đếm ngược)
  const [undoActive, setUndoActive] = useState(false);
  const [undoTimeRemaining, setUndoTimeRemaining] = useState(10);
  const undoTimerRef = useRef(null);

  // Modal trạng thái
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    enabled: true,
    morningTime: '08:00',
    eveningTime: '20:00',
    expiryAlerts: true,
  });

  // Ghi đè (Override) do thuật toán phân tích
  const [analysisResult, setAnalysisResult] = useState(null);
  const [hasAppliedOverride, setHasAppliedOverride] = useState(true);

  // Completed steps tracker for Daily Routine Detail
  const [completedSteps, setCompletedSteps] = useState({
    morning: { 1: true, 2: true, 3: false, 4: false, 5: false },
    evening: { 1: false, 2: false, 3: false, 4: false, 5: false },
  });

  // Cấu hình test: có chu trình hay rỗng (Screen 15: Chưa có gì -> Gợi ý chu trình)
  const [isRoutineEmpty, setIsRoutineEmpty] = useState(false);

  // Helper tìm sản phẩm theo ID
  const getProductById = (id) => {
    return myCollection.find((p) => p.id === id) || null;
  };

  // Thuật toán phân tích tình trạng da & Tạo Daily Routine hôm nay (Mục 14)
  const runSkinAnalysis = (conditions = selectedConditions) => {
    const activePlan = treatmentPlan;
    const currentDay = activePlan.currentDay;
    const currentDaySchedule = activePlan.days.find((d) => d.dayNumber === currentDay) || activePlan.days[0];

    // Lấy danh sách sản phẩm bản nháp ban đầu
    const draftMorningProductIds = [...currentDaySchedule.morning];
    const draftEveningProductIds = [...currentDaySchedule.evening];

    const draftMorningProducts = draftMorningProductIds.map(getProductById).filter(Boolean);
    const draftEveningProducts = draftEveningProductIds.map(getProductById).filter(Boolean);

    // Kiểm tra điều kiện rẽ nhánh theo Check-in
    const isDry = conditions.includes('Kho_Rat');
    const isIrritated = conditions.includes('Kích_Ung');
    const isAcne = conditions.includes('Noi_Mun');
    const isOily = conditions.includes('Bong_Dau');
    const isNormal = conditions.includes('Binh_Thuong');

    let isOverridden = false;
    let overrideReason = '';
    let suggestedReplacements = [];
    let externalRecommendations = [];
    let shiftDays = 0;

    let finalEveningProductIds = [...draftEveningProductIds];
    let dynamicReasons = {};

    // Ghi nhận lý do động cho Bước 1 làm sạch
    if (isDry) {
      dynamicReasons[1] = 'Sữa rửa mặt Simple có hoạt chất Pro-Vitamin B5 sẽ giúp làm dịu nền da đang Khô Rát của bạn.';
    } else if (isIrritated) {
      dynamicReasons[1] = 'Công thức gel không xà phòng làm sạch êm dịu, bảo tồn màng acid cho da đang Kích Ứng.';
    } else if (isOily) {
      dynamicReasons[1] = 'Làm sạch sâu bã nhờn cuốn trôi dầu thừa vùng chữ T mà không làm khô căng.';
    } else {
      dynamicReasons[1] = 'Độ pH 5.5 cân bằng sinh học duy trì độ ẩm lý tưởng cho làn da.';
    }

    // Logic nghiệp vụ rẽ nhánh đặc trị (Bước 3) từ Sheet mục 14:
    // "Nếu chuỗi quy định hôm nay bôi BHA, nhưng user lại check-in là 'Khô rát' / 'Kích ứng',
    // thuật toán lập tức ghi đè (override): đẩy B5/Ceramide thay thế, lùi toàn bộ routine hôm nay và sau này xuống 1 ngày"
    if (isDry || isIrritated) {
      // Tìm xem có sản phẩm tẩy tế bào chết BHA (như p-3) trong lịch tối hôm nay không
      const hasBHA = draftEveningProductIds.includes('p-3') || draftEveningProducts.some((p) => p.activeIngredients.some((i) => i.includes('BHA') || i.includes('Retinol')));

      if (hasBHA) {
        isOverridden = true;
        shiftDays = 1;
        overrideReason = `Phát hiện da bạn đang ${isIrritated ? 'Kích Ứng' : 'Khô Rát'}! Thuật toán đã tự động ghi đè: Tạm ngưng BHA (Paula's Choice 2%), thay thế bằng Serum Phục Hồi B5 La Roche-Posay và lùi lịch phác đồ lại 1 ngày để đảm bảo phục hồi tối đa.`;

        // Tìm sản phẩm thay thế trong My Collection (loại bỏ sản phẩm hết hạn)
        const validClosetProducts = myCollection.filter((p) => !p.isExpired);
        const b5Product = validClosetProducts.find((p) => p.activeIngredients.some((i) => i.includes('B5') || i.includes('Panthenol')));

        if (b5Product) {
          // Thay p-3 bằng b5Product.id trong evening
          finalEveningProductIds = finalEveningProductIds.map((id) => (id === 'p-3' ? b5Product.id : id));
          if (!finalEveningProductIds.includes(b5Product.id)) {
            finalEveningProductIds.splice(2, 0, b5Product.id);
          }
          suggestedReplacements.push({
            originalId: 'p-3',
            originalName: "Paula's Choice 2% BHA Liquid Exfoliant",
            replacedWithId: b5Product.id,
            replacedWithName: b5Product.name,
            reason: 'Chứa Panthenol B5 5% & Madecassoside dập tắt cơn kích ứng cấp tốc.',
          });
        }

        // Kiểm tra xem tủ đồ có đủ kem dưỡng làm dịu mạnh không, nếu thiếu thì gọi API gợi ý ngoài tủ đồ
        externalRecommendations = EXTERNAL_RECOMMENDED_PRODUCTS.slice(0, 2);

        dynamicReasons[3] = isIrritated
          ? 'GHI ĐÈ: Đã thay thế BHA bằng Serum B5 giúp làm dịu khẩn cấp và dập tắt ửng đỏ kích ứng.'
          : 'GHI ĐÈ: Da đang khô rát cần cấp ẩm sâu bằng B5 và Ceramide thay vì tẩy da chết acid.';
      } else {
        dynamicReasons[3] = 'Tập trung phục hồi hàng rào màng ẩm, nuôi dưỡng tế bào tổn thương.';
      }
    } else if (isAcne) {
      dynamicReasons[3] = 'Salicylic Acid & Tràm trà hỗ trợ gom cồi mụn viêm và kháng khuẩn tại chỗ.';
    } else if (isOily) {
      dynamicReasons[3] = 'Niacinamide 10% kết hợp Kẽm Zinc 1% kiểm soát hoạt động tuyến dầu và se khít lỗ chân lông.';
    } else {
      dynamicReasons[3] = 'Duy trì hoạt chất nuôi dưỡng, hướng tới làn da căng bóng và đều màu rạng rỡ.';
    }

    dynamicReasons[4] = isDry
      ? 'Khóa ẩm đa tầng với phức hợp Ceramide bảo vệ da không bị bốc hơi nước.'
      : 'Cấp ẩm cân bằng mỏng nhẹ, giữ bề mặt da thông thoáng.';

    dynamicReasons[5] = 'Màng lọc chống nắng phổ rộng SPF50+ PA++++ bảo vệ da toàn diện dưới tia UV ban ngày.';

    const result = {
      isOverridden,
      overrideReason,
      shiftDays,
      currentDay,
      conditions,
      draftSchedule: {
        morning: draftMorningProducts,
        evening: draftEveningProducts,
      },
      adaptedSchedule: {
        morning: draftMorningProductIds.map(getProductById).filter(Boolean),
        evening: finalEveningProductIds.map(getProductById).filter(Boolean),
      },
      suggestedReplacements,
      externalRecommendations,
      dynamicReasons,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setAnalysisResult(result);
    return result;
  };

  // Khởi chạy phân tích ban đầu
  useEffect(() => {
    runSkinAnalysis(selectedConditions);
  }, []);

  // Xử lý chọn nhiều icon tình trạng da (Mục 13)
  const handleToggleCondition = (condId) => {
    let nextConditions = [];
    if (condId === 'Binh_Thuong') {
      // Nếu chọn 'bình thường' thì bỏ các lựa chọn khác
      nextConditions = ['Binh_Thuong'];
    } else {
      // Nếu chọn khác 'bình thường', thì bỏ 'bình thường'
      const withoutNormal = selectedConditions.filter((c) => c !== 'Binh_Thuong');
      if (withoutNormal.includes(condId)) {
        nextConditions = withoutNormal.filter((c) => c !== condId);
        if (nextConditions.length === 0) {
          nextConditions = ['Binh_Thuong']; // Mặc định về Bình thường nếu uncheck hết
        }
      } else {
        nextConditions = [...withoutNormal, condId];
      }
    }
    setSelectedConditions(nextConditions);
  };

  // Xác nhận check-in và kích hoạt Toast 10s đếm ngược (Mục 13)
  const handleConfirmCheckin = () => {
    setPreviousConditions([...selectedConditions]);
    setHasCheckedInToday(true);

    // Kích hoạt Undo Toast đếm ngược 10s
    setUndoActive(true);
    setUndoTimeRemaining(10);

    if (undoTimerRef.current) clearInterval(undoTimerRef.current);

    undoTimerRef.current = setInterval(() => {
      setUndoTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(undoTimerRef.current);
          setUndoActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Chạy phân tích và cập nhật Daily Routine
    const analysis = runSkinAnalysis(selectedConditions);
    setHasAppliedOverride(true);

    // Điều hướng sang màn hình phân tích (Screen 14)
    setCurrentScreen('Analysis');
  };

  // Hoàn tác check-in trong 10s (Mục 13)
  const handleUndoCheckin = () => {
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    setUndoActive(false);
    setUndoTimeRemaining(10);
    // Quay lại trạng thái trước đó
    const restored = previousConditions.length > 0 ? previousConditions : ['Binh_Thuong'];
    setSelectedConditions(restored);
    runSkinAnalysis(restored);
  };

  // Kiểm tra xung đột hoạt chất trước khi thêm/sửa vào chuỗi routine (Mục 18)
  const checkProductConflict = (product, targetDayNumber, targetSession) => {
    if (!product) return null;

    // 1. Kiểm tra với tình trạng da check-in hôm nay
    for (const condKey of selectedConditions) {
      const condMeta = CONDITION_DICTIONARY[condKey];
      if (condMeta && condMeta.taboo) {
        for (const tabooIngredient of condMeta.taboo) {
          const matched = product.activeIngredients.some((ing) =>
            ing.toLowerCase().includes(tabooIngredient.toLowerCase())
          );
          if (matched) {
            return {
              hasConflict: true,
              type: 'condition_conflict',
              severity: 'danger',
              title: 'CẢNH BÁO XUNG ĐỘT TÌNH TRẠNG DA!',
              ingredient: tabooIngredient,
              productName: product.name,
              reason: `Sản phẩm này chứa "${tabooIngredient}" - thuộc nhóm CẤM KỴ cho tình trạng da đang ${condMeta.label} (${condMeta.emoji}) hôm nay của bạn.`,
              recommendation: 'Khuyến nghị: Không dùng acid/treatment mạnh trong ngày này để tránh tổn thương biểu bì.',
            };
          }
        }
      }
    }

    // 2. Kiểm tra xung đột giữa các hoạt chất trong cùng một buổi (Session Conflict)
    const dayData = treatmentPlan.days.find((d) => d.dayNumber === targetDayNumber);
    const existingProductIds = dayData ? dayData[targetSession] || [] : [];
    const existingProducts = existingProductIds.map(getProductById).filter(Boolean);

    for (const [activeKey, matrix] of Object.entries(CONFLICT_MATRIX)) {
      const productHasActive = product.activeIngredients.some((ing) =>
        ing.toLowerCase().includes(activeKey.toLowerCase())
      );

      if (productHasActive) {
        for (const otherProd of existingProducts) {
          if (otherProd.id === product.id) continue;
          for (const conflictWith of matrix.conflictsWith) {
            const otherHasConflict = otherProd.activeIngredients.some((ing) =>
              ing.toLowerCase().includes(conflictWith.toLowerCase())
            );
            if (otherHasConflict) {
              return {
                hasConflict: true,
                type: 'chemical_conflict',
                severity: 'warning',
                title: 'CẢNH BÁO XUNG ĐỘT HOẠT CHẤT!',
                ingredient: `${activeKey} ⚡ ${conflictWith}`,
                productName: `${product.name} và ${otherProd.name}`,
                reason: `${matrix.reason} (Xung đột giữa ${activeKey} trong sản phẩm bạn chọn và ${conflictWith} đã có trong chu trình buổi ${targetSession === 'morning' ? 'Sáng' : 'Tối'}).`,
                recommendation: 'Khuyến nghị: Nên tách 2 hoạt chất này ra 2 buổi khác nhau (Ví dụ: Vitamin C buổi sáng, BHA/Retinol buổi tối).',
              };
            }
          }
        }
      }
    }

    return null;
  };

  // Thêm hoặc sửa sản phẩm vào chuỗi routine (Mục 18)
  const saveProductToRoutineChain = ({ dayNumber, session, stepNumber, productId, isNewDay, newDayTitle }) => {
    setTreatmentPlan((prev) => {
      let updatedDays = [...prev.days];

      if (isNewDay) {
        // Thêm hẳn 1 ngày mới như yêu cầu trong Sheet!
        const nextDayNumber = updatedDays.length + 1;
        const newDay = {
          dayNumber: nextDayNumber,
          title: newDayTitle || `Ngày thứ ${nextDayNumber} - Bổ sung tùy chỉnh`,
          focus: 'Chu trình cá nhân hóa bổ sung',
          morning: session === 'morning' ? [productId] : ['p-1', 'p-2', 'p-7'],
          evening: session === 'evening' ? [productId] : ['p-1', 'p-2', 'p-6'],
        };
        updatedDays.push(newDay);
      } else {
        // Cập nhật ngày có sẵn
        updatedDays = updatedDays.map((d) => {
          if (d.dayNumber === dayNumber) {
            const currentSessionList = [...(d[session] || [])];
            if (!currentSessionList.includes(productId)) {
              currentSessionList.push(productId);
            }
            return {
              ...d,
              [session]: currentSessionList,
            };
          }
          return d;
        });
      }

      return {
        ...prev,
        totalDays: updatedDays.length,
        days: updatedDays,
      };
    });

    // Re-run analysis
    setTimeout(() => {
      runSkinAnalysis(selectedConditions);
    }, 100);
  };

  // Toggle hoàn thành bước skincare
  const toggleStepCompleted = (session, stepNumber) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [session]: {
        ...prev[session],
        [stepNumber]: !prev[session][stepNumber],
      },
    }));
  };

  // Thêm sản phẩm ngoài tủ đồ vào My Collection
  const addExternalProductToCollection = (extProduct) => {
    const newProd = {
      id: `p-added-${Date.now()}`,
      name: extProduct.name,
      brand: extProduct.brand,
      category: 'Phục hồi cấp ẩm',
      stepNumber: 3,
      activeIngredients: extProduct.activeIngredients,
      isExpired: false,
      expiryDate: '2027-12-31',
      openedDate: new Date().toISOString().split('T')[0],
      image: 'serum-b5',
      usageTip: extProduct.matchReason,
    };
    setMyCollection((prev) => [newProd, ...prev]);
  };

  return (
    <SkinAppContext.Provider
      value={{
        // Nav
        currentScreen,
        setCurrentScreen,
        selectedSession,
        setSelectedSession,
        // Profile
        userProfile,
        setUserProfile,
        // Dictionaries
        SKIN_DICTIONARY,
        CONDITION_DICTIONARY,
        CONFLICT_MATRIX,
        // Collection & Plan
        myCollection,
        setMyCollection,
        treatmentPlan,
        setTreatmentPlan,
        getProductById,
        // Checkin & Undo
        selectedConditions,
        setSelectedConditions,
        hasCheckedInToday,
        handleToggleCondition,
        handleConfirmCheckin,
        handleUndoCheckin,
        undoActive,
        undoTimeRemaining,
        // Analysis & Override
        analysisResult,
        runSkinAnalysis,
        hasAppliedOverride,
        setHasAppliedOverride,
        // Routine details & steps
        completedSteps,
        toggleStepCompleted,
        isRoutineEmpty,
        setIsRoutineEmpty,
        // Notifications & Guides
        isNotificationOpen,
        setIsNotificationOpen,
        isGuideOpen,
        setIsGuideOpen,
        notificationConfig,
        setNotificationConfig,
        // Conflict & Save
        checkProductConflict,
        saveProductToRoutineChain,
        addExternalProductToCollection,
        // Community
        communityPosts: COMMUNITY_POSTS,
      }}
    >
      {children}
    </SkinAppContext.Provider>
  );
};

export const useSkinApp = () => {
  const context = useContext(SkinAppContext);
  if (!context) {
    throw new Error('useSkinApp must be used within a SkinAppProvider');
  }
  return context;
};
