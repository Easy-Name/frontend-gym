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
        handleError(error);
      }
    };
    fetchData();
  }, []);

  const handleUserSelect = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");

      setFormData({
        name: "",
        student: `${user.firstName} ${user.lastName}`,
        exercises: [],
        userId: user.id,
      });
      setOriginalPlanCompositionIds([]);

      const planResponse = await axios.get(
        `http://localhost:3005/plan-composition/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const planCompositionIds = planResponse.data.map((entry: any) => entry.id);
      setOriginalPlanCompositionIds(planCompositionIds);

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
      handleError(error);
    }
  };

  const handleError = (error: unknown) => {
    console.error("[Error]", error);
    setMessage({ type: "error", text: "Ocorreu um erro" });
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

      for (const exercise of formData.exercises) {
        if (exercise.planCompositionId) {
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

      setMessage({ type: "success", text: "Treino editado com sucesso !" });
      setOriginalPlanCompositionIds(currentIds.filter(id => !!id) as number[]);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
    header: { fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalContent: {
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      textAlign: 'center' as const,
      minWidth: '300px'
    },
    modalButton: {
      marginTop: '1rem',
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
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

      {message && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <p>{message.text}</p>
            <button
              style={styles.modalButton}
              onClick={() => setMessage(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}