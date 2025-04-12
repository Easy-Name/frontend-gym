"use client";

import { useEffect, useState, CSSProperties } from "react";

type Exercise = {
  day: string;
  muscle: string;
  exercise: string;
  sets: number;
  reps: number;
  observations?: string;
};

interface ExerciseTableProps {
  exercises: Exercise[];
  onExerciseChange: (index: number, field: keyof Exercise, value: string | number) => void;
  onExerciseRemove: (index: number) => void;
}

export default function ExerciseTable({
                                        exercises,
                                        onExerciseChange,
                                        onExerciseRemove,
                                      }: ExerciseTableProps) {
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [exercisesByMuscle, setExercisesByMuscle] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/exercise`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch exercises");
        const data = await response.json();

        // Extract unique muscle groups
        const muscles = Array.from(new Set(data.map((ex: any) => ex.targetBodyPart))) as string[];
        setMuscleGroups(muscles);

        // Group exercises by muscle
        const grouped = data.reduce((acc: Record<string, string[]>, ex: any) => {
          const muscle = ex.targetBodyPart;
          if (!acc[muscle]) acc[muscle] = [];
          acc[muscle].push(ex.exerciseName);
          return acc;
        }, {});
        setExercisesByMuscle(grouped);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchExercises();
  }, []);

  const styles: Record<string, CSSProperties> = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "2rem",
      backgroundColor: "white"
    },
    tableHeader: {
      background: "#f8fafc",
      padding: "1rem",
      textAlign: "left",
      fontWeight: 600,
      borderBottom: "2px solid #e2e8f0"
    },
    tableCell: {
      padding: "1rem",
      borderBottom: "1px solid #e2e8f0"
    },
    input: {
      padding: "0.5rem",
      borderRadius: "0.25rem",
      border: "1px solid #e2e8f0",
      width: "100%",
      fontSize: "0.875rem"
    },
    removeButton: {
      cursor: "pointer",
      color: "#ef4444",
      background: "none",
      border: "none",
      padding: "0.25rem"
    }
  };

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.tableHeader}>Dia</th>
          <th style={styles.tableHeader}>Músculo</th>
          <th style={styles.tableHeader}>Exercício</th>
          <th style={styles.tableHeader}>Séries</th>
          <th style={styles.tableHeader}>Repetições</th>
          <th style={styles.tableHeader}>Observações</th>
          <th style={styles.tableHeader}></th>
        </tr>
      </thead>
      <tbody>
        {exercises.map((exercise, index) => (
          <tr key={index}>
            <td style={styles.tableCell}>
              <select
                style={styles.input}
                value={exercise.day}
                onChange={(e) => onExerciseChange(index, "day", e.target.value)}
              >
                <option value="">Selecione</option>
                {["A", "B", "C", "D", "E", "F"].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </td>
            <td style={styles.tableCell}>
              <select
                style={styles.input}
                value={exercise.muscle}
                onChange={(e) => onExerciseChange(index, "muscle", e.target.value)}
              >
                <option value="">Selecione</option>
                {muscleGroups.map((muscle) => (
                  <option key={muscle} value={muscle}>
                    {muscle}
                  </option>
                ))}
              </select>
            </td>
            <td style={styles.tableCell}>
              <select
                style={styles.input}
                value={exercise.exercise}
                onChange={(e) => onExerciseChange(index, "exercise", e.target.value)}
                disabled={!exercise.muscle}
              >
                <option value="">Selecione</option>
                {exercisesByMuscle[exercise.muscle]?.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </td>
            <td style={styles.tableCell}>
              <input
                style={styles.input}
                type="number"
                min="1"
                value={exercise.sets}
                onChange={(e) => onExerciseChange(index, "sets", parseInt(e.target.value))}
              />
            </td>
            <td style={styles.tableCell}>
              <input
                style={styles.input}
                type="number"
                min="1"
                value={exercise.reps}
                onChange={(e) => onExerciseChange(index, "reps", parseInt(e.target.value))}
              />
            </td>
            <td style={styles.tableCell}>
              <input
                style={styles.input}
                type="text"
                value={exercise.observations || ""}
                onChange={(e) => onExerciseChange(index, "observations", e.target.value)}
                placeholder="Opcional"
              />
            </td>
            <td style={styles.tableCell}>
              <button
                onClick={() => onExerciseRemove(index)}
                style={styles.removeButton}
                title="Remover exercício"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}