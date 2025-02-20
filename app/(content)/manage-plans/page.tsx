"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Dumbbell, Clock, Calendar, Flame } from "lucide-react";

type WorkoutPlan = {
    id: number;
    name: string;
    category: string;
    duration: number;
    difficulty: string;
    exercises: string[];
};

type FormData = Omit<WorkoutPlan, "id">;

export default function ManageWorkoutsPage() {
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        category: "Musculação",
        duration: 60,
        difficulty: "Iniciante",
        exercises: [],
    });
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [activeOperation, setActiveOperation] = useState<
        "create" | "update" | "delete" | null
    >(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
        null
    );

    const styles = {
        container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
        header: { fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" },
        buttonGroup: { marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" },
        button: {
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        card: {
            background: "#ffffff",
            borderRadius: "1rem",
            padding: "2rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            marginBottom: "2rem",
        },
        inputGroup: { marginBottom: "1.5rem", display: "grid", gap: "1rem" },
        input: {
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #e2e8f0",
            width: "100%",
            fontSize: "1rem",
        },
        difficultyBadge: {
            padding: "0.25rem 0.75rem",
            borderRadius: "999px",
            fontSize: "0.875rem",
            fontWeight: 500,
        },
        table: { width: "100%", borderCollapse: "collapse", marginTop: "2rem" },
        tableHeader: {
            background: "#f8fafc",
            padding: "1rem",
            textAlign: "left" as const,
            fontWeight: 600,
        },
        tableCell: { padding: "1rem", borderBottom: "1px solid #e2e8f0" },
        message: {
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
            background: "#48bb78",
            color: "white",
        },
        error: { background: "#f56565" },
    };

    const difficultyColors: { [key: string]: string } = {
        Iniciante: "#48bb78",
        Intermediário: "#ecc94b",
        Avançado: "#f56565",
    };

    useEffect(() => {
        const fetchWorkoutPlans = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Token de autenticação não encontrado");
                }

                const response = await axios.get("http://localhost:3005/workout-plans", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    timeout: 5000 // Timeout de 5 segundos
                });

                if (response.status !== 200) {
                    throw new Error(`Erro na API: ${response.statusText}`);
                }

                setPlans(response.data);
            } catch (error) {
                handleError(error, "Falha ao carregar planos de treino");
                // Opcional: Adicionar dados mockados para desenvolvimento
                if (process.env.NODE_ENV === "development") {
                    setPlans([{
                        id: 1,
                        name: "Plano de Treino Inicial",
                        category: "Musculação",
                        duration: 60,
                        difficulty: "Iniciante",
                        exercises: ["Supino", "Agachamento", "Levantamento Terra"]
                    }]);
                }
            }
        };

        fetchWorkoutPlans();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token de autenticação não encontrado");

            const endpoint = activeOperation === "create"
                ? "http://localhost:3005/workout-plans"
                : `http://localhost:3005/workout-plans/${selectedPlanId}`;

            const method = activeOperation === "create" ? "post" : "patch";

            const response = await axios[method](endpoint, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (activeOperation === "create") {
                setPlans([...plans, { ...formData, id: Date.now() }]);
            } else {
                setPlans(plans.map(plan => plan.id === selectedPlanId ? response.data : plan));
            }

            resetForm();
            setMessage({ type: "success", text: `Plano ${activeOperation === "create" ? "criado" : "atualizado"} com sucesso!` });
        } catch (error) {
            handleError(error, `Falha ao ${activeOperation === "create" ? "criar" : "atualizar"} plano`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanId) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token de autenticação não encontrado");

            await axios.delete(`http://localhost:3005/workout-plans/${selectedPlanId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setPlans(plans.filter(plan => plan.id !== selectedPlanId));
            resetForm();
            setMessage({ type: "success", text: "Plano excluído com sucesso!" });
        } catch (error) {
            handleError(error, "Falha ao excluir plano");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: "", category: "Musculação", duration: 60, difficulty: "Iniciante", exercises: [] });
        setSelectedPlanId(null);
        setActiveOperation(null);
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

        console.error('[Workout Error]', errorMessage);
        setMessage({ type: "error", text: errorMessage });
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <Dumbbell size={32} />
                <h1>Gerenciar Treinos</h1>
            </div>

            {message && (
                <div style={{ ...styles.message, ...(message.type === "error" && styles.error) }}>
                    {message.text}
                </div>
            )}

            <div style={styles.buttonGroup}>
                <button
                    style={{ ...styles.button, background: "#4299e1", color: "white" }}
                    onClick={() => setActiveOperation("create")}
                >
                    <Flame size={18} />
                    Novo Plano
                </button>
                <button
                    style={{ ...styles.button, background: "#48bb78", color: "white" }}
                    onClick={() => setActiveOperation("update")}
                >
                    <Calendar size={18} />
                    Editar Plano
                </button>
                <button
                    style={{ ...styles.button, background: "#f56565", color: "white" }}
                    onClick={() => setActiveOperation("delete")}
                >
                    <Clock size={18} />
                    Excluir Plano
                </button>
            </div>

            {(activeOperation && activeOperation !== "delete") && (
                <div style={styles.card}>
                    <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 600 }}>
                        {activeOperation === "create" ? "Criar Novo Plano" : "Editar Plano Existente"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <input
                                style={styles.input}
                                name="name"
                                placeholder="Nome do Plano"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />

                            <select
                                style={styles.input}
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="Musculação">Musculação</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Funcional">Funcional</option>
                                <option value="Crossfit">Crossfit</option>
                            </select>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <select
                                    style={{ ...styles.input, flex: 1 }}
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Iniciante">Iniciante</option>
                                    <option value="Intermediário">Intermediário</option>
                                    <option value="Avançado">Avançado</option>
                                </select>

                                <div style={{ position: "relative", flex: 1 }}>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <span style={{
                                        position: "absolute",
                                        right: "1rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#718096"
                                    }}>
                    minutos
                  </span>
                                </div>
                            </div>

                            <button
                                style={{
                                    ...styles.button,
                                    background: activeOperation === "create" ? "#4299e1" : "#48bb78",
                                    color: "white",
                                    width: "100%",
                                }}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Processando..." : activeOperation === "create" ? "Criar Plano" : "Salvar Alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeOperation === "delete" && (
                <div style={styles.card}>
                    <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 600 }}>
                        Excluir Plano de Treino
                    </h2>

                    <form onSubmit={handleDelete}>
                        <select
                            style={styles.input}
                            value={selectedPlanId || ""}
                            onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                            required
                        >
                            <option value="" disabled>Selecione um plano</option>
                            {plans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </select>

                        <button
                            style={{ ...styles.button, background: "#f56565", color: "white", width: "100%", marginTop: "1rem" }}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Excluindo..." : "Confirmar Exclusão"}
                        </button>
                    </form>
                </div>
            )}

            <div style={styles.card}>
                <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 600 }}>
                    Planos de Treino Ativos
                </h2>

                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.tableHeader}>Nome</th>
                        <th style={styles.tableHeader}>Categoria</th>
                        <th style={styles.tableHeader}>Duração</th>
                        <th style={styles.tableHeader}>Dificuldade</th>
                    </tr>
                    </thead>
                    <tbody>
                    {plans.map(plan => (
                        <tr key={plan.id}>
                            <td style={styles.tableCell}>{plan.name}</td>
                            <td style={styles.tableCell}>{plan.category}</td>
                            <td style={styles.tableCell}>{plan.duration} min</td>
                            <td style={styles.tableCell}>
                  <span style={{
                      ...styles.difficultyBadge,
                      background: difficultyColors[plan.difficulty] + "20",
                      color: difficultyColors[plan.difficulty]
                  }}>
                    {plan.difficulty}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}