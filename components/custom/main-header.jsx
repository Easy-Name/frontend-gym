"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import NavLink from "./nav-link";
import { Dumbbell, Users, ClipboardList, Settings, Activity } from "lucide-react";

export default function MainNavHeader() {
    const [userFirstName, setUserFirstName] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
                const response = await axios.get("http://localhost:3005/professor/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Capitalize the first letter of the first name
                const capitalizedFirstName = response.data.firstName.charAt(0).toUpperCase() + response.data.firstName.slice(1);
                setUserFirstName(capitalizedFirstName);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <header className="bg-gradient-to-b from-gray-50 to-white text-foreground shadow-sm">
            <nav className="container mx-auto flex h-20 items-center justify-between px-8">
                {/* Left-aligned Brand + Navigation */}
                <div className="flex items-center space-x-10">
                    {/* Brand Section */}
                    <div className="flex items-center space-x-3">
                        <Dumbbell className="h-7 w-7 text-primary" />
                        <span className="text-xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                                Power
                            </span>
                            <span className="ml-1">Gym</span>
                        </span>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-8">
                        <NavLink
                            href="/manage-users"
                            className="group relative flex items-center space-x-3 rounded-lg py-2.5 transition-all hover:bg-primary/10"
                            activeClassName="bg-primary/10 text-primary font-semibold"
                        >
                            <Users className="h-5 w-5 shrink-0 text-current" />
                            <span className="text-sm font-medium">Gerenciar Alunos</span>
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-30 group-[&.active]:opacity-100" />
                        </NavLink>

                        <NavLink
                            href="/manage-plans"
                            className="group relative flex items-center space-x-3 rounded-lg py-2.5 transition-all hover:bg-primary/10"
                            activeClassName="bg-primary/10 text-primary font-semibold"
                        >
                            <ClipboardList className="h-5 w-5 shrink-0 text-current" />
                            <span className="text-sm font-medium">Gerenciar Treinos</span>
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-30 group-[&.active]:opacity-100" />
                        </NavLink>

                        <NavLink
                            href="/manage-exercises"
                            className="group relative flex items-center space-x-3 rounded-lg py-2.5 transition-all hover:bg-primary/10"
                            activeClassName="bg-primary/10 text-primary font-semibold"
                        >
                            <Activity className="h-5 w-5 shrink-0 text-current" />
                            <span className="text-sm font-medium">Gerenciar Exercícios</span>
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 transition-opacity group-hover:opacity-30 group-[&.active]:opacity-100" />
                        </NavLink>
                    </div>
                </div>

                {/* Right-aligned User Section */}
                <div className="flex items-center space-x-4">
                    <NavLink
                        href="/admin"
                        className="group relative flex items-center space-x-2 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-primary/10"
                        activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                        <Settings className="h-5 w-5 text-current" />
                        <span className="font-bold text-primary">
                            Olá {userFirstName}!
                        </span>
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}