"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, Search } from "lucide-react";

type Exercise = {
  id: number;
  exerciseName: string;
  targetBodyPart: string;
  exerciseVideoLink?: string;
};

export default function ManageExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState({
    exerciseName: "",
    targetBodyPart: "",
    exerciseVideoLink: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    const results = exercises.filter(
      (ex) =>
        ex.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.targetBodyPart.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExercises(results);
  }, [searchTerm, exercises]);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3005/exercise", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExercises(response.data);
      setFilteredExercises(response.data);
    } catch (error) {
      handleError(error, "Falha ao carregar exercícios");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3005/exercise",
        {
          ...formData,
          exerciseVideoLink: formData.exerciseVideoLink || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ type: "success", text: "Exercício criado com sucesso!" });
      setFormData({
        exerciseName: "",
        targetBodyPart: "",
        exerciseVideoLink: "",
      });
      await fetchExercises();
    } catch (error) {
      handleError(error, "Falha ao criar exercício");
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || defaultMessage;
    }
    setMessage({ type: "error", text: errorMessage });
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
    header: {
      fontSize: "2rem",
      fontWeight: 700,
      marginBottom: "2rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "2rem",
      backgroundColor: "white",
    },
    tableHeader: {
      background: "#f8fafc",
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: 600,
      borderBottom: "2px solid #e2e8f0",
    },
    tableCell: { padding: "1rem", borderBottom: "1px solid #e2e8f0" },
    input: {
      padding: "0.5rem",
      borderRadius: "0.25rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "0.875rem",
    },
    searchContainer: { position: "relative" as const, marginBottom: "1.5rem" },
    searchInput: {
      padding: "0.75rem 2.5rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "1rem",
    },
    searchIcon: {
      position: "absolute" as const,
      left: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b",
    },
    dropdown: {
      position: "absolute" as const,
      width: "100%",
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      marginTop: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
    },
    dropdownItem: {
      padding: "0.75rem 1rem",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#f8fafc" },
    },
    videoLink: {
      color: "#3b82f6",
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Activity size={32} />
        <h1>Gerenciar Exercícios</h1>
      </div>

      {message && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "0.375rem",
            backgroundColor:
              message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.searchContainer}>
        <Search size={20} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar exercícios..."
          style={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <div style={styles.dropdown}>
            {filteredExercises.slice(0, 5).map((exercise) => (
              <div
                key={exercise.id}
                style={styles.dropdownItem}
                onClick={() => {
                  setSearchTerm(exercise.exerciseName);
                }}
              >
                {exercise.exerciseName} ({exercise.targetBodyPart})
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          marginBottom: "2rem",
        }}
      >
        <div>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
          >
            Nome do Exercício
          </label>
          <input
            style={styles.input}
            value={formData.exerciseName}
            onChange={(e) =>
              setFormData({ ...formData, exerciseName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
          >
            Grupo Muscular
          </label>
          <input
            style={styles.input}
            value={formData.targetBodyPart}
            onChange={(e) =>
              setFormData({ ...formData, targetBodyPart: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
          >
            Video de Execução (Opcional)
          </label>
          <input
            style={styles.input}
            value={formData.exerciseVideoLink}
            onChange={(e) =>
              setFormData({ ...formData, exerciseVideoLink: e.target.value })
            }
            placeholder="Cole o link do YouTube/Vimeo"
            type="url"
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: "#3b82f6",
            color: "white",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? "Salvando..." : "Adicionar Exercício"}
        </button>
      </form>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nome</th>
            <th style={styles.tableHeader}>Grupo Muscular</th>
            <th style={styles.tableHeader}>Execução</th>
          </tr>
        </thead>
        <tbody>
          {filteredExercises.map((exercise) => (
            <tr key={exercise.id}>
              <td style={styles.tableCell}>{exercise.exerciseName}</td>
              <td style={styles.tableCell}>{exercise.targetBodyPart}</td>
              <td style={styles.tableCell}>
                {exercise.exerciseVideoLink && (
                  <a
                    href={
                      exercise.exerciseVideoLink.startsWith("http")
                        ? exercise.exerciseVideoLink
                        : `https://${exercise.exerciseVideoLink}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.videoLink}
                  >
                    Ver Demonstração
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}