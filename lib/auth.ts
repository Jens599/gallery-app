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
  const response = await fetch("/api/auth/login", {
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
