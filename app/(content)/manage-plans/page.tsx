"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Dumbbell, Search, Calendar, Plus, Save, MessageCircle } from "lucide-react";

type Exercise = {
  day: string;
  muscle: string;
  exercise: string;
  sets: number;
  reps: number;
  observations?: string;
};

type WorkoutPlan = {
  id: number;
  name: string;
  student: string;
  exercises: Exercise[];
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
};

type FormData = Omit<WorkoutPlan, "id">;

export default function ManageWorkoutsPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    student: "",
    exercises: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const muscleGroups = ["Peito", "Costas", "Pernas", "Ombro", "Bíceps", "Tríceps"];
  const exercisesByMuscle = {
    Peito: ["Supino Reto", "Supino Inclinado", "Crucifixo"],
    Costas: ["Puxada Alta", "Remada Curvada", "Pull-down"],
    Pernas: ["Agachamento", "Leg Press", "Cadeira Extensora"],
    Ombro: ["Desenvolvimento", "Elevação Lateral", "Remada Alta"],
    Bíceps: ["Rosca Direta", "Rosca Scott", "Rosca Concentrada"],
    Tríceps: ["Tríceps Corda", "Francês", "Mergulho"],
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
    header: { fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" },
    searchContainer: {
      position: "relative",
      marginBottom: "2rem",
      width: "100%",
      zIndex: 50
    },
    searchInput: {
      padding: "0.75rem 2.5rem 0.75rem 1rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "1rem",
      backgroundColor: "white",
    },
    searchIcon: {
      position: "absolute",
      right: "1rem",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#64748b"
    },
    dropdownContainer: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      maxHeight: "200px",
      overflowY: "auto",
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      zIndex: 51,
    },
    dropdownItem: {
      padding: "0.75rem 1rem",
      cursor: "pointer",
      transition: "background-color 0.2s",
      backgroundColor: "white",
      "&:hover": {
        backgroundColor: "#f8fafc",
      },
    },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "2rem", backgroundColor: "white" },
    tableHeader: {
      background: "#f8fafc",
      padding: "1rem",
      textAlign: "left" as const,
      fontWeight: 600,
      borderBottom: "2px solid #e2e8f0",
    },
    tableCell: {
      padding: "1rem",
      borderBottom: "1px solid #e2e8f0",
      "&:last-child": { width: "250px" }
    },
    input: {
      padding: "0.5rem",
      borderRadius: "0.25rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "0.875rem",
    },
    button: {
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    actionButtons: { display: "flex", gap: "1rem", marginTop: "2rem" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de acesso não encontrado");

        const usersRes = await axios.get("http://localhost:3005/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data);
        setFilteredUsers([]);
      } catch (error) {
        handleError(error, "Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase()) ||
      user.telephone.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user: User) => {
    setFormData(prev => ({
      ...prev,
      student: `${user.firstName} ${user.lastName}`
    }));
    setSearchTerm(`${user.firstName} ${user.lastName}`);
    setFilteredUsers([]);
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || defaultMessage;
    }
    console.error('[Error]', errorMessage);
    setMessage({ type: "error", text: errorMessage });
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { day: "", muscle: "", exercise: "", sets: 0, reps: 0 }]
    }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...formData.exercises];
    newExercises[index][field] = value as never;
    setFormData(prev => ({ ...prev, exercises: newExercises }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/plans", formData);
      setMessage({ type: "success", text: "Treino salvo com sucesso!" });
    } catch (error) {
      handleError(error, "Failed to save workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Dumbbell size={32} />
        <h1>Gerenciar Treinos</h1>
      </div>

      <div style={styles.searchContainer}>
        <input
          style={styles.searchInput}
          placeholder="Pesquisar aluno..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          autoComplete="off"
        />
        <Search size={20} style={styles.searchIcon} />

        {searchTerm.trim() !== '' && filteredUsers.length > 0 && (
          <div style={styles.dropdownContainer}>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  ...styles.dropdownItem,
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
                onClick={() => handleUserSelect(user)}
              >
                {`${user.firstName} ${user.lastName} - ${user.email}`}
              </div>
            ))}
          </div>
        )}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Dia</th>
            <th style={styles.tableHeader}>Músculo</th>
            <th style={styles.tableHeader}>Exercício</th>
            <th style={styles.tableHeader}>Séries</th>
            <th style={styles.tableHeader}>Repetições</th>
            <th style={styles.tableHeader}>Observações</th>
          </tr>
        </thead>
        <tbody>
          {formData.exercises.map((exercise, index) => (
            <tr key={index}>
              <td style={styles.tableCell}>
                <select
                  style={styles.input}
                  value={exercise.day}
                  onChange={(e) => handleExerciseChange(index, "day", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {["A", "B", "C", "D", "E", "F"].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </td>
              <td style={styles.tableCell}>
                <select
                  style={styles.input}
                  value={exercise.muscle}
                  onChange={(e) => handleExerciseChange(index, "muscle", e.target.value)}
                >
                  <option value="">Selecione</option>
                  {muscleGroups.map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </td>
              <td style={styles.tableCell}>
                <select
                  style={styles.input}
                  value={exercise.exercise}
                  onChange={(e) => handleExerciseChange(index, "exercise", e.target.value)}
                  disabled={!exercise.muscle}
                >
                  <option value="">Selecione</option>
                  {exercisesByMuscle[exercise.muscle as keyof typeof exercisesByMuscle]?.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </td>
              <td style={styles.tableCell}>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(index, "sets", parseInt(e.target.value))}
                />
              </td>
              <td style={styles.tableCell}>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(index, "reps", parseInt(e.target.value))}
                />
              </td>
              <td style={styles.tableCell}>
                <input
                  style={styles.input}
                  type="text"
                  value={exercise.observations || ""}
                  onChange={(e) => handleExerciseChange(index, "observations", e.target.value)}
                  placeholder="Opcional"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.actionButtons}>
        <button
          style={{ ...styles.button, background: "#3b82f6", color: "white" }}
          onClick={addExercise}
        >
          <Plus size={16} />
          Adicionar Exercício
        </button>
        <button
          style={{ ...styles.button, background: "#10b981", color: "white" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          <Save size={16} />
          {loading ? "Salvando..." : "Salvar Treino"}
        </button>
        <button
          style={{ ...styles.button, background: "#8b5cf6", color: "white" }}
        >
          <MessageCircle size={16} />
          Enviar Mensagem
        </button>
      </div>
    </div>
  );
}
