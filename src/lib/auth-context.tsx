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

interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

const defaultUser: UserProfile = {
  id: "std-101",
  name: "Arjun Verma",
  email: "arjun.verma@nit.ac.in",
  role: "student",
  avatarUrl: "",
  enrolledTrack: "Generative AI & LLM Systems",
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setRole: () => {},
  setUser: () => {},
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

  const setRole = (role: UserRole) => {
    let updated: UserProfile;
    if (role === "teacher") {
      updated = {
        id: "tch-201",
        name: "Dr. Aryan Mehta",
        email: "aryan.mehta@skillnova.edu",
        role: "teacher",
        enrolledTrack: "AI & Distributed Systems Faculty",
      };
    } else if (role === "admin") {
      updated = {
        id: "adm-001",
        name: "Campus Admin",
        email: "admin@skillnova.edu",
        role: "admin",
        enrolledTrack: "System Operations",
      };
    } else {
      updated = defaultUser;
    }
    setUser(updated);
  };

  const logout = () => {
    setUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, setRole, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
