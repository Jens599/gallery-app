"use client";

import { useLogin } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
  { name: "email" as const, placeholder: "example@example.com" },
  { name: "password" as const, placeholder: "Password123!" },
];

const Login = () => {
  const router = useRouter();
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    );
  }

  const handleLogin = async () => {};

  return (
    <>
      <AuthForm
        formName={"Login"}
        form={form}
        onSubmit={onSubmit}
        isPending={isPending}
        fields={fields}
      />
      {error?.message && (
        <p className="text-destructive mt-2">{error.message}</p>
      )}
    </>
  );
};
export default Login;
