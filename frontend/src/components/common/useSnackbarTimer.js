import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/** Absolute deadlines survive backgrounding. A unique id identifies one event. */
export const useSnackbarTimer = ({ id, visible, expiresAt, onResolve }) => {
  const [, refresh] = useState(0);
  const transaction = useRef({ id, settled: false });
  if (transaction.current.id !== id)
    transaction.current = { id, settled: false };
  const latest = useRef({ visible, expiresAt, onResolve });
  latest.current = { visible, expiresAt, onResolve };

  const settle = useCallback((reason) => {
    if (!latest.current.visible || transaction.current.settled) return false;
    const actualReason =
      Date.now() >= latest.current.expiresAt ? "timeout" : reason;
    transaction.current.settled = true;
    refresh((previous) => previous + 1);
    latest.current.onResolve?.(actualReason);
    return actualReason === reason;
  }, []);

  useEffect(() => {
    if (!visible || transaction.current.settled) return undefined;
    let timer;
    let active = true;
    const tick = () => {
      clearTimeout(timer);
      if (!active || transaction.current.settled) return;
      if (Date.now() >= expiresAt) {
        settle("timeout");
        return;
      }
      refresh((previous) => previous + 1);
      timer = setTimeout(tick, Math.min(250, expiresAt - Date.now()));
    };
    tick();
    const listener = AppState.addEventListener("change", (state) => {
      active = state === "active";
      clearTimeout(timer);
      if (active) tick();
    });
    return () => {
      active = false;
      clearTimeout(timer);
      listener.remove();
    };
  }, [id, visible, expiresAt, settle]);

  return {
    active: visible && !transaction.current.settled,
    remainingSeconds: Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
    settle,
  };
};
