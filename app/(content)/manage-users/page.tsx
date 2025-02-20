"use client";

import { useState, useEffect } from "react";
import axios from "axios";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
};

type FormData = Omit<User, "id">;

export default function CRUDPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
  });
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeOperation, setActiveOperation] = useState<
      "create" | "update" | "delete" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
      null
  );

  // Estilos
  const styles = {
    container: { maxWidth: "1000px", margin: "0 auto", padding: "20px" },
    header: { fontSize: "24px", fontWeight: "bold", marginBottom: "30px" },
    buttonGroup: { marginBottom: "30px", display: "flex", gap: "10px" },
    button: {
      padding: "10px 20px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "all 0.3s",
    },
    formContainer: { marginBottom: "30px", background: "#f5f5f5", padding: "20px", borderRadius: "8px" },
    formTitle: { marginBottom: "15px", fontSize: "20px" },
    inputGroup: { marginBottom: "15px", display: "grid", gap: "10px" },
    input: {
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ddd",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
    tableHeader: {
      background: "#f5f5f5",
      padding: "12px",
      textAlign: "left" as const
    },
    tableCell: { padding: "12px", borderBottom: "1px solid #ddd" },
    message: {
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "20px",
      background: "#4CAF50",
      color: "white",
    },
    error: { background: "#f44336" },
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de acesso não encontrado");

        const response = await axios.get("http://localhost:3005/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(response.data);
      } catch (error) {
        handleError(error, "Falha ao carregar usuários");
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de acesso não encontrado");

      await axios.post(
          "http://localhost:3005/users/me",
          { ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers([...users, { ...formData, id: Date.now() }]);
      resetForm();
      setMessage({ type: "success", text: "Usuário criado com sucesso" });
    } catch (error) {
      handleError(error, "Falha ao criar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de acesso não encontrado");

      await axios.patch(
          `http://localhost:3005/users/me/${selectedUserId}`,
          { ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUsers = users.map((user) =>
          user.id === selectedUserId ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
      resetForm();
      setMessage({ type: "success", text: "Usuário atualizado com sucesso" });
    } catch (error) {
      handleError(error, "Falha ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de acesso não encontrado");

      await axios.delete(`http://localhost:3005/users/me/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((user) => user.id !== selectedUserId));
      resetForm();
      setMessage({ type: "success", text: "Usuário excluído com sucesso" });
    } catch (error) {
      handleError(error, "Falha ao excluir usuário");
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUserId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      telephone: user.telephone,
    });
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", telephone: "" });
    setSelectedUserId(null);
    setActiveOperation(null);
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    console.error(message);
    setMessage({ type: "error", text: message });
  };

  return (
      <div style={styles.container}>
        <h1 style={styles.header}>Gerenciamento de Usuários</h1>

        {message && (
            <div
                style={{
                  ...styles.message,
                  ...(message.type === "error" ? styles.error : {}),
                }}
            >
              {message.text}
            </div>
        )}

        <div style={styles.buttonGroup}>
          <button
              style={{ ...styles.button, background: "#4CAF50", color: "white" }}
              onClick={() => setActiveOperation("create")}
          >
            Criar Usuário
          </button>
          <button
              style={{ ...styles.button, background: "#2196F3", color: "white" }}
              onClick={() => setActiveOperation("update")}
          >
            Atualizar Usuário
          </button>
          <button
              style={{ ...styles.button, background: "#f44336", color: "white" }}
              onClick={() => setActiveOperation("delete")}
          >
            Excluir Usuário
          </button>
        </div>

        {(activeOperation === "create" || activeOperation === "update") && (
            <div style={styles.formContainer}>
              <h2 style={styles.formTitle}>
                {activeOperation === "create" ? "Novo Usuário" : "Editar Usuário"}
              </h2>
              <form onSubmit={activeOperation === "create" ? handleCreate : handleUpdate}>
                <div style={styles.inputGroup}>
                  {activeOperation === "update" && (
                      <select
                          style={styles.input}
                          value={selectedUserId || ""}
                          onChange={(e) => {
                            const userId = parseInt(e.target.value, 10);
                            const user = users.find((u) => u.id === userId);
                            if (user) selectUser(user);
                          }}
                          required
                      >
                        <option value="" disabled>
                          Selecione um usuário
                        </option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </option>
                        ))}
                      </select>
                  )}

                  <input
                      style={styles.input}
                      name="firstName"
                      placeholder="Nome"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                  />
                  <input
                      style={styles.input}
                      name="lastName"
                      placeholder="Sobrenome"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                  />
                  <input
                      style={styles.input}
                      name="email"
                      type="email"
                      placeholder="E-mail"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                  />
                  <input
                      style={styles.input}
                      name="telephone"
                      type="tel"
                      placeholder="Telefone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                  />
                </div>
                <button
                    style={{
                      ...styles.button,
                      background: activeOperation === "create" ? "#4CAF50" : "#2196F3",
                      color: "white",
                      width: "100%",
                    }}
                    type="submit"
                    disabled={loading}
                >
                  {loading ? "Processando..." : activeOperation === "create" ? "Criar" : "Atualizar"}
                </button>
              </form>
            </div>
        )}

        {activeOperation === "delete" && (
            <div style={styles.formContainer}>
              <h2 style={styles.formTitle}>Excluir Usuário</h2>
              <form onSubmit={handleDelete}>
                <div style={styles.inputGroup}>
                  <select
                      style={styles.input}
                      value={selectedUserId || ""}
                      onChange={(e) => {
                        const userId = parseInt(e.target.value, 10);
                        const user = users.find((u) => u.id === userId);
                        if (user) selectUser(user);
                      }}
                      required
                  >
                    <option value="" disabled>
                      Selecione um usuário
                    </option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </option>
                    ))}
                  </select>
                </div>
                <button
                    style={{
                      ...styles.button,
                      background: "#f44336",
                      color: "white",
                      width: "100%",
                    }}
                    type="submit"
                    disabled={loading}
                >
                  {loading ? "Excluindo..." : "Confirmar Exclusão"}
                </button>
              </form>
            </div>
        )}

        <div>
          <h2 style={{ marginBottom: "15px" }}>Lista de Usuários</h2>
          <table style={styles.table}>
            <thead>
            <tr>
              <th style={styles.tableHeader}>Nome</th>
              <th style={styles.tableHeader}>Sobrenome</th>
              <th style={styles.tableHeader}>E-mail</th>
              <th style={styles.tableHeader}>Telefone</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => (
                <tr key={user.id}>
                  <td style={styles.tableCell}>{user.firstName}</td>
                  <td style={styles.tableCell}>{user.lastName}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>{user.telephone}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}