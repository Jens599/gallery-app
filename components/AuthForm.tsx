"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "./ui/input";
import { useState } from "react";
import { z } from "zod";
import { UseFormReturn, Path } from "react-hook-form";
import { useRouter } from "next/navigation";
import React from "react";

type AuthFormProps<T extends z.ZodType> = {
  formName: string;
  form: UseFormReturn<z.infer<T>>;
  fields: { name: Path<z.infer<T>>; placeholder: string }[];
  isPending: boolean;
  onSubmit: (values: z.infer<T>) => void;
};

const AuthForm = <T extends z.ZodType>({
  formName,
  form,
  fields,
  isPending,
  onSubmit,
}: AuthFormProps<T>) => {
  // Independent show/hide state for each password field
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  // Server-side error state
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper to toggle password visibility for a specific field
  const handleTogglePassword = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Expose setAuthError for parent components (Login/Signup) to set server errors
  React.useEffect(() => {
    if (form.formState.errors.root && form.formState.errors.root.message) {
      setAuthError(form.formState.errors.root.message);
    }
  }, [form.formState.errors.root]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formName}</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <div className="text-sm text-red-500" role="alert" aria-live="assertive">
            {authError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" aria-label={`${formName} form`}>
            {fields.map((f, i) => (
              <FormField
                key={`${formName}-${i}`}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {f.name
                        .toString()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </FormLabel>
                    <FormControl>
                      {(f.name.toString() === "password" ||
                        f.name.toString() === "confirm_password") ? (
                        <div className="relative">
                          <Input
                            placeholder={f.placeholder}
                            type={showPassword[f.name.toString()] ? "text" : "password"}
                            aria-label={`${f.name} input`}
                            autoComplete={f.name.toString()}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:bg-red-900"
                            onClick={() => handleTogglePassword(f.name.toString())}
                            aria-label={
                              showPassword[f.name.toString()] ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword[f.name.toString()]}
                            tabIndex={0}
                          >
                            {showPassword[f.name.toString()] ? (
                              <EyeOff size={18} aria-hidden="true" />
                            ) : (
                              <Eye size={18} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <Input
                          placeholder={f.placeholder}
                          aria-label={`${f.name} input`}
                          autoComplete={f.name.toString()}
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={isPending} aria-busy={isPending} className="w-full">
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center"></CardFooter>
    </Card>
  );
};
export default AuthForm;
