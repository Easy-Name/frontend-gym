"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { User, Lock, Mail, Phone, LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

export default function AdminPage() {
  useAuth(); // Handles all authentication checks
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    telephone: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
  });

  useEffect(() => {
    const fetchProfessorData = async () => {
      try {
        const token = getCookie('token');
        const response = await axios.get("http://172.40.3.140:3005/professor/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { firstName, lastName, email, telephone } = response.data;
        setUserData({ firstName, lastName, email, telephone });
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          email,
          telephone,
        }));
      } catch (error) {
        console.error("Erro ao carregar informações:", error);
        setMessage({
          type: "error",
          text: "Falha ao carregar dados do professor"
        });
      }
    };

    fetchProfessorData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = getCookie('token');
      if (formData.password && formData.password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      const filteredData = Object.keys(formData).reduce((acc, key) => {
        const formKey = key as keyof typeof formData;
        if (formData[formKey] !== "") {
          acc[formKey] = formData[formKey];
        }
        return acc;
      }, {} as Partial<typeof formData>);

      await axios.patch(
        "http://172.40.3.140:3005/professor/me",
        filteredData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(prev => ({ ...prev, ...filteredData }));
      setMessage({ type: "success", text: "Informações atualizadas com sucesso!" });
      setFormData(prev => ({ ...prev, password: "" }));
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar informações"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/";
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
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="firstName"
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

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span>Sair</span>
      </button>
    </div>
  );
}
