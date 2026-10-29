import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePreventRemove } from "@react-navigation/native";
import { z } from "zod";
import authApi from "../../../api/authApi";
import { useAuth } from "../../../hooks/useAuth";
import { LOGIN_COPY } from "../../../constants/login";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, LOGIN_COPY.validation.emailLong)
    .pipe(z.email(LOGIN_COPY.validation.email)),
  password: z
    .string()
    .min(1, LOGIN_COPY.validation.loginPassword)
    .max(128, LOGIN_COPY.validation.loginPassword),
});

export default function useLogin({ navigation, route }) {
  const { establishSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const inFlight = useRef(false);
  const pending = useRef(null);
  const mounted = useRef(true);
  const emailParam =
    typeof route?.params?.email === "string" ? route.params.email : "";
  const form = useForm({
    defaultValues: { email: emailParam, password: "" },
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { setValue, setError, clearErrors, getValues } = form;

  usePreventRemove(networkBusy, () => {});
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    setValue("email", emailParam);
  }, [emailParam, setValue]);

  const persist = async (payload) => {
    try {
      await establishSession(payload, LOGIN_COPY.loginSuccess);
    } catch {
      if (mounted.current) setFeedback(LOGIN_COPY.loginSessionFailed);
    }
  };

  const onValid = async (values) => {
    if (inFlight.current || pending.current) return;
    inFlight.current = true;
    setBusy(true);
    setNetworkBusy(true);
    setFeedback(null);
    clearErrors();
    try {
      let payload;
      try {
        payload = await authApi.login(values);
      } catch (error) {
        if (!mounted.current) return;
        if (error.status === 400) {
          const details = error.data?.error?.details;
          if (Array.isArray(details))
            details.forEach((detail) => {
              if (
                Object.hasOwn(values, detail.field) &&
                typeof detail.message === "string"
              ) {
                setError(detail.field, {
                  type: "server",
                  message: detail.field === "email"
                    ? LOGIN_COPY.validation.email
                    : LOGIN_COPY.validation.loginPassword,
                });
              }
            });
          setFeedback(LOGIN_COPY.errors.validation);
        } else {
          setFeedback(
            error.status === 401
              ? LOGIN_COPY.errors.credentials
              : error.status === 429
                ? LOGIN_COPY.errors.rateLimit
                : error.isNetworkError || error.status === 0
                  ? LOGIN_COPY.errors.network
                  : LOGIN_COPY.errors.server,
          );
        }
        return;
      }
      pending.current = payload;
      if (mounted.current) {
        setPendingSession(payload);
        setNetworkBusy(false);
        setValue("password", "");
      }
      await persist(payload);
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setBusy(false);
        setNetworkBusy(false);
      }
    }
  };

  const retrySession = async () => {
    if (inFlight.current || !pending.current) return;
    inFlight.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      await persist(pending.current);
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  const goToRegister = () => {
    if (busy) return;
    const email = getValues("email").trim();
    setValue("password", "");
    navigation.navigate("Register", { email });
  };

  return {
    form,
    busy,
    feedback,
    pendingSession,
    disabled: busy || Boolean(pendingSession),
    submit: pendingSession ? retrySession : form.handleSubmit(onValid),
    goToRegister,
    helpVisible,
    openHelp: () => setHelpVisible(true),
    closeHelp: () => setHelpVisible(false),
  };
}
