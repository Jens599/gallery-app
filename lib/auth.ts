import { useMutation } from "@tanstack/react-query";

interface LoginResponse {
  status: string;
  data: {
    user: {
      username: string;
      email: string;
      token: string;
    };
  };
}

const login = async (email: string, password: string) => {
  const response = await fetch("http://localhost:3001/api/auth/login", {
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

  return {
    status: data.status,
    data: {
      user: {
        username: data.data.user.username,
        email: data.data.user.email,
        token: data.data.token,
      },
    },
  } as LoginResponse;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
};
