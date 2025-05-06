"use client";

import { useLogin } from "@/lib/auth";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AuthForm from "./AuthForm";

const formSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({ message: "Password is required" })
    .min(1, { message: "Password is required" }),
});

const fields = [
  { name: "email", placeholder: "example@example.com" },
  { name: "password", placeholder: "Password123!" },
];

const Login = () => {
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const handleLogin = async () => {};

  return (
    <AuthForm
      formName={"Login"}
      form={form}
      onSubmit={onSubmit}
      fields={fields}
    />
  );
};
export default Login;
