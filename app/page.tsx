"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null); // State for error message

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setError(null); // Clear any previous errors

      const response = await axios.post("http://localhost:3005/auth/sign-in", {
        email: values.email,
        password: values.password,
      });

      const { token, refreshToken } = response.data;

      // Store tokens in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      //console.log("Login successful, tokens stored:", { token, refreshToken });

      // Redirect or update UI as needed
    } catch (error) {
      console.error("Login failed:", error);

      // Set error message based on the error
      if (axios.isAxiosError(error)) {
        // Handle Axios-specific errors
        setError("Credenciais inválidas");
        //setError(error.response?.data?.message || "An error occurred during login.");
      } else {
        // Handle generic errors
        setError("An unexpected error occurred.");
      }
    }
  }

  return (
    <main className="flex h-screen justify-center items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Display error message if exists */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Log in
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="mt-4 text-center text-sm">
            Ainda não possui uma conta?{" "}
            <Link href="#" className="underline">
              Registre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
