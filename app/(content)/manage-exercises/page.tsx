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

const muscleGroups = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Glúteos",
  "Cardio",
  "Alongamento"
];

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      color: "#1e293b",
    },
    sectionHeader: {
      fontSize: "1.5rem",
      fontWeight: 600,
      margin: "2rem 0 1.5rem",
      color: "#1e293b",
      paddingBottom: "0.5rem",
      borderBottom: "2px solid #e2e8f0",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "2rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      borderRadius: "0.5rem",
      overflow: "hidden",
    },
    tableHeader: {
      background: "#f8fafc",
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: 600,
      color: "#64748b",
      borderBottom: "2px solid #e2e8f0",
    },
    tableCell: {
      padding: "1rem",
      borderBottom: "1px solid #e2e8f0",
      color: "#475569",
    },
    input: {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "0.875rem",
      transition: "all 0.2s",
      "&:focus": {
        outline: "none",
        borderColor: "#93c5fd",
        boxShadow: "0 0 0 3px rgba(147, 197, 253, 0.5)",
      },
    },
    select: {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "0.875rem",
      backgroundColor: "white",
      appearance: "none" as const,
      backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "1em",
      transition: "all 0.2s",
      "&:focus": {
        outline: "none",
        borderColor: "#93c5fd",
        boxShadow: "0 0 0 3px rgba(147, 197, 253, 0.5)",
      },
    },
    searchContainer: {
      position: "relative" as const,
      marginBottom: "1.5rem",
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    searchInput: {
      padding: "0.875rem 3rem",
      borderRadius: "0.75rem",
      border: "none",
      width: "100%",
      fontSize: "1rem",
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 3px rgba(147, 197, 253, 0.5)",
      },
    },
    searchIcon: {
      position: "absolute" as const,
      left: "1.25rem",
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
      padding: "0.75rem 1.5rem",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#f8fafc" },
    },
    videoLink: {
      color: "#3b82f6",
      textDecoration: "none",
      fontWeight: 500,
      "&:hover": { textDecoration: "underline" },
    },
    formContainer: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      padding: "2rem",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      marginBottom: "2rem",
    },
    submitButton: {
      padding: "0.875rem 1.75rem",
      borderRadius: "0.75rem",
      backgroundColor: "#3b82f6",
      color: "white",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      opacity: 1,
      transition: "all 0.2s",
      marginTop: "1.5rem",
      "&:hover": {
        backgroundColor: "#2563eb",
        transform: "translateY(-1px)",
      },
      "&:disabled": {
        opacity: 0.7,
        cursor: "not-allowed",
      },
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
            marginBottom: "1.5rem",
            borderRadius: "0.75rem",
            backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
            color: message.type === "success" ? "#166534" : "#991b1b",
            fontWeight: 500,
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}
        />
        {isDropdownOpen && searchTerm && (
          <div style={styles.dropdown}>
            {filteredExercises.slice(0, 5).map((exercise) => (
              <div
                key={exercise.id}
                style={styles.dropdownItem}
                onClick={() => {
                  setSearchTerm(exercise.exerciseName);
                  setFilteredExercises([exercise]);
                  setIsDropdownOpen(false);
                }}
              >
                {exercise.exerciseName} ({exercise.targetBodyPart})
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 style={styles.sectionHeader}>Adicionar Novo Exercício</h2>

      <form
        onSubmit={handleSubmit}
        style={styles.formContainer}
      >
        <div style={{
          display: "grid",
          gap: "1.5rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          marginBottom: "0.5rem"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 500, color: "#374151" }}>
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
            <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 500, color: "#374151" }}>
              Grupo Muscular
            </label>
            <select
              style={styles.select}
              value={formData.targetBodyPart}
              onChange={(e) =>
                setFormData({ ...formData, targetBodyPart: e.target.value })
              }
              required
            >
              <option value="" disabled>Selecione um grupo muscular</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 500, color: "#374151" }}>
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
        </div>

        <button
          type="submit"
          style={styles.submitButton}
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
            <tr key={exercise.id} style={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
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