"use client";

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
  muscleGroups: string[];
  exercisesByMuscle: Record<string, string[]>;
  onExerciseChange: (index: number, field: keyof Exercise, value: string | number) => void;
}

export default function ExerciseTable({
  exercises,
  muscleGroups,
  exercisesByMuscle,
  onExerciseChange,
}: ExerciseTableProps) {
  const styles = {
    table: { width: "100%", borderCollapse: "collapse", marginTop: "2rem", backgroundColor: "white" },
    tableHeader: { background: "#f8fafc", padding: "1rem", textAlign: "left" as const, fontWeight: 600, borderBottom: "2px solid #e2e8f0" },
    tableCell: { padding: "1rem", borderBottom: "1px solid #e2e8f0", "&:lastChild": { width: "250px" } },
    input: { padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #e2e8f0", width: "100%", fontSize: "0.875rem" },
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
