import axiosClient from "./axiosClient";

const unwrap = (body) => {
  if (body?.success !== true || !body.data)
    throw new Error("INVALID_AUTH_RESPONSE");
  return body.data;
};

const register = async ({
  fullName,
  email,
  password,
  confirmPassword,
  acceptedTerms,
}) =>
  unwrap(
    await axiosClient.post(
      "/auth/register",
      {
        fullName,
        email,
        password,
        confirmPassword,
        acceptedTerms,
      },
      { timeout: 15000 },
    ),
  );

const login = async ({ email, password }) =>
  unwrap(
    await axiosClient.post(
      "/auth/login",
      { email, password },
      { timeout: 15000 },
    ),
  );

export default { register, login };
