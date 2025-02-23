"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dumbbell } from "lucide-react";
import SearchUser from "@/components/custom/SearchUser";
import ExerciseTable from "@/components/custom/ExerciseTable";
import ActionButtons from "@/components/custom/ActionButtons";

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
  const [formData, setFormData] = useState<FormData>({
    name: "",
    student: "",
    exercises: [],
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleExerciseRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de acesso não encontrado");
        const usersRes = await axios.get("http://localhost:3005/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersRes.data);
      } catch (error) {
        handleError(error, "Failed to load data");
      }
    };
    fetchData();
  }, []);

  const handleUserSelect = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      // Set student name
      setFormData(prev => ({
        ...prev,
        student: `${user.firstName} ${user.lastName}`,
        exercises: []
      }));

      // Fetch user's workout plan
      const planResponse = await axios.get(
        `http://localhost:3005/plan-composition/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Plan Response:", planResponse.data); // Debugging

      // Fetch exercise details for each plan entry
      const exercisesWithDetails = await Promise.all(
        planResponse.data.map(async (planEntry: any) => {
          const exerciseResponse = await axios.get(
            `http://localhost:3005/exercise/${planEntry.exerciseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          console.log("Exercise Response:", exerciseResponse.data); // Debugging

          return {
            day: planEntry.day,
            muscle: exerciseResponse.data.targetBodyPart,
            exercise: exerciseResponse.data.exerciseName,
            sets: planEntry.numberOfSets,
            reps: planEntry.numberOfRepetitions,
            observations: planEntry.observations || ""
          };
        })
      );

      console.log("Exercises with Details:", exercisesWithDetails); // Debugging

      // Update form data with fetched exercises
      setFormData(prev => ({
        ...prev,
        exercises: exercisesWithDetails
      }));

    } catch (error) {
      handleError(error, "Falha ao carregar o plano do usuário");
    }
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || defaultMessage;
    }
    console.error("[Error]", errorMessage);
    setMessage({ type: "error", text: errorMessage });
  };

  const addExercise = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { day: "", muscle: "", exercise: "", sets: 0, reps: 0 }],
    }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...formData.exercises];
    newExercises[index][field] = value as never;
    setFormData((prev) => ({ ...prev, exercises: newExercises }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/plans", formData);
      setMessage({ type: "success", text: "Treino salvo com sucesso!" });
    } catch (error) {
      handleError(error, "Falha ao salvar treino");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
    header: { fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Dumbbell size={32} />
        <h1>Gerenciar Treinos</h1>
      </div>
      <SearchUser users={users} onUserSelect={handleUserSelect} />
      <ExerciseTable
        exercises={formData.exercises}
        onExerciseChange={handleExerciseChange}
        onExerciseRemove={handleExerciseRemove}
      />
      <ActionButtons onAddExercise={addExercise} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}