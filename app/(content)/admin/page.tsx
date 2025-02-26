"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { User, Lock, Mail, Phone } from "lucide-react";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    telephone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch professor's data on component mount
  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de autenticação não encontrado");

        const response = await axios.get("http://localhost:3005/professor/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { firstName, lastName, email, telephone } = response.data;

        // Update formData with fetched data (excluding password)
        setFormData((prev) => ({
          ...prev,
          firstName,
          lastName,
          email,
          telephone,
        }));
      } catch (error) {
        console.error("Erro ao carregar informações do professor:", error);
      }
    };

    fetchProfessorData();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      // Validate password and confirm password
      if (formData.password && formData.password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      // Filter out empty fields
      const filteredData = Object.keys(formData).reduce((acc, key) => {
        const formKey = key as keyof typeof formData; // Type assertion
        if (formData[formKey] !== "") {
          acc[formKey] = formData[formKey];
        }
        return acc;
      }, {} as Partial<typeof formData>); // Use Partial to allow only some fields

      const response = await axios.patch(
        "http://localhost:3005/professor/me",
        filteredData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({
        type: "success",
        text: "Informações atualizadas com sucesso!",
      });
      console.log("Dados atualizados:", response.data);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar informações",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <User className="w-8 h-8" />
        Configurações do Professor
      </h1>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Nome */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="name"
              className="font-medium flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Nome
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>
          {/* Sobrenome */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="lastName"
              className="font-medium flex items-center gap-2"
            >
              <User className="w-5 h-5" />
              Sobrenome
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Seu sobrenome"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="email"
              className="font-medium flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          {/* Telefone */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="telephone"
              className="font-medium flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Telefone
            </label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Nova Senha */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="password"
              className="font-medium flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Nova Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
            />
            <p className="text-sm text-gray-500">
              Deixe em branco para manter a senha atual
            </p>
          </div>

          {/* Confirmar Nova Senha (Conditional Rendering) */}
          {formData.password && (
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="confirmPassword"
                className="font-medium flex items-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <User className="w-5 h-5" />
              <span>Atualizar Informações</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
