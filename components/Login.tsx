"use client";

import { useLogin } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AuthForm from "./AuthForm";
import { toast } from "sonner";

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

  useEffect(() => {
    if (error?.message) {
      toast.error("Uh oh! Something went wrong.", {
        duration: 5000,
        description: error.message,
      });
    }
  }, [error]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    login(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success("Logged in successfully!", {
            duration: 5000,
          });
        },
      },
    );
  }

  return (
    <>
      <AuthForm
        formName={"Login"}
        form={form}
        onSubmit={onSubmit}
        isPending={isPending}
        fields={fields}
      />
    </>
  );
};
export default Login;
