// ============================================================================================================
// UNCOMMENT WHEN ADDING SUPABASE (The code rn is just a mock version. The commented out thing is what we need)
// ============================================================================================================

/* import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isFirstLaunch: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeFirstLaunch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    // Check for first launch
    checkFirstLaunch();

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      if (!hasLaunched) {
        setIsFirstLaunch(true);
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
    }
  };

  const completeFirstLaunch = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isFirstLaunch,
        signIn,
        signUp,
        signOut,
        completeFirstLaunch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isFirstLaunch: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeFirstLaunch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "auth_user",
  SESSION: "auth_session",
  HAS_LAUNCHED: "hasLaunched",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for first launch
      const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
      if (!hasLaunched) {
        setIsFirstLaunch(true);
      }

      // Check for existing session
      const [storedUser, storedSession] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION),
      ]);

      if (storedUser && storedSession) {
        const parsedUser = JSON.parse(storedUser);
        const parsedSession = JSON.parse(storedSession);
        setUser(parsedUser);
        setSession(parsedSession);
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeFirstLaunch = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, "true");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication - replace with Supabase later
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Check if user exists in mock storage
      const storedUsers = await AsyncStorage.getItem("mock_users");
      const users = storedUsers ? JSON.parse(storedUsers) : {};

      console.log("Stored users:", Object.keys(users));
      console.log("Attempting login with:", normalizedEmail);

      if (!users[normalizedEmail]) {
        throw new Error("User not found. Please sign up first.");
      }

      if (users[normalizedEmail].password !== password) {
        throw new Error("Invalid password");
      }

      // Create mock session
      const mockUser: User = {
        id: users[normalizedEmail].id,
        email: normalizedEmail,
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: `mock_token_${Date.now()}`,
      };

      // Save to storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser)),
        AsyncStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(mockSession)),
      ]);

      setUser(mockUser);
      setSession(mockSession);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Mock sign up - replace with Supabase later
      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();
      
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // Get existing users
      const storedUsers = await AsyncStorage.getItem("mock_users");
      const users = storedUsers ? JSON.parse(storedUsers) : {};

      // Check if user already exists
      if (users[normalizedEmail]) {
        throw new Error("User already exists");
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        password: password, // In production, this would be hashed
      };

      users[normalizedEmail] = newUser;

      // Save users
      await AsyncStorage.setItem("mock_users", JSON.stringify(users));

      console.log("User created:", normalizedEmail);

      // Auto sign in after sign up
      await signIn(normalizedEmail, password);
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.SESSION),
      ]);

      setUser(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isFirstLaunch,
        signIn,
        signUp,
        signOut,
        completeFirstLaunch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};