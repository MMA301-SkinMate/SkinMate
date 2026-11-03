import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as routineApi from '../api/routineApi';
import { sendImmediateCheckInReminder } from '../services/localNotificationService';

const RoutineContext = createContext(null);

export function RoutineProvider({ children }) {
  const [dailyRoutine, setDailyRoutine] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [suggestedPlans, setSuggestedPlans] = useState([]);
  const [isRoutineLoading, setIsRoutineLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [routineError, setRoutineError] = useState(null);
  const [todayCheckIn, setTodayCheckIn] = useState([]);
  const [undoRemaining, setUndoRemaining] = useState(0);
  const timer = useRef(null);
  const busy = useRef(false);
  const applyRoutine = useCallback(value => {
    setDailyRoutine(value);
    setTodayCheckIn(value?.checkIn?.status || []);
  }, []);
  const refreshDailyRoutine = useCallback(async () => {
    setIsRoutineLoading(true);
    try {
      const res = await routineApi.getDailyRoutine();
      applyRoutine(res.data);
      setRoutineError(null);
    } catch (error) { setRoutineError(error.message); }
    finally { setIsRoutineLoading(false); }
  }, [applyRoutine]);
  const refreshActivePlan = useCallback(async () => {
    try { const res = await routineApi.getActivePlan(); setActivePlan(res.data); }
    catch (error) { setRoutineError(error.message); }
  }, []);
  const refreshSuggestedPlans = useCallback(async () => {
    try { const res = await routineApi.getSuggestedPlans(); setSuggestedPlans(res.data || []); }
    catch (error) { setRoutineError(error.message); }
  }, []);
  useEffect(() => {
    refreshDailyRoutine(); refreshActivePlan(); refreshSuggestedPlans();
    return () => clearInterval(timer.current);
  }, [refreshDailyRoutine, refreshActivePlan, refreshSuggestedPlans]);
  const checkInSkin = async conditions => {
    if (busy.current) return;
    busy.current = true; setIsSaving(true);
    try {
      const res = await routineApi.submitCheckIn(conditions);
      applyRoutine(res.data); setRoutineError(null);
      clearInterval(timer.current);
      const deadline = Date.now() + 10000;
      setUndoRemaining(10);
      timer.current = setInterval(() => {
        const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        setUndoRemaining(seconds);
        if (!seconds) clearInterval(timer.current);
      }, 200);
    } catch (error) { setRoutineError(error.message); }
    finally { busy.current = false; setIsSaving(false); }
  };
  const undoCheckIn = async () => {
    if (busy.current) return;
    busy.current = true; setIsSaving(true);
    try {
      const res = await routineApi.undoCheckIn();
      applyRoutine(res.data); setUndoRemaining(0); clearInterval(timer.current); setRoutineError(null);
    } catch (error) { setRoutineError(error.message); }
    finally { busy.current = false; setIsSaving(false); }
  };
  const activatePlan = async id => {
    await routineApi.activatePlan(id);
    await Promise.all([refreshDailyRoutine(), refreshActivePlan(), refreshSuggestedPlans()]);
  };
  const updateProductInPlan = async (id, payload) => {
    const res = await routineApi.updatePlanProduct(id, payload);
    setActivePlan(res.data); await refreshDailyRoutine();
  };
  const addDayToPlan = async (id, payload) => {
    const res = await routineApi.addPlanDay(id, payload);
    setActivePlan(res.data); await refreshDailyRoutine();
  };
  const checkConflict = async payload => (await routineApi.checkIngredientConflict(payload)).data;
  const value = {
    dailyRoutine, activePlan, suggestedPlans, isRoutineLoading, isSaving, routineError,
    todayCheckIn, isUndoVisible: undoRemaining > 0, undoRemaining, checkInSkin, undoCheckIn,
    refreshDailyRoutine, refreshActivePlan, refreshSuggestedPlans, activatePlan,
    updateProductInPlan, addDayToPlan, checkConflict,
    triggerCheckInReminder: sendImmediateCheckInReminder,
  };
  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}
export function useRoutine() {
  const value = useContext(RoutineContext);
  if (!value) throw new Error('useRoutine must be used within a RoutineProvider');
  return value;
}
