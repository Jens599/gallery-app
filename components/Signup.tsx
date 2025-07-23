"use client";

import { useSignup } from "@/lib/auth";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AuthForm from "./AuthForm";

import { toast } from "sonner";
import { useEffect } from "react";

const formSchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username cannot exceed 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers and underscores",
      }),
    email: z
      .string({ message: "Email is required" })
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password cannot exceed 50 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirm_password: z
      .string({ message: "Please confirm your password" })
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

const fields = [
  { name: "username", placeholder: "John_Doe" },
  { name: "email", placeholder: "example@example.com" },
  { name: "password", placeholder: "Password123!" },
  { name: "confirm_password", placeholder: "Password123!" },
];

const Signup = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const { mutate: signup, isPending, error } = useSignup();

  useEffect(() => {
    if (error?.message) {
      // Set error in form for AuthForm to display
      form.setError("root", { message: error.message });
      // Clear password fields for security
      form.setValue("password", "");
      form.setValue("confirm_password", "");
      toast.error("Uh oh! Something went wrong.", {
        duration: 5000,
        description: error.message,
      });
    }
  }, [error]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    signup(
      {
        username: values.username,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Signed up successfully!", {
            duration: 5000,
          });
          router.push("/gallery");
        },
      },
    );
  }

  return (
    <>
      <AuthForm
        formName={"Signup"}
        form={form}
        onSubmit={onSubmit}
        isPending={isPending}
        fields={fields}
      />
    </>
  );
};
export default Signup;
