"use client";

import { Plus, Save, MessageCircle } from "lucide-react";

interface ActionButtonsProps {
  onAddExercise: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export default function ActionButtons({ onAddExercise, onSubmit, loading }: ActionButtonsProps) {
  const styles = {
    actionButtons: { display: "flex", gap: "1rem", marginTop: "2rem" },
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
  };

  return (
    <div style={styles.actionButtons}>
      <button style={{ ...styles.button, background: "#3b82f6", color: "white" }} onClick={onAddExercise}>
        <Plus size={16} />
        Adicionar Exercício
      </button>
      <button
        style={{ ...styles.button, background: "#10b981", color: "white" }}
        onClick={onSubmit}
        disabled={loading}
      >
        <Save size={16} />
        {loading ? "Salvando..." : "Salvar Treino"}
      </button>
      <button style={{ ...styles.button, background: "#8b5cf6", color: "white" }}>
        <MessageCircle size={16} />
        Enviar Mensagem
      </button>
    </div>
  );
}
