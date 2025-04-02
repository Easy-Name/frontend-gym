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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
});
const registerSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório"),
  lastName: z.string().min(1, "O sobrenome é obrigatório"),
  telephone: z.string().min(10, "O telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email(),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

type FormValues = z.infer<typeof loginSchema> | z.infer<typeof registerSchema>;

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const onSubmit = async (values: FormValues) => {
    try {
      setError(null);
      if (isRegistering) {
        const registrationValues = values as z.infer<typeof registerSchema>;
        await axios.post("http://localhost:3005/professor", registrationValues);
        setIsRegistering(false);
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        const { accessToken, refreshToken } = (
          await axios.post("http://localhost:3005/auth/sign-in", loginValues)
        ).data;

        document.cookie = `token=${accessToken}; Path=/; Secure; SameSite=Lax; max-age=86400`;
        document.cookie = `refreshToken=${refreshToken}; Path=/; Secure; SameSite=Lax; max-age=604800`;

        router.push("/manage-users");
      }
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Ocorreu um erro."
          : "Ocorreu um erro inesperado."
      );
    }
  };

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
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                {isRegistering && (
                  <>
                    {(['firstName', 'lastName', 'telephone'] as const).map((field) => (
                      <div key={field} className="grid gap-2">
                        <FormField
                          control={form.control}
                          name={field}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>
                                {field === "firstName"
                                  ? "Nome"
                                  : field === "lastName"
                                  ? "Sobrenome"
                                  : "Telefone"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={
                                    field === "firstName"
                                      ? "Nome"
                                      : field === "lastName"
                                      ? "Sobrenome"
                                      : "Telefone"
                                  }
                                  {...f}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </>
                )}
                {(['email', 'password'] as const).map((field) => (
                  <div key={field} className="grid gap-2">
                    <FormField
                      control={form.control}
                      name={field}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>
                            {field === "email" ? "Email" : "Senha"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={field === "password" ? "password" : "text"}
                              placeholder={
                                field === "email" ? "Email" : "Senha"
                              }
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                <Button type="submit" className="w-full">
                  {isRegistering ? "Registrar" : "Log in"}
                </Button>
              </form>
            </Form>
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
                  form.reset();
                }}
              >
                {isRegistering ? "Log in" : "Registre-se"}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}