export const REGISTER_COPY = {
  registerEmail: "Email address",
  fullName: "Full name",
  password: "Password",
  confirmation: "Confirm password",
  back: "Back to sign in",
  registerTitle: "Create your SkinMate account",
  registerBadge: "A gentle skincare journey",
  registerDescription:
    "Begin your journey of listening to and caring for your skin.",
  registerAction: "Create account",
  registerSuccess: "Account created successfully. Welcome to SkinMate!",
  hasAccount: "Already have an account?",
  loginAction: "Sign in",
  namePlaceholder: "Alex Morgan",
  emailPlaceholder: "name@example.com",
  passwordPlaceholder: "Enter your password",
  confirmationPlaceholder: "Re-enter your password",
  nameHint: "Enter your full name so SkinMate can support you",
  emailHint: "Use this email to sign in to your SkinMate account.",
  passwordHint: "Password must be 8 to 128 characters",
  passwordValid: "Password length meets the requirement",
  confirmationHint: "Re-enter the exact password you created",
  passwordsMatch: "Passwords match",
  passwordsDiffer: "Passwords do not match",
  consent: "I agree to SkinMate's Terms of Service and Privacy Policy.",
  consentPrefix: "I agree to",
  terms: "Terms of Service",
  and: "and",
  privacy: "Privacy Policy",
  retrySession: "Save session again",
  accountCreated:
    "Your account was created, but the sign-in session could not be saved. Try saving the session again or switch to Sign in.",
  policiesUnavailable:
    "Account creation is not ready yet. Please come back later.",
  validation: {
    name: "Please enter a full name between 2 and 100 characters.",
    email: "Please enter a valid email address.",
    emailLong: "Email must not exceed 254 characters.",
    password: "Password must be 8 to 128 characters.",
    confirmation: "Passwords do not match.",
    consent: "You must agree to the Terms of Service and Privacy Policy.",
  },
  errors: {
    validation: "Please check the information you entered.",
    duplicate: "This email is already registered. You can switch to Sign in.",
    rateLimit: "Too many attempts. Please wait and try again.",
    network: "The connection was interrupted, so the result could not be confirmed. Check your network and try again, or sign in if your account was created.",
    server: "We couldn't complete the request. Please try again later.",
  },
};

// Replace these drafts with approved documents before release.
export const POLICIES = {
  terms: {
    title: REGISTER_COPY.terms,
    published: false,
    version: "development-only",
    paragraphs: [
      "DRAFT CONTENT — FOR DEVELOPMENT ONLY.",
      "This is test content for the account creation flow, not official Terms of Service. Use test data only in development environments.",
    ],
  },
  privacy: {
    title: REGISTER_COPY.privacy,
    published: false,
    version: "development-only",
    paragraphs: [
      "DRAFT CONTENT — FOR DEVELOPMENT ONLY.",
      "The official Privacy Policy has not been published. This content is for interface testing only; do not use real personal information in development.",
    ],
  },
};

export const CAN_REGISTER =
  __DEV__ || (POLICIES.terms.published && POLICIES.privacy.published);
