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
import { useRouter } from "next/navigation";

// Schema for login form
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});

// Schema for registration form
const registerSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório"),
  lastName: z.string().min(1, "O sobrenome é obrigatório"),
  telephone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

// Define a union type for the form values
type FormValues = z.infer<typeof loginSchema> | z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between login and register
  const [error, setError] = useState<string | null>(null); // State for error message
  const router = useRouter();

  // Use the appropriate schema based on the form type
  const form = useForm<FormValues>({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      telephone: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: FormValues) {
    try {
      setError(null); // Clear any previous errors

      if (isRegistering) {
        // Narrow the type to registration values
        const registrationValues = values as z.infer<typeof registerSchema>;

        // Handle registration
        const response = await axios.post("http://localhost:3005/professor", {
          firstName: registrationValues.firstName,
          lastName: registrationValues.lastName,
          telephone: registrationValues.telephone,
          email: registrationValues.email,
          password: registrationValues.password,
        });

        console.log("Registration successful:", response.data);
        setIsRegistering(false); // Switch back to login form after successful registration
      } else {
        // Narrow the type to login values
        const loginValues = values as z.infer<typeof loginSchema>;

        // Handle login
        const response = await axios.post(
          "http://localhost:3005/auth/sign-in",
          {
            email: loginValues.email,
            password: loginValues.password,
          }
        );

        const { accessToken, refreshToken } = response.data;

        // Store tokens in local storage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        console.log("Login successful, tokens stored:", {
          accessToken,
          refreshToken,
        });
        router.push("/manage-users");
      }
    } catch (error) {
      console.error("Error:", error);

      // Set error message based on the error
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Ocorreu um erro.");
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    }
  }

  return (
    <main className="flex h-screen justify-center items-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {isRegistering ? "Registre-se" : "Log in"}
          </CardTitle>
          <CardDescription>
            {isRegistering
              ? "Crie sua conta para gerenciar seus alunos"
              : "Acesse sua conta para gerenciar seus alunos"}
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
                {isRegistering && (
                  <>
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sobrenome</FormLabel>
                            <FormControl>
                              <Input placeholder="Sobrenome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="Telefone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

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
                    {isRegistering ? "Registrar" : "Log in"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="mt-4 text-center text-sm">
            {isRegistering
              ? "Já possui uma conta? "
              : "Ainda não possui uma conta? "}
            <Link
              href="#"
              className="underline"
              onClick={(e) => {
                e.preventDefault();
                setIsRegistering(!isRegistering);
                form.reset(); // Reset form fields when switching
              }}
            >
              {isRegistering ? "Log in" : "Registre-se"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
