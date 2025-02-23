"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dumbbell } from "lucide-react";
import SearchUser from "@/components/custom/SearchUser";
import ExerciseTable from "@/components/custom/ExerciseTable";
import ActionButtons from "@/components/custom/ActionButtons";

type Exercise = {
  planCompositionId?: number;
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

type FormData = Omit<WorkoutPlan, "id"> & { userId?: number };

export default function ManageWorkoutsPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    student: "",
    exercises: [],
    userId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [originalPlanCompositionIds, setOriginalPlanCompositionIds] = useState<number[]>([]);

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

      // Reset form data
      setFormData({
        name: "",
        student: `${user.firstName} ${user.lastName}`,
        exercises: [],
        userId: user.id,
      });
      setOriginalPlanCompositionIds([]);

      // Fetch user's workout plan
      const planResponse = await axios.get(
        `http://localhost:3005/plan-composition/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Store original plan composition IDs
      const planCompositionIds = planResponse.data.map((entry: any) => entry.id);
      setOriginalPlanCompositionIds(planCompositionIds);

      // Fetch exercise details for each plan entry
      const exercisesWithDetails = await Promise.all(
        planResponse.data.map(async (planEntry: any) => {
          const exerciseResponse = await axios.get(
            `http://localhost:3005/exercise/${planEntry.exerciseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          return {
            planCompositionId: planEntry.id,
            day: planEntry.day,
            muscle: exerciseResponse.data.targetBodyPart,
            exercise: exerciseResponse.data.exerciseName,
            sets: planEntry.numberOfSets,
            reps: planEntry.numberOfRepetitions,
            observations: planEntry.observations || ""
          };
        })
      );

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
    const token = localStorage.getItem("token");

    try {
      if (!token) throw new Error("Token de acesso não encontrado");
      if (!formData.userId) throw new Error("Selecione um aluno primeiro");

      // Process updates and new entries
      for (const exercise of formData.exercises) {
        if (exercise.planCompositionId) {
          // Update existing entry (PATCH)
          await axios.patch(
            `http://localhost:3005/plan-composition/${exercise.planCompositionId}`,
            {
              day: exercise.day,
              numberOfSets: exercise.sets,
              numberOfRepetitions: exercise.reps,
              observations: exercise.observations,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Create new entry (POST)
          // Find exercise ID by name and muscle
          const exerciseResponse = await axios.get("http://localhost:3005/exercise", {
            params: {
              exerciseName: exercise.exercise,
              targetBodyPart: exercise.muscle,
            },
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!exerciseResponse.data.length) {
            throw new Error(`Exercício '${exercise.exercise}' não encontrado para ${exercise.muscle}`);
          }

          await axios.post(
            "http://localhost:3005/plan-composition",
            {
              exerciseId: exerciseResponse.data[0].id,
              userId: formData.userId,
              day: exercise.day,
              numberOfSets: exercise.sets,
              numberOfRepetitions: exercise.reps,
              observations: exercise.observations,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      // Process deletions
      const currentIds = formData.exercises
        .map(e => e.planCompositionId)
        .filter((id): id is number => !!id);

      const idsToDelete = originalPlanCompositionIds.filter(id => !currentIds.includes(id));

      for (const id of idsToDelete) {
        await axios.delete(
          `http://localhost:3005/plan-composition/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage({ type: "success", text: "Treino salvo com sucesso!" });
      setOriginalPlanCompositionIds(currentIds.filter(id => !!id) as number[]);
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