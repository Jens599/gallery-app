import { useMutation } from "@tanstack/react-query";
import { AUTH_URLS } from "./urls";

const login = async (email: string, password: string) => {
  const response = await fetch(AUTH_URLS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }

  const data = await response.json();

  localStorage.setItem("username", data.data.user.username);
  localStorage.setItem("email", data.data.user.email);
  localStorage.setItem("token", data.data.token);

  window.dispatchEvent(new Event("authChange"));
};

const signup = async (username: string, email: string, password: string) => {
  const response = await fetch(AUTH_URLS.SIGNUP, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed Signup");
  }

  const data = await response.json();

  localStorage.setItem("username", data.data.user.username);
  localStorage.setItem("email", data.data.user.email);
  localStorage.setItem("token", data.data.token);

  window.dispatchEvent(new Event("authChange"));
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => signup(username, email, password),
  });
};
