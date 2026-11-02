import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as routineApi from '../api/routineApi';
import {
  analyzeIngredientConflicts,
  analyzeSkinSuitability,
  analyzeConditionSuitability,
} from '../constants/skinDictionaries';
import {
  scheduleDailyCheckInReminder,
  sendImmediateCheckInReminder,
} from '../services/localNotificationService';

const RoutineContext = createContext(null);

const DEFAULT_MOCK_PLAN = {
  _id: 'default-plan-14day-acne',
  title: 'Lộ trình 14 ngày Trị Mụn & Phục Hồi',
  description: 'Lộ trình xen kẽ BHA 2% đẩy mụn và B5 phục hồi màng ẩm, hạn chế tối đa nguy cơ kích ứng.',
  totalDays: 14,
  currentDay: 3,
  targetSkinTypes: ['Da Dầu', 'Da Hỗn Hợp'],
  isTemplate: false,
  days: [
    {
      dayNumber: 1,
      title: 'Làm quen BHA',
      focusArea: 'Kháng viêm & thông thoáng lỗ chân lông',
      steps: [
        { stepNumber: 1, category: 'Làm sạch', title: 'Sữa rửa mặt dịu nhẹ', reason: 'Loại bỏ dầu thừa mà không làm khô da' },
        { stepNumber: 2, category: 'Cân bằng', title: 'Toner cấp ẩm B5', reason: 'Cân bằng pH da' },
        { stepNumber: 3, category: 'Đặc trị', title: 'BHA 2% Salicylic Acid', reason: 'Làm sạch sâu bã nhờn trong lỗ chân lông' },
        { stepNumber: 4, category: 'Dưỡng / Phục hồi', title: 'Kem dưỡng Ceramide', reason: 'Khóa ẩm, củng cố hàng rào bảo vệ' },
        { stepNumber: 5, category: 'Bảo vệ (KCN)', title: 'Kem chống nắng SPF 50+', reason: 'Bắt buộc khi sử dụng treatment BHA' },
      ],
    },
    {
      dayNumber: 2,
      title: 'Phục hồi & Cấp ẩm',
      focusArea: 'Làm dịu da sau ngày treatment',
      steps: [
        { stepNumber: 1, category: 'Làm sạch', title: 'Sữa rửa mặt dịu nhẹ', reason: 'Làm sạch bụi bẩn nhẹ nhàng' },
        { stepNumber: 2, category: 'Cân bằng', title: 'Toner Rau má Centella', reason: 'Làm dịu và cấp nước' },
        { stepNumber: 3, category: 'Đặc trị', title: 'Serum B5 Panthenol', reason: 'Tái tạo da và giảm đỏ' },
        { stepNumber: 4, category: 'Dưỡng / Phục hồi', title: 'Kem dưỡng ẩm Hyaluronic Acid', reason: 'Khóa ẩm đa tầng' },
        { stepNumber: 5, category: 'Bảo vệ (KCN)', title: 'Kem chống nắng dịu nhẹ', reason: 'Bảo vệ da hàng ngày' },
      ],
    },
    {
      dayNumber: 3,
      title: 'Duy trì làm sạch sâu (BHA)',
      focusArea: 'Kiểm soát bã nhờn vùng chữ T',
      steps: [
        { stepNumber: 1, category: 'Làm sạch', title: 'Sữa rửa mặt BHA nhẹ', reason: 'Làm sạch bã nhờn' },
        { stepNumber: 2, category: 'Cân bằng', title: 'Toner Cân bằng pH', reason: 'Chuẩn bị nền da' },
        { stepNumber: 3, category: 'Đặc trị', title: 'BHA 2% Liquid Exfoliant', reason: 'Đặc trị mụn ẩn và mụn đầu đen' },
        { stepNumber: 4, category: 'Dưỡng / Phục hồi', title: 'Gel dưỡng ẩm Phục hồi', reason: 'Dưỡng ẩm kết cấu mỏng nhẹ' },
        { stepNumber: 5, category: 'Bảo vệ (KCN)', title: 'Kem chống nắng phổ rộng SPF 50+', reason: 'Bảo vệ da tối đa trước tia UV' },
      ],
    },
  ],
};

const DEFAULT_MOCK_ROUTINE = {
  _id: 'today-routine-1',
  dayNumber: 3,
  planTitle: 'Lộ trình 14 ngày Trị Mụn & Phục Hồi',
  date: new Date().toISOString(),
  conditions: [],
  isOverridden: false,
  overrideReason: '',
  steps: [
    {
      stepNumber: 1,
      category: 'Làm sạch',
      productName: 'Sữa rửa mặt Cerave Foaming Cleanser',
      brand: 'CeraVe',
      instructions: 'Lấy lượng vừa đủ, tạo bọt nhẹ và massage đều trên da trong 60 giây, rửa sạch với nước ấm.',
      reason: 'Bước làm sạch nền tảng loại bỏ bụi bẩn và bã nhờn mà không làm tổn thương màng ẩm tự nhiên.',
      timeOfDay: 'both',
    },
    {
      stepNumber: 2,
      category: 'Cân bằng',
      productName: 'Nước hoa hồng Klairs Supple Preparation',
      brand: 'Dear Klairs',
      instructions: 'Vỗ nhẹ 3-4 giọt lên da mặt ngay sau khi rửa mặt để cân bằng độ pH chuẩn 5.5.',
      reason: 'Cân bằng độ ẩm và mở đường dẫn cho các hoạt chất đặc trị thẩm thấu sâu hơn.',
      timeOfDay: 'both',
    },
    {
      stepNumber: 3,
      category: 'Đặc trị',
      productName: 'Paula\'s Choice Skin Perfecting 2% BHA',
      brand: 'Paula\'s Choice',
      instructions: 'Thoa 3-5 giọt lên toàn mặt (tránh vùng mắt), chờ 15-20 phút trước khi dùng bước tiếp theo.',
      reason: 'Hoạt chất Salicylic Acid 2% hòa tan trong dầu, làm sạch sâu bên trong lỗ chân lông và gom cồi mụn.',
      timeOfDay: 'evening',
    },
    {
      stepNumber: 4,
      category: 'Dưỡng / Phục hồi',
      productName: 'Kem dưỡng La Roche-Posay Cicaplast Baume B5+',
      brand: 'La Roche-Posay',
      instructions: 'Lấy lượng kem bằng hạt đậu, chấm đều 5 điểm và thoa nhẹ nhàng để khóa ẩm.',
      reason: 'Cung cấp Panthenol (B5) và Madecassoside giúp làm dịu tức thì và củng cố màng lipid da.',
      timeOfDay: 'both',
    },
    {
      stepNumber: 5,
      category: 'Bảo vệ (KCN)',
      productName: 'Kem chống nắng Anessa Perfect UV Milk SPF 50+',
      brand: 'Anessa',
      instructions: 'Thoa đều 2 ngón tay kem chống nắng trước khi ra ngoài 20 phút. Thoa lại sau mỗi 2-3 tiếng.',
      reason: 'Bảo vệ da toàn diện trước tia UVA/UVB, ngăn ngừa thâm nám và lão hóa quang hóa.',
      timeOfDay: 'morning',
    },
  ],
};

const DEFAULT_SUGGESTED_PLANS = [
  DEFAULT_MOCK_PLAN,
  {
    _id: 'suggested-plan-7day-hydration',
    title: 'Lộ trình 7 ngày Phục hồi Cấp Ẩm Chuyên Sâu',
    description: 'Tập trung tái tạo hàng rào sinh học với Ceramide, HA đa tầng và Vitamin B5 cho da khô ráp, kích ứng.',
    totalDays: 7,
    currentDay: 1,
    targetSkinTypes: ['Da Khô', 'Da Nhạy Cảm'],
    isTemplate: true,
    days: [
      {
        dayNumber: 1,
        title: 'Cấp nước khẩn cấp',
        focusArea: 'Làm dịu & làm ẩm tầng sâu',
        steps: [
          { stepNumber: 1, category: 'Làm sạch', title: 'Sữa rửa mặt dưỡng ẩm' },
          { stepNumber: 2, category: 'Cân bằng', title: 'Toner Hyaluronic Acid' },
          { stepNumber: 3, category: 'Đặc trị', title: 'Serum B5 làm dịu' },
          { stepNumber: 4, category: 'Dưỡng / Phục hồi', title: 'Kem dưỡng ẩm Ceramide' },
          { stepNumber: 5, category: 'Bảo vệ (KCN)', title: 'KCN chống nắng phổ rộng dịu nhẹ' },
        ],
      },
    ],
  },
  {
    _id: 'suggested-plan-21day-brightening',
    title: 'Lộ trình 21 ngày Sáng Da Mờ Thâm Vitamin C',
    description: 'Kết hợp Vitamin C buổi sáng và Niacinamide buổi tối, làm đều màu da và chống oxy hóa mạnh mẽ.',
    totalDays: 21,
    currentDay: 1,
    targetSkinTypes: ['Da Thường', 'Da Hỗn Hợp'],
    isTemplate: true,
    days: [
      {
        dayNumber: 1,
        title: 'Chống oxy hóa & Bảo vệ',
        focusArea: 'Bảo vệ màng tế bào trước gốc tự do',
        steps: [
          { stepNumber: 1, category: 'Làm sạch', title: 'Sữa rửa mặt dạng gel' },
          { stepNumber: 2, category: 'Cân bằng', title: 'Toner Vitamin C dịu nhẹ' },
          { stepNumber: 3, category: 'Đặc trị', title: 'Serum L-Ascorbic Acid 15%' },
          { stepNumber: 4, category: 'Dưỡng / Phục hồi', title: 'Kem dưỡng ẩm dạng gel' },
          { stepNumber: 5, category: 'Bảo vệ (KCN)', title: 'Kem chống nắng SPF 50+ PA++++' },
        ],
      },
    ],
  },
];

export function RoutineProvider({ children }) {
  const [dailyRoutine, setDailyRoutine] = useState(DEFAULT_MOCK_ROUTINE);
  const [activePlan, setActivePlan] = useState(DEFAULT_MOCK_PLAN);
  const [suggestedPlans, setSuggestedPlans] = useState(DEFAULT_SUGGESTED_PLANS);
  const [isRoutineLoading, setIsRoutineLoading] = useState(false);

  // Checkin & 10s Undo Toast State (Requirement 3 & 4)
  const [todayCheckIn, setTodayCheckIn] = useState([]);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const [undoRemaining, setUndoRemaining] = useState(10);
  const undoTimerRef = useRef(null);
  const previousRoutineRef = useRef(null);

  // Setup local daily checkin reminder notification on launch
  useEffect(() => {
    scheduleDailyCheckInReminder(8, 0);
  }, []);

  // Fetch initial routine & active plan
  const refreshDailyRoutine = useCallback(async () => {
    try {
      setIsRoutineLoading(true);
      const res = await routineApi.getDailyRoutine();
      if (res && res.data) {
        setDailyRoutine(res.data);
        if (res.data.conditions && res.data.conditions.length > 0) {
          setTodayCheckIn(res.data.conditions);
        }
      }
    } catch (err) {
      // Graceful fallback to mock data
      console.log('Using local routine data:', err?.message);
    } finally {
      setIsRoutineLoading(false);
    }
  }, []);

  const refreshActivePlan = useCallback(async () => {
    try {
      const res = await routineApi.getActivePlan();
      if (res && res.data) {
        setActivePlan(res.data);
      }
    } catch (err) {
      console.log('Using local active plan data:', err?.message);
    }
  }, []);

  const refreshSuggestedPlans = useCallback(async () => {
    try {
      const res = await routineApi.getSuggestedPlans();
      if (res && res.data && res.data.length > 0) {
        setSuggestedPlans(res.data);
      }
    } catch (err) {
      console.log('Using local suggested plans:', err?.message);
    }
  }, []);

  useEffect(() => {
    refreshDailyRoutine();
    refreshActivePlan();
    refreshSuggestedPlans();
  }, [refreshDailyRoutine, refreshActivePlan, refreshSuggestedPlans]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    };
  }, []);

  // Requirement 3 & 4: Checkin with 10s undo floating toast & dynamic routine override
  const checkInSkin = useCallback(async (selectedConditions) => {
    // Preserve previous routine for undo
    previousRoutineRef.current = dailyRoutine;
    setTodayCheckIn(selectedConditions);

    // Apply dynamic routine override based on condition analysis
    const isIrritatedOrDry =
      selectedConditions.includes('kich_ung') ||
      selectedConditions.includes('kho_rat');
    const isAcne = selectedConditions.includes('noi_mun');
    const isOily = selectedConditions.includes('bong_dau');
    const isNormal = selectedConditions.includes('binh_thuong') || selectedConditions.length === 0;

    if (isIrritatedOrDry) {
      setDailyRoutine(prev => {
        if (!prev) return prev;
        const newSteps = (prev.steps || []).map(step => {
          if (step.stepNumber === 3) {
            return {
              ...step,
              productName: 'Serum La Roche-Posay Hyalu B5 (Phục hồi khẩn cấp)',
              brand: 'La Roche-Posay',
              instructions: 'Thoa đều 3-4 giọt serum B5, vỗ nhẹ cho tinh chất thẩm thấu làm dịu da.',
              reason: 'Tự động thay thế BHA bằng hoạt chất B5/Ceramide để làm dịu kích ứng và phục hồi màng ẩm theo phân tích da.',
            };
          }
          return step;
        });
        return {
          ...prev,
          isOverridden: true,
          overrideReason: 'Đã hoãn BHA 1 ngày, ưu tiên B5/Ceramide để làm dịu da khô rát/kích ứng.',
          steps: newSteps,
          conditions: selectedConditions,
        };
      });
    } else if (isAcne) {
      setDailyRoutine(prev => {
        if (!prev) return prev;
        const newSteps = (prev.steps || []).map(step => {
          if (step.stepNumber === 3) {
            return {
              ...step,
              productName: 'Gel Chấm Mụn Tràm Trà Tea Tree & Salicylic Acid',
              brand: 'The Body Shop',
              instructions: 'Chấm trực tiếp lượng nhỏ gel lên các nốt mụn viêm sau bước làm sạch và cân bằng.',
              reason: 'Hỗ trợ kháng khuẩn, giảm sưng đỏ và gom cồi mụn với Salicylic Acid & Tea Tree, hạn chế chất gây bít tắc.',
            };
          }
          return step;
        });
        return {
          ...prev,
          isOverridden: true,
          overrideReason: 'Đã tối ưu hóa bước đặc trị với Salicylic Acid & Tea Tree giúp kháng viêm, gom cồi mụn.',
          steps: newSteps,
          conditions: selectedConditions,
        };
      });
    } else if (isOily) {
      setDailyRoutine(prev => {
        if (!prev) return prev;
        const newSteps = (prev.steps || []).map(step => {
          if (step.stepNumber === 3) {
            return {
              ...step,
              productName: 'Serum Niacinamide 10% + Zinc 1% Kiềm Dầu',
              brand: 'The Ordinary',
              instructions: 'Thoa 2-3 giọt serum lên vùng chữ T và hai bên má trước khi dùng kem dưỡng ẩm.',
              reason: 'Điều tiết tuyến bã nhờn, thu nhỏ lỗ chân lông và duy trì bề mặt da thông thoáng.',
            };
          }
          return step;
        });
        return {
          ...prev,
          isOverridden: true,
          overrideReason: 'Đã điều chỉnh bước đặc trị với Niacinamide & Zinc PCA giúp kiểm soát bóng dầu tối ưu.',
          steps: newSteps,
          conditions: selectedConditions,
        };
      });
    } else if (isNormal) {
      setDailyRoutine(prev => {
        if (!prev) return prev;
        return {
          ...DEFAULT_MOCK_ROUTINE,
          isOverridden: false,
          overrideReason: '',
          conditions: ['binh_thuong'],
        };
      });
    }

    // Call Backend API
    try {
      const res = await routineApi.submitCheckIn(selectedConditions);
      if (res && res.data && res.data.dailyRoutine) {
        setDailyRoutine(res.data.dailyRoutine);
      }
    } catch (err) {
      console.log('Check-in synced locally:', err?.message);
    }

    // Start 10-second countdown for Floating Undo Toast
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    setUndoRemaining(10);
    setIsUndoVisible(true);

    undoTimerRef.current = setInterval(() => {
      setUndoRemaining(prev => {
        if (prev <= 1) {
          clearInterval(undoTimerRef.current);
          setIsUndoVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [dailyRoutine]);

  // Undo Check-in (Requirement 3)
  const undoCheckIn = useCallback(async () => {
    if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    setIsUndoVisible(false);
    setUndoRemaining(0);

    if (previousRoutineRef.current) {
      setDailyRoutine(previousRoutineRef.current);
    }
    setTodayCheckIn([]);

    try {
      await routineApi.undoCheckIn();
    } catch (err) {
      console.log('Undo check-in synced locally:', err?.message);
    }
  }, []);

  // Activate Plan
  const activatePlan = useCallback(async (planId) => {
    setIsRoutineLoading(true);
    try {
      const res = await routineApi.activatePlan(planId);
      if (res && res.data) {
        if (res.data.plan) setActivePlan(res.data.plan);
        if (res.data.dailyRoutine) setDailyRoutine(res.data.dailyRoutine);
      }
      await refreshDailyRoutine();
      await refreshActivePlan();
    } catch (err) {
      // Local fallback activation
      const target = suggestedPlans.find(p => p._id === planId);
      if (target) {
        setActivePlan({ ...target, isTemplate: false, currentDay: 1 });
      }
    } finally {
      setIsRoutineLoading(false);
    }
  }, [suggestedPlans, refreshDailyRoutine, refreshActivePlan]);

  // Update Product in Plan Day
  const updateProductInPlan = useCallback(async (payload) => {
    const { planId, dayNumber, stepNumber, productId, customProduct } = payload;
    try {
      await routineApi.updatePlanProduct(planId, payload);
    } catch (err) {
      console.log('Update plan product locally:', err?.message);
    }

    // Update in local state
    setActivePlan(prev => {
      if (!prev) return prev;
      const updatedDays = (prev.days || []).map(day => {
        if (day.dayNumber === dayNumber) {
          const updatedSteps = (day.steps || []).map(step => {
            if (step.stepNumber === stepNumber) {
              return {
                ...step,
                productId: productId || step.productId,
                title: customProduct?.name || step.title,
                category: customProduct?.category || step.category,
              };
            }
            return step;
          });
          return { ...day, steps: updatedSteps };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  }, []);

  // Add Day to Plan
  const addDayToPlan = useCallback(async (payload) => {
    const { planId, title, focusArea, steps } = payload;
    try {
      await routineApi.addPlanDay(planId, payload);
    } catch (err) {
      console.log('Add plan day locally:', err?.message);
    }

    setActivePlan(prev => {
      if (!prev) return prev;
      const nextDayNumber = (prev.days?.length || 0) + 1;
      const newDay = {
        dayNumber: nextDayNumber,
        title: title || `Ngày ${nextDayNumber}`,
        focusArea: focusArea || 'Chăm sóc da tăng cường',
        steps: steps || [],
      };
      return {
        ...prev,
        totalDays: nextDayNumber,
        days: [...(prev.days || []), newDay],
      };
    });
  }, []);

  // Check Conflict Matrix & Skin Suitability (Requirement 8 & 9)
  const checkConflict = useCallback(async ({ existingIngredients = [], newIngredients = [], skinType, conditions = [] }) => {
    // 1. Instant client-side check
    const ingredientConflicts = analyzeIngredientConflicts(existingIngredients, newIngredients);
    const skinWarnings = analyzeSkinSuitability(skinType, newIngredients);
    const conditionWarnings = analyzeConditionSuitability(conditions, newIngredients);

    const clientResult = {
      hasConflict: ingredientConflicts.hasConflict,
      conflicts: ingredientConflicts.conflicts,
      warnings: [...skinWarnings.warnings, ...conditionWarnings.warnings],
    };

    // 2. Try server-side check if available
    try {
      const res = await routineApi.checkIngredientConflict({
        existingIngredients,
        newIngredients,
        skinType,
        conditions,
      });
      if (res && res.data) {
        return res.data;
      }
    } catch (e) {
      // Ignore network error and return client analysis
    }

    return clientResult;
  }, []);

  // Trigger Check-in Reminder Notification
  const triggerCheckInReminder = useCallback(async () => {
    await sendImmediateCheckInReminder();
    try {
      await routineApi.triggerCheckInNotification();
    } catch (e) {
      // Handled locally
    }
  }, []);

  const value = {
    dailyRoutine,
    activePlan,
    suggestedPlans,
    isRoutineLoading,
    todayCheckIn,
    isUndoVisible,
    undoRemaining,
    checkInSkin,
    undoCheckIn,
    refreshDailyRoutine,
    refreshActivePlan,
    refreshSuggestedPlans,
    activatePlan,
    updateProductInPlan,
    addDayToPlan,
    checkConflict,
    triggerCheckInReminder,
  };

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (!context) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}

