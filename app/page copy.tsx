"use client";

import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  PasswordInput
} from "@/components/ui/password-input"

const formSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8).max(50),
});

export default function LoginForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    /*defaultValues: {
      email: "",
      senha: "",
    },*/
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("http://localhost:3005/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });


console.log(response.body);

      if (!response.ok) {
        console.log(response);
        throw new Error("Login failed");
      }

      const data = await response.json();

      // Assuming the response contains `token` and `refreshToken`
      const { token, refreshToken } = data;

      // Store tokens in local storage
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      console.log("Login successful, tokens stored:", { token, refreshToken });

      // Optionally, redirect the user or update the UI
      // window.location.href = "/dashboard";

    } catch (error) {
      console.error("Login error:", error);
      // Optionally, display an error message to the user
    }
  }

  return (
    <main className="flex h-screen justify-center items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>
            Entre na sua conta para gerenciar seus alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
                          <Input placeholder="Digite seu email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="Digite sua senha" {...field} />
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
