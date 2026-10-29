import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePreventRemove } from "@react-navigation/native";
import { z } from "zod";
import authApi from "../../../api/authApi";
import { useAuth } from "../../../hooks/useAuth";
import {
  REGISTER_COPY as COPY,
  CAN_REGISTER,
} from "../../../constants/register";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, COPY.validation.name)
      .max(100, COPY.validation.name),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, COPY.validation.emailLong)
      .pipe(z.email(COPY.validation.email)),
    password: z
      .string()
      .min(8, COPY.validation.password)
      .max(128, COPY.validation.password),
    confirmPassword: z.string(),
    acceptedTerms: z
      .boolean()
      .refine((value) => value, COPY.validation.consent),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: COPY.validation.confirmation,
  });

export default function useRegister({ navigation, route }) {
  const { establishSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [helpVisible, setHelpVisible] = useState(false);
  const inFlight = useRef(false);
  const pending = useRef(null);
  const mounted = useRef(true);
  const emailParam =
    typeof route?.params?.email === "string" ? route.params.email : "";
  const form = useForm({
    defaultValues: {
      fullName: "",
      email: emailParam,
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const { setValue, setError, clearErrors, getValues, watch, trigger } = form;
  const password = watch("password");
  const confirmation = watch("confirmPassword");

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
  useEffect(() => {
    if (confirmation) trigger("confirmPassword");
  }, [password, confirmation, trigger]);

  const persist = async (payload) => {
    try {
      await establishSession(payload, COPY.registerSuccess);
    } catch {
      if (mounted.current) setFeedback(COPY.accountCreated);
    }
  };

  const onValid = async (values) => {
    if (inFlight.current || pending.current) return;
    if (!CAN_REGISTER) {
      setFeedback(COPY.policiesUnavailable);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setNetworkBusy(true);
    setFeedback(null);
    clearErrors();
    try {
      let payload;
      try {
        payload = await authApi.register(values);
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
                  message: ({
                    fullName: COPY.validation.name,
                    email: COPY.validation.email,
                    password: COPY.validation.password,
                    confirmPassword: COPY.validation.confirmation,
                    acceptedTerms: COPY.validation.consent,
                  })[detail.field] || COPY.errors.validation,
                });
              }
            });
          setFeedback(COPY.errors.validation);
        } else if (error.data?.error?.code === 'ACCOUNT_CREATED_SESSION_FAILED') {
          setFeedback('Your account was created, but sign-in could not be completed. Please switch to Sign in.');
        } else if (error.status === 409) {
          setError("email", { type: "server", message: COPY.errors.duplicate });
          setFeedback(COPY.errors.duplicate);
        } else {
          setFeedback(
            error.status === 429
              ? COPY.errors.rateLimit
              : error.isNetworkError || error.status === 0
                ? COPY.errors.network
                : COPY.errors.server,
          );
        }
        return;
      }
      pending.current = payload;
      if (mounted.current) {
        setPendingSession(payload);
        setNetworkBusy(false);
        setValue("password", "");
        setValue("confirmPassword", "");
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

  const goToLogin = () => {
    if (busy) return;
    const email = getValues("email").trim();
    setValue("password", "");
    setValue("confirmPassword", "");
    navigation.popTo("Login", { email });
  };

  return {
    form,
    busy,
    feedback,
    pendingSession,
    policy,
    helpVisible,
    disabled: busy || Boolean(pendingSession),
    passwordHelperText:
      password.length >= 8 && password.length <= 128
        ? COPY.passwordValid
        : COPY.passwordHint,
    confirmationHelperText: confirmation
      ? confirmation === password
        ? COPY.passwordsMatch
        : COPY.passwordsDiffer
      : COPY.confirmationHint,
    submit: pendingSession ? retrySession : form.handleSubmit(onValid),
    goToLogin,
    openPolicy: setPolicy,
    closePolicy: () => setPolicy(null),
    openHelp: () => setHelpVisible(true),
    closeHelp: () => setHelpVisible(false),
  };
}
