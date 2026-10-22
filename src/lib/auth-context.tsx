"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  enrolledTrack?: string;
}

export const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: "usr-admin-01",
    name: "SkillNova Administrator",
    email: "admin@skillnova.edu",
    role: "admin",
    enrolledTrack: "System Infrastructure & Security",
  },
  {
    id: "usr-student-soniya",
    name: "Soniya Sharma",
    email: "soniya@skillnova.edu",
    role: "student",
    enrolledTrack: "Generative AI & LLM Systems",
  },
  {
    id: "usr-student-mohit",
    name: "Mohit Kumar",
    email: "mohit@skillnova.edu",
    role: "student",
    enrolledTrack: "Generative AI & LLM Systems",
  },
  {
    id: "tch-201",
    name: "Dr. Aryan Mehta",
    email: "aryan.mehta@skillnova.edu",
    role: "teacher",
    enrolledTrack: "AI & Distributed Systems Faculty",
  },
];

interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile) => void;
  switchAccount: (email: string) => void;
  logout: () => void;
}

const defaultUser: UserProfile = PRESET_ACCOUNTS[0]; // Administrator

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setRole: () => {},
  setUser: () => {},
  switchAccount: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillnova_current_user");
      if (saved) {
        setUserState(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    try {
      localStorage.setItem("skillnova_current_user", JSON.stringify(newUser));
    } catch {}
  };

  const switchAccount = (email: string) => {
    const target = PRESET_ACCOUNTS.find((a) => a.email === email);
    if (target) {
      setUser(target);
    }
  };

  const setRole = (role: UserRole) => {
    if (role === "admin") {
      setUser(PRESET_ACCOUNTS[0]);
    } else if (role === "teacher") {
      setUser(PRESET_ACCOUNTS[3]);
    } else {
      setUser(PRESET_ACCOUNTS[1]); // Soniya by default for student
    }
  };

  const logout = () => {
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, setRole, setUser, switchAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
