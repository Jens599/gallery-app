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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "./ui/input";
import { useState } from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

type AuthFormProps<T extends z.ZodType> = {
  formName: string;
  form: UseFormReturn<z.infer<T>>;
  fields: { name: string; placeholder: string }[];
  onSubmit: (values: z.infer<T>) => void;
};

const AuthForm = <T extends z.ZodType>({
  formName,
  form,
  fields,
  onSubmit,
}: AuthFormProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{formName}</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((f, i) => (
              <FormField
                // key={`${formName}-${i}`}
                control={form.control}
                name={`${f.name}` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {f.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </FormLabel>
                    <FormControl>
                      {f.name === "password" ||
                      f.name === "confirm_password" ? (
                        <div className="relative">
                          <Input
                            placeholder={f.placeholder}
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute top-1/2 right-2 -translate-y-1/2"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      ) : (
                        <Input placeholder={f.placeholder} {...field} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
export default AuthForm;
