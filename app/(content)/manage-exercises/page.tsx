"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Activity, Search } from "lucide-react";
import useAuth from "@/hooks/useAuth";

type Exercise = {
  id: number;
  exerciseName: string;
  targetBodyPart: string;
  exerciseVideoLink?: string;
};

export default function ManageExercisesPage() {
  useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
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
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Activity size={32} />
        <h1>Visualizar Exercícios</h1>
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
