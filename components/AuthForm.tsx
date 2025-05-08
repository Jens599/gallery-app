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
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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
          <div className="text-sm text-red-500" role="alert">
            {authError}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      {f.name.toString() === "password" ||
                      f.name.toString() === "confirm_password" ? (
                        <div className="relative">
                          <Input
                            placeholder={f.placeholder}
                            type={showPassword ? "text" : "password"}
                            aria-label={`${f.name} input`}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                          >
                            {showPassword ? (
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
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          {formName === "Login"
            ? "Don't have an account?"
            : "Already have an account?"}
        </p>
      </CardFooter>
    </Card>
  );
};
export default AuthForm;
